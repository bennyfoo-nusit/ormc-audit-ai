---
name: java-spring-boot
description: >
  Spring Boot-specific conventions for NUS Java applications. Covers Spring Boot
  application entry point, auto-configuration, @ConfigurationProperties, profiles
  (spring.profiles.active), externalized configuration, actuator, and Boot-specific
  packaging conventions. Apply this skill only when the repository is a Spring Boot
  application. Do NOT apply to Spring MVC-only (non-Boot) applications.
---

# Java – Spring Boot (NUS defaults; pragmatic)

> **Scope:** Spring Boot application setup, auto-configuration, externalized configuration
> (`@ConfigurationProperties`, `application.properties` / `application.yml`), profiles,
> Actuator, and Boot-specific packaging / startup conventions.
>
> **Applicability:**
> - ✅ **Spring Boot applications only.** Apply this skill when `spring-boot-starter-*`
>   dependencies are present and the application uses `@SpringBootApplication`.
> - ❌ **Do NOT apply** to plain Spring MVC applications that do not use Spring Boot.
>   For those, use the Spring MVC skill instead.
>
> **See also:**
> - Coding skill (boundary-safe errors + sensitive data + review checklist): `.github/skills/coding/SKILL.md`
> - Java umbrella skill (Java idioms + defaults): `.github/skills/java/SKILL.md`
> - Spring MVC skill (DispatcherServlet, WebMvcConfigurer, CORS, interceptors): `.github/skills/java/spring-mvc/SKILL.md`
> - Java REST API skill (endpoint style, DTOs, response envelopes, error mapping): `.github/skills/java/rest-api/SKILL.md`
> - Java Spring Controller skill (binding, multipart, advice mechanics, slice testing): `.github/skills/java/spring-controller/SKILL.md`
> - Java Spring Service skill (service-layer conventions, @Transactional): `.github/skills/java/spring-service/SKILL.md`
> - Java Spring Security skill (SecurityFilterChain, JWT, method security): `.github/skills/java/spring-security/SKILL.md`
> - Java JPA skill (entities/repositories, fetching, OSIV, N+1): `.github/skills/java/jpa/SKILL.md`
> - Java JDBC skill (JdbcTemplate/NamedParameterJdbcTemplate + SQL patterns): `.github/skills/java/jdbc/SKILL.md`

---

## A) Existing codebase rule (MOST IMPORTANT)

For an **existing Boot application**, you **MUST** follow the repo's established patterns for:
- Properties file format (`application.properties` vs `application.yml`) and existing property keys.
- Profile strategy already in use (naming convention, activation method).
- Existing `@ConfigurationProperties` classes — do not duplicate or restructure.
- Actuator endpoint exposure configuration already in place.
- Main application class location (package root) and any existing `@SpringBootApplication`
  excludes or scanner config.

You **MUST NOT** restructure the application's configuration model or migrate between properties
formats (`.properties` ↔ `.yml`) unless explicitly requested.

---

## B) Application entry point

```java
// Main class must be in the root package (scanned by @SpringBootApplication by default)
package nus.example;

@SpringBootApplication
public class ExampleApplication {

    public static void main(String[] args) {
        SpringApplication.run(ExampleApplication.class, args);
    }
}
```

**Rules:**
- `@SpringBootApplication` combines `@Configuration`, `@EnableAutoConfiguration`, and
  `@ComponentScan`. Do not add these annotations separately to the same class.
- The main class **MUST** be in the root package so that component scanning covers all
  sub-packages automatically. Do not use `scanBasePackages` unless the repo already does.
- Do not add custom beans to the main application class; use dedicated `@Configuration` classes.

---

## C) Externalized configuration

### C.1 Properties vs YAML
- Follow the format already in use (`application.properties` or `application.yml`).
- Both formats are equally supported; do not mix formats without a clear reason.

### C.2 @ConfigurationProperties (preferred for structured config)

Use `@ConfigurationProperties` for structured, type-safe configuration. Prefer it over
`@Value` for any configuration with more than one related property.

