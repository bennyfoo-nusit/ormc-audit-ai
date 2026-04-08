---
name: java-spring-mvc
description: >
  Spring MVC configuration and wiring conventions for NUS Java applications.
  Covers DispatcherServlet setup, MVC configuration (@EnableWebMvc, WebMvcConfigurer),
  view resolvers, message converters, handler mappings, interceptors, CORS, and
  static resource serving. Applicable to both standalone Spring MVC applications
  (no Spring Boot) and Spring Boot applications that use Spring MVC.
  Use this skill when reviewing or implementing Spring MVC infrastructure configuration.
---

# Java – Spring MVC (NUS defaults; pragmatic)

> **Scope:** Spring MVC infrastructure configuration — `DispatcherServlet`, `@EnableWebMvc`,
> `WebMvcConfigurer`, message converters, view resolvers, interceptors, CORS, static
> resources, and multipart configuration. Not for API contract rules or controller mechanics.
>
> **Applicability:**
> - ✅ **Spring MVC-only applications** (no Spring Boot; web.xml or programmatic servlet init).
> - ✅ **Spring Boot + MVC applications** (Boot auto-configures MVC; `WebMvcConfigurer` beans
>   extend the defaults without breaking Boot's auto-configuration; see Section B).
>
> **See also:**
> - Coding skill (boundary-safe errors + sensitive data + review checklist): `.github/skills/coding/SKILL.md`
> - Java umbrella skill (Java idioms + defaults): `.github/skills/java/SKILL.md`
> - Java REST API skill (endpoint style, DTOs, response envelopes, error mapping): `.github/skills/java/rest-api/SKILL.md`
> - Java Spring Controller skill (binding, multipart, advice mechanics, slice testing): `.github/skills/java/spring-controller/SKILL.md`
> - Java Spring Service skill (service-layer conventions, @Transactional): `.github/skills/java/spring-service/SKILL.md`
> - Java Spring Security skill (SecurityFilterChain, JWT, method security): `.github/skills/java/spring-security/SKILL.md`
> - Java JPA skill (entities/repositories, fetching, OSIV, N+1): `.github/skills/java/jpa/SKILL.md`
> - Java JDBC skill (JdbcTemplate/NamedParameterJdbcTemplate + SQL patterns): `.github/skills/java/jdbc/SKILL.md`
> - Spring Boot skill (Boot-specific auto-configuration, properties, profiles): `.github/skills/java/spring-boot/SKILL.md`

---

## A) Existing codebase rule (MOST IMPORTANT)

For an **existing application**, you **MUST** follow the repo's established patterns for:
- Servlet initializer style (`web.xml` vs `AbstractAnnotationConfigDispatcherServletInitializer`
  vs Spring Boot embedded container).
- Whether `@EnableWebMvc` is present (it disables Boot auto-configuration; see B.2).
- Existing `WebMvcConfigurer` beans — their structure and what they customize.
- Message converter order and Jackson/Gson configuration already in place.
- Interceptor and CORS configuration already wired in.
- Existing view resolver setup (Thymeleaf, JSP, FreeMarker, etc.).

You **MUST NOT** introduce `@EnableWebMvc` in a Spring Boot application unless you intend to
fully own all MVC configuration (see B.2). You **MUST NOT** refactor the MVC wiring architecture
(e.g., moving from `web.xml` to Java init, or from Boot auto-config to manual config) unless
explicitly requested.

---

## B) Spring MVC-only vs Spring Boot + MVC (key differences)

### B.1 Spring MVC-only (no Boot)

In a plain Spring MVC application (WAR deployed to a container), the `DispatcherServlet` and
`WebApplicationContext` must be configured explicitly.

**Programmatic initializer (recommended for new MVC-only apps):**
```java
public class WebAppInitializer extends AbstractAnnotationConfigDispatcherServletInitializer {

    @Override
    protected Class<?>[] getRootConfigClasses() {
        return new Class<?>[] { RootConfig.class }; // services, persistence
    }

    @Override
    protected Class<?>[] getServletConfigClasses() {
        return new Class<?>[] { WebConfig.class }; // controllers, MVC config
    }

    @Override
    protected String[] getServletMappings() {
        return new String[] { "/" };
    }
}
```

**MVC configuration class (plain Spring MVC-only):**
```java
@Configuration
@EnableWebMvc
@ComponentScan(basePackages = "nus.example.web")
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        converter.setObjectMapper(objectMapper());
        converters.add(converter);
    }

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.registerModule(new JavaTimeModule());
        return mapper;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new RequestLoggingInterceptor());
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // see Section E for CORS rules
    }
}
```

### B.2 Spring Boot + MVC (Boot auto-configuration)

In a Spring Boot application, MVC is auto-configured. Key rules:

- **MUST NOT** annotate `@Configuration` classes with `@EnableWebMvc` unless you intend to
  **fully replace** Boot's auto-configuration. Doing so silently disables many Boot defaults
  (Jackson auto-configuration, `spring.mvc.*` property binding, etc.).
- **SHOULD** extend MVC configuration by implementing `WebMvcConfigurer` in a
  `@Configuration` bean **without** `@EnableWebMvc`.
- Message converters, view resolvers, and content negotiation **SHOULD** be customized via
  `WebMvcConfigurer` hooks or Spring Boot properties (`spring.mvc.*`, `spring.jackson.*`).

```java
// GOOD: extends Boot's auto-config without replacing it
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new RequestLoggingInterceptor());
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // see Section E for CORS rules
    }
}
```

```java
// BAD: @EnableWebMvc in a Boot app disables auto-configuration
@Configuration
@EnableWebMvc // <-- removes Boot's Jackson/MVC defaults
public class WebConfig implements WebMvcConfigurer { ... }
```

---

## C) Message converters (Jackson defaults)

### C.1 Jackson configuration
- For **Spring Boot** applications, configure Jackson via `application.properties` / `application.yml`
  (prefixed `spring.jackson.*`) or by declaring an `ObjectMapper` bean. Do not call
  `configureMessageConverters` unless replacing all converters.
- For **Spring MVC-only** applications, configure Jackson by adding a
  `MappingJackson2HttpMessageConverter` in `configureMessageConverters`.

**Common Jackson defaults (align with repo):**
```java
@Bean
public ObjectMapper objectMapper() {
    ObjectMapper mapper = new ObjectMapper();
    mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    mapper.registerModule(new JavaTimeModule());
    mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
    return mapper;
}
```

### C.2 Content negotiation
- Default content type **SHOULD** be `application/json` for REST/JSON APIs.
- Do not add `configureContentNegotiation` unless there is a specific requirement (e.g., XML
  support alongside JSON).

---

## D) Interceptors

- Implement `HandlerInterceptor` directly (do not extend `HandlerInterceptorAdapter`; it was removed in Spring 5.3).
- Register via `WebMvcConfigurer#addInterceptors`.
- Common uses: request logging, MDC correlation ID threading, auth pre-check (prefer Spring
  Security filters for auth; interceptors for cross-cutting concerns that are not security).

```java
public class RequestLoggingInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(RequestLoggingInterceptor.class);

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) {
        // log opaque request ID only — no URI params, no body, no auth headers
        String requestId = UUID.randomUUID().toString();
        MDC.put("requestId", requestId);
        log.info("request: method={} uri={} requestId={}",
                request.getMethod(), request.getRequestURI(), requestId);
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request,
                                HttpServletResponse response,
                                Object handler,
                                Exception ex) {
        MDC.clear();
    }
}
```

**Rules:**
- Interceptors **MUST NOT** log sensitive data (query params that carry tokens/PII, request bodies
  with NRIC/FIN, etc.). Log opaque identifiers and request method/path only.
- Auth/authz **SHOULD** be handled in Spring Security filters, not interceptors.

---

## E) CORS configuration

- CORS **SHOULD** be configured via `WebMvcConfigurer#addCorsMappings` (or Spring Boot's
  `spring.mvc.cors.*` if simple enough).
- **MUST NOT** use `@CrossOrigin` on individual controllers for org-wide CORS policy; prefer
  centralized configuration.
- Allowed origins **MUST** be explicitly listed; **MUST NOT** use `*` (wildcard) in production
  configurations that include credentials.

```java
@Override
public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/api/**")
            .allowedOrigins("https://app.example.nus.edu.sg")
            .allowedMethods("GET", "POST", "PUT", "DELETE")
            .allowedHeaders("Authorization", "Content-Type")
            .allowCredentials(true)
            .maxAge(3600);
}
```

---

## F) Static resources

- Serve static resources via `WebMvcConfigurer#addResourceHandlers`.
- For Spring Boot, `src/main/resources/static` is auto-served; do not duplicate the mapping
  unless customizing cache control or path prefix.

```java
@Override
public void addResourceHandlers(ResourceHandlerRegistry registry) {
    registry.addResourceHandler("/static/**")
            .addResourceLocations("classpath:/static/")
            .setCacheControl(CacheControl.maxAge(7, TimeUnit.DAYS));
}
```

---

## G) View resolvers (server-side rendering)

For applications that render server-side views (Thymeleaf, JSP, FreeMarker):

- Declare view resolver beans consistent with the chosen template engine.
- For Spring Boot, the template engine starter auto-configures its view resolver; do not declare
  a duplicate bean unless overriding a property.
- **MUST** follow the existing view technology in the repo; do not introduce a new template engine.

**Example (Spring MVC-only + Thymeleaf):**
```java
@Bean
public ThymeleafViewResolver viewResolver(SpringTemplateEngine templateEngine) {
    ThymeleafViewResolver resolver = new ThymeleafViewResolver();
    resolver.setTemplateEngine(templateEngine);
    resolver.setCharacterEncoding("UTF-8");
    return resolver;
}
```

---

## H) Multipart configuration

For file upload in Spring MVC-only apps, configure `MultipartResolver`:

```java
// Spring MVC-only: CommonsMultipartResolver (commons-fileupload on classpath)
@Bean
public CommonsMultipartResolver multipartResolver() {
    CommonsMultipartResolver resolver = new CommonsMultipartResolver();
    resolver.setMaxUploadSize(10 * 1024 * 1024); // 10 MB
    return resolver;
}
```

For Spring Boot, multipart is auto-configured via `spring.servlet.multipart.*` properties.
**MUST NOT** declare a `CommonsMultipartResolver` bean in Boot unless explicitly required and
Boot's auto-configuration is intentionally disabled.

---

## Review checklist (agent-use)

When reviewing or generating Spring MVC configuration code, verify:

- [ ] `@EnableWebMvc` is **absent** in Spring Boot applications (unless fully replacing Boot auto-config)
- [ ] `WebMvcConfigurer` is used (not `WebMvcConfigurerAdapter`, which is removed in Spring 5.3+)
- [ ] Jackson / message converter configuration does not conflict with Boot auto-config
- [ ] CORS allowed origins are explicit; no wildcard `*` with credentials in production
- [ ] Interceptors do not log sensitive data (tokens, PII, NRIC/FIN)
- [ ] Auth/authz handled in Spring Security, not interceptors
- [ ] Multipart config: Boot uses `spring.servlet.multipart.*`; Spring MVC-only uses `MultipartResolver` bean
- [ ] No `@CrossOrigin` on individual controllers for org-wide policy
- [ ] Follows existing codebase MVC wiring conventions (no architecture rewrite without request)