```java
// Configuration properties class — plain Spring style (no Lombok)
@ConfigurationProperties(prefix = "nus.storage")
public class StorageProperties {

    private String bucket;
    private long maxFileSizeBytes;
    private int retryAttempts;

    public String getBucket() {
        return bucket;
    }

    public void setBucket(String bucket) {
        this.bucket = bucket;
    }

    public long getMaxFileSizeBytes() {
        return maxFileSizeBytes;
    }

    public void setMaxFileSizeBytes(long maxFileSizeBytes) {
        this.maxFileSizeBytes = maxFileSizeBytes;
    }

    public int getRetryAttempts() {
        return retryAttempts;
    }

    public void setRetryAttempts(int retryAttempts) {
        this.retryAttempts = retryAttempts;
    }
}
```

**Enable `@ConfigurationProperties` scanning:**

```java
// Option A: on the main application class or a @Configuration class
@EnableConfigurationProperties(StorageProperties.class)
```

```java
// Option B (Spring Boot 2.2+): add @ConfigurationPropertiesScan to the main class
@SpringBootApplication
@ConfigurationPropertiesScan
public class ExampleApplication { ... }
```

**Use in a service:**
```java
@Service
public class StorageService {

    private final StorageProperties storageProperties;

    public StorageService(StorageProperties storageProperties) {
        this.storageProperties = storageProperties;
    }

    public void upload(String key, byte[] data) {
        if (data.length > storageProperties.getMaxFileSizeBytes()) {
            throw new ValidationException("File exceeds maximum allowed size");
        }
        // ... upload logic
    }
}
```

**Rules:**
- `@ConfigurationProperties` classes **MUST** have getters and setters (plain Spring style).
- Property keys in `application.properties` **SHOULD** use kebab-case
  (`nus.storage.max-file-size-bytes`); Spring Boot binds them to camelCase fields automatically.
- Validation **MAY** be added via `@Validated` + JSR-303 annotations on the properties class.
- Secrets (passwords, API keys) **MUST NOT** be committed to `application.properties` /
  `application.yml`; use environment variables or a secret manager.

### C.3 @Value (acceptable for single isolated properties)

```java
@Value("${nus.feature.enabled:false}")
private boolean featureEnabled;
```

- `@Value` **MAY** be used for simple, isolated properties.
- **MUST** provide a default value where a missing property should not cause startup failure.
- **SHOULD NOT** use `@Value` for groups of related properties; prefer `@ConfigurationProperties`.

---

## D) Profiles

### D.1 Profile naming convention
Follow the existing repo convention. Common NUS defaults:
- `dev` — local development
- `sit` — system integration testing
- `uat` — user acceptance testing
- `prod` — production

### D.2 Profile-specific properties files
```
application.properties          # shared defaults
application-dev.properties      # overrides for dev
application-sit.properties      # overrides for sit
application-prod.properties      # overrides for prod
```

**Rules:**
- Profile-specific properties **SHOULD** only override values that differ from the base file.
- `spring.profiles.active` **MUST NOT** be set to `prod` in the base `application.properties`
  (use the deployment environment to activate the correct profile).
- Sensitive values (DB passwords, API keys) **MUST** come from the environment, not from
  profile-specific properties files.

### D.3 @Profile on beans
Use `@Profile` to conditionally register beans for specific environments:

```java
@Bean
@Profile("dev")
public DataSource embeddedDataSource() {
    return new EmbeddedDatabaseBuilder()
            .setType(EmbeddedDatabaseType.H2)
            .build();
}
```

- Use sparingly; prefer externalized configuration over conditional bean registration where
  possible.

---

## E) Auto-configuration

### E.1 Do not fight auto-configuration
- Accept Boot's auto-configuration defaults unless there is a specific reason to override.
- To customize, use `WebMvcConfigurer`, `@ConfigurationProperties`, or Boot property bindings
  rather than declaring replacement beans.

### E.2 Excluding auto-configuration classes
Exclude only when you have a specific technical reason:

```java
@SpringBootApplication(exclude = { DataSourceAutoConfiguration.class })
public class ExampleApplication { ... }
```

- **MUST NOT** exclude auto-configuration classes speculatively; each exclusion **MUST** be
  justified by a comment.

### E.3 @EnableWebMvc rule
- **MUST NOT** add `@EnableWebMvc` to any `@Configuration` class in a Spring Boot application.
  It disables Boot's MVC auto-configuration (message converters, view resolvers, property
  binding). See Spring MVC skill Section B.2 for details.

---

## F) Spring Boot Actuator

### F.1 Endpoint exposure
- Actuator endpoints **MUST NOT** be exposed publicly without authentication.
- For production, expose only the health endpoint publicly and require authentication for others:

```yaml
# application-prod.yml
management:
  endpoints:
    web:
      exposure:
        include: health
  endpoint:
    health:
      show-details: never
```

### F.2 Health indicators
- Custom health indicators **SHOULD** use `AbstractHealthIndicator` and return boundary-safe
  status messages (no internal hostnames, DB connection strings, or secrets in detail output).

```java
@Component
public class DownstreamSystemHealthIndicator extends AbstractHealthIndicator {

    private final DownstreamClient client;

    public DownstreamSystemHealthIndicator(DownstreamClient client) {
        this.client = client;
    }

    @Override
    protected void doHealthCheck(Health.Builder builder) {
        if (client.isAvailable()) {
            builder.up();
        } else {
            builder.down().withDetail("reason", "Downstream system unavailable");
        }
    }
}
```

---

## G) Application packaging

### G.1 Fat JAR (executable JAR)
- Spring Boot produces a fat (executable) JAR by default via the `spring-boot-maven-plugin`.
- Ensure the plugin is configured in `pom.xml`:

```xml
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
</plugin>
```

### G.2 WAR deployment (optional)
For WAR deployment to an external container, extend `SpringBootServletInitializer`:

```java
@SpringBootApplication
public class ExampleApplication extends SpringBootServletInitializer {

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
        return builder.sources(ExampleApplication.class);
    }

    public static void main(String[] args) {
        SpringApplication.run(ExampleApplication.class, args);
    }
}
```

- Set `<packaging>war</packaging>` in `pom.xml` and mark the embedded container dependency as
  `<scope>provided</scope>`.
- Follow existing repo packaging approach; do not introduce a new packaging model without request.

---

## H) Testing (Spring Boot test slices)

### H.1 @SpringBootTest
Use `@SpringBootTest` for integration tests that need the full application context:

```java
@SpringBootTest
@AutoConfigureMockMvc
class AccountControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void createAccount_shouldReturn201() throws Exception {
        // ... test using mockMvc
    }
}
```

### H.2 Test slices
Prefer targeted test slices over full `@SpringBootTest` where practical:
- `@WebMvcTest` — controller + MVC layer only.
- `@DataJpaTest` — JPA layer only.
- `@JdbcTest` — JDBC layer only.
- `@DataJdbcTest` — Spring Data JDBC layer only.

**Rules:**
- Do not load the full context for tests that only need a single layer.
- Follow the existing test approach in the repo; do not introduce a new test slice style without
  checking whether it is already used.

---

## Review checklist (agent-use)

When reviewing or generating Spring Boot application code, verify:

- [ ] `@SpringBootApplication` is on the main class in the root package
- [ ] No `@EnableWebMvc` in any `@Configuration` class (see Section E.3)
- [ ] `@ConfigurationProperties` used for structured config; getters/setters present (no Lombok)
- [ ] Secrets not committed in `application.properties` / `application.yml`
- [ ] Profile strategy follows existing repo conventions
- [ ] Actuator not exposing sensitive endpoints without authentication
- [ ] Custom health indicators return boundary-safe output (no hostnames, connection strings, secrets)
- [ ] Auto-configuration exclusions are commented and justified
- [ ] Boot test slices used where appropriate; `@SpringBootTest` reserved for full integration tests
- [ ] No duplicate bean declarations that conflict with Boot auto-configuration
