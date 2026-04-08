---
name: java-spring-security
description: >
  Practical conventions for Spring Security in NUS Java applications. Covers
  SecurityFilterChain configuration, stateless JWT APIs, request matching, CORS/CSRF,
  PasswordEncoder, JWT claim design, refresh tokens, method-level security, and common
  pitfalls. Use this skill when writing or reviewing Spring Security configuration or
  authentication/authorization logic.
---

# Java – Spring Security (NUS defaults; pragmatic)

> **Scope:** Spring Security configuration (`SecurityFilterChain`), stateless JWT authentication,
> request authorization rules, CORS/CSRF, `PasswordEncoder`, method-level security,
> JWT design (signing, claims, rotation), refresh tokens, and boundary-safe auth errors.
>
> **See also:**
> - Coding skill (boundary-safe errors + sensitive data): `.github/skills/coding/SKILL.md`
> - Java umbrella skill: `.github/skills/java/SKILL.md`
> - Java REST API skill (HTTP contract, headers, response codes): `.github/skills/java/rest-api/SKILL.md`
> - Java Spring Controller skill (MVC wiring; controller auth context access): `.github/skills/java/spring-controller/SKILL.md`
> - Java Spring Service skill (service-layer @PreAuthorize placement, principal access patterns): `.github/skills/java/spring-service/SKILL.md`

## A) Existing codebase rule (MOST IMPORTANT)
- For an **existing application**, you **MUST** follow the repo's established patterns:
  - Auth mechanism already in use (JWT, session-based, API key, OAuth2, LDAP).
  - `Authorization` header convention, token prefix, and custom header names.
  - Existing error response shape for `401`/`403` (do not change envelope shape unilaterally).
  - Logging conventions and whether a correlation ID is already threaded through.
  - Existing `SecurityFilterChain` bean and its `requestMatchers` / `antMatchers` rules.
- You **MUST NOT** introduce a new auth scheme (e.g., switching from session-based to JWT, or adding OAuth2) unless explicitly requested.
- You **MUST NOT** change `permitAll` / `authenticated` rules globally unless explicitly requested; incorrect changes silently break security posture.

## B) SecurityFilterChain (no WebSecurityConfigurerAdapter)
Use the **component-based** `SecurityFilterChain` bean (Spring Security 5.7+). `WebSecurityConfigurerAdapter` is deprecated and **MUST NOT** be used for new code.

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)          // stateless JWT API; see section D
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/login", "/auth/refresh").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```

Key points:
- `SessionCreationPolicy.STATELESS`: server never creates or uses an `HttpSession` for security context; required for JWT APIs.
- `addFilterBefore`: register your `OncePerRequestFilter` JWT filter before the username/password filter so the security context is populated early.
- Do **not** call `http.formLogin()` or `http.httpBasic()` unless the application uses those schemes.

### B.1 Multi SecurityFilterChain (`@Order`) pattern
When different endpoint groups require different auth rules (e.g., actuator vs API), use separate `SecurityFilterChain` beans ordered by priority. **MUST NOT** widen `permitAll` on the main chain to accommodate secondary concerns.

```java
/** Chain 1: actuator endpoints — restrict to internal/admin access only */
@Bean
@Order(1)
public SecurityFilterChain actuatorFilterChain(HttpSecurity http) throws Exception {
    http
        .securityMatcher("/actuator/**")
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/actuator/health").permitAll()
            .anyRequest().hasRole("ACTUATOR_ADMIN") // or restrict to internal network
        )
        .httpBasic(Customizer.withDefaults()); // adjust to repo's admin auth scheme
    return http.build();
}

/** Chain 2: main API endpoints — stateless JWT */
@Bean
@Order(2)
public SecurityFilterChain apiFilterChain(HttpSecurity http, JwtAuthFilter jwtAuthFilter)
        throws Exception {
    http
        .securityMatcher("/api/**")
        .csrf(AbstractHttpConfigurer::disable)
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/v1/auth/**").permitAll()
            .anyRequest().authenticated()
        )
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
}
```

Rules:
- The bean with the **lowest `@Order` number** matches first; unmatched requests fall through to the next chain.
- Each chain's `securityMatcher(...)` **MUST** be tight — use explicit path prefixes, not `/**`.
- **MUST NOT** add a catch-all chain that widens public access beyond what is intentional.
- Follow the repo's existing multi-chain ordering if one is already defined.

## C) Request matching (minimize public surface)
- **MUST** keep the set of `permitAll` paths as small and specific as possible.
- **MUST NOT** use overly broad patterns (e.g., `/api/**`, `/**`) for `permitAll` unless there is a deliberate, documented reason.
- Enumerate only the exact paths that must be unauthenticated (e.g., login, registration, health checks, token refresh).
- For static resources or actuator endpoints, use dedicated `SecurityFilterChain` beans with lower `@Order` rather than widening the main chain.

```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/auth/login", "/auth/register", "/auth/refresh").permitAll()
    .requestMatchers("/actuator/health").permitAll()   // narrow actuator exposure
    .anyRequest().authenticated()
)
```

- Place `anyRequest().authenticated()` (or stricter) as the **last** rule.
- For role-based path rules, prefer method-level `@PreAuthorize` over path-level role matchers where possible — method-level rules are closer to the business logic and easier to audit.

### C.1 Sensitive or internal endpoint exposure
The following endpoint groups **MUST** be decided explicitly — do **not** leave them accidentally public or silently blocked:

- **Actuator endpoints** beyond `/actuator/health` (e.g., `/actuator/env`, `/actuator/beans`, `/actuator/loggers`, `/actuator/heapdump`): these expose internal state and **MUST** be secured or disabled in production.
- **Swagger / OpenAPI docs** (`/swagger-ui/**`, `/v3/api-docs/**`): block or restrict in production unless the API is intentionally public-facing.
- **Internal admin or documentation endpoints** (e.g., `/admin/**`, `/internal/**`): treat as sensitive; require explicit role-based access.

Agents **MUST NOT** accidentally expose these endpoints via overly broad `permitAll` patterns. Follow the repo's established convention for how each group is handled (secured, disabled via `management.endpoints.web.exposure`, or restricted by network policy).

## D) CSRF, CORS, and OPTIONS preflight
### D.1 CSRF
- **Disable CSRF** for stateless REST APIs that authenticate via `Authorization: Bearer <token>` (JWT or opaque token): the token in the header is already a CSRF mitigation.
  ```java
  .csrf(AbstractHttpConfigurer::disable)
  ```
- **Keep CSRF enabled** for session-based applications (browser-facing, form-based, cookie-based). Disabling CSRF in a session-based app is a **security defect**.
- If the existing codebase uses session-based auth, **MUST NOT** disable CSRF without an explicit, documented justification.

### D.2 CORS
- Configure CORS explicitly; do not rely on browser defaults or `@CrossOrigin` scattered across controllers.
- For a Spring Security–managed CORS policy:
  ```java
  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
      CorsConfiguration config = new CorsConfiguration();
      config.setAllowedOrigins(List.of("https://app.example.com")); // explicit origins; wildcards are never safe with credentials
      config.setAllowedMethods(List.of("GET", "POST", "OPTIONS"));
      config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
      config.setAllowCredentials(true);
      UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
      source.registerCorsConfiguration("/**", config);
      return source;
  }
  ```
  Then wire it in the filter chain: `.cors(cors -> cors.configurationSource(corsConfigurationSource()))`.
- **MUST NOT** use `config.setAllowedOrigins(List.of("*"))` combined with `setAllowCredentials(true)` — browsers reject this combination and it is a misconfiguration.

### D.3 OPTIONS preflight
- Spring Security automatically passes `OPTIONS` preflight requests through when CORS is configured via `CorsConfigurationSource`.
- Do **not** manually add `.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()` unless your CORS setup is not integrated with Spring Security — doing so bypasses the CORS filter and may be unsafe.

## E) Authentication vs Authorization separation
- **Authentication filter** (`OncePerRequestFilter`): responsible for validating the token and populating the `SecurityContext`. It **MUST NOT** perform business authorization decisions.
  ```java
  public class JwtAuthFilter extends OncePerRequestFilter {

      private final JwtTokenValidator tokenValidator;
      private final UserDetailsService userDetailsService;

      @Override
      protected void doFilterInternal(HttpServletRequest request,
                                      HttpServletResponse response,
                                      FilterChain chain) throws ServletException, IOException {
          String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
          if (authHeader == null || !authHeader.startsWith("Bearer ")) {
              chain.doFilter(request, response);
              return;
          }
          String token = authHeader.substring(7);
          Claims claims = tokenValidator.validateAndParse(token); // throws on invalid
          UsernamePasswordAuthenticationToken auth =
              new UsernamePasswordAuthenticationToken(claims.getSubject(), null,
                  buildAuthorities(claims));
          SecurityContextHolder.getContext().setAuthentication(auth);
          chain.doFilter(request, response);
      }
  }
  ```
- **Controllers and services**: read roles/claims from `SecurityContextHolder` or via injected `Authentication`. They **MUST NOT** re-validate the raw token.
  ```java
  Authentication auth = SecurityContextHolder.getContext().getAuthentication();
  String subject = (String) auth.getPrincipal();
  ```
- Keep token parsing logic in a dedicated `JwtTokenValidator` / `JwtService` bean — **not** inline in the filter or controller.

### E.1 Authentication principal shape
`Authentication.getPrincipal()` may return different types depending on how the security context was populated:
- A **`String`** (the subject from the `sub` claim) — when `UsernamePasswordAuthenticationToken` is constructed with a raw string principal (as in the JWT filter example above).
- A **`UserDetails`** object — when `UserDetailsService` is involved in token validation.
- A **custom principal type** — when the repo defines its own principal implementation (e.g., a `UserPrincipal` record with additional claims).

Rules:
- **MUST** follow the repo's established principal shape; do not assume it is always a `String`.
- **MUST NOT** refactor or change the principal type in a small PR unless explicitly requested — changing the principal shape silently breaks all callers of `getPrincipal()`.
- If unsure of the repo's principal shape, check the existing `SecurityFilterChain` / JWT filter and usages of `SecurityContextHolder.getContext().getAuthentication()` before writing new code.

## F) PasswordEncoder (BCrypt)
- **MUST** use a `PasswordEncoder` bean for all password storage and comparison. Plain-text passwords are a security defect.
- Default choice is `BCryptPasswordEncoder` (adaptive, widely supported):
  ```java
  @Bean
  public PasswordEncoder passwordEncoder() {
      return new BCryptPasswordEncoder();
  }
  ```
- For new applications, `BCryptPasswordEncoder()` (default strength 10) is sufficient. Increase strength if the security requirement demands it; be aware of the CPU cost.
- **MUST NOT** implement a custom hashing scheme (MD5, SHA-1, SHA-256 without salting) for passwords.
- For existing codebases using legacy schemes, use `DelegatingPasswordEncoder` with migration encoding — do **not** replace existing password hashes with new hashes during login without user consent or a documented, explicit migration strategy.
- Never log or include the raw password or the encoded hash in any response, log, or exception message.

## G) JWT design (signing, claims, expiry, clock skew, key rotation)
### G.1 Signing algorithms
- **MUST** use `HS256` (shared secret, symmetric) or `RS256` (private/public key, asymmetric).
- `RS256` is **PREFERRED** when multiple services need to verify tokens independently (they only need the public key).
- **MUST NOT** use `alg: none` or weak algorithms (MD5-based, HS1, etc.); reject tokens that specify a weak or `none` algorithm.
- For HS256, the secret **MUST** be at least 256 bits (32 bytes), loaded from environment/vault — **MUST NOT** be hardcoded in source code.

### G.2 Standard claims
```java
String token = Jwts.builder()
    .setSubject(user.getUsername())             // "sub": opaque user identifier
    .setIssuer("https://api.example.com")       // "iss": your service
    .setAudience("https://api.example.com")     // "aud": intended recipient
    .setIssuedAt(new Date())                    // "iat"
    .setExpiration(new Date(now + ACCESS_TTL))  // "exp": keep short (15 min typical)
    .claim("roles", user.getRoles())            // custom: list of role strings
    .claim("tenantId", user.getTenantId())      // custom: multi-tenant context (if applicable)
    .signWith(signingKey, SignatureAlgorithm.HS256)
    .compact();
```

- **MUST** validate `iss`, `aud`, `exp`, and `iat` on every token.
- Use an opaque, non-PII subject (`sub`): prefer a stable internal user UUID or system ID, not email address or NRIC.
- `roles` claim: use plain role strings (e.g., `"ROLE_ADMIN"`). Spring Security's `GrantedAuthority` requires the `ROLE_` prefix for role-based `hasRole()` checks — include it in the claim value.
- **MUST NOT** include sensitive personal identifiers in JWT claims: do **not** put NRIC/FIN, email address, phone number, full name, or other PII in claims unless the feature **explicitly requires it**. Use an opaque, stable UUID for `sub` (see above). Tokens are base64-decoded by clients and may be stored in browser storage or logs.

### G.3 Token expiry and clock skew
- **Access token TTL**: short — 15 minutes is a common default. Adjust based on the application's risk profile.
- **Refresh token TTL**: longer — hours to days, depending on use case.
- Allow a small **clock skew** tolerance (e.g., 30–60 seconds) during validation to tolerate minor server clock differences:
  ```java
  Jwts.parserBuilder()
      .setSigningKey(verificationKey)
      .setAllowedClockSkewSeconds(30)
      .requireIssuer("https://api.example.com")
      .requireAudience("https://api.example.com")
      .build()
      .parseClaimsJws(token);
  ```

### G.4 Key rotation
- For HS256, rotate the secret key periodically. Use a key ID (`kid` header) if multiple active keys must coexist during rotation.
- For RS256, use a JWKS endpoint or configuration to publish active public keys; rotate key pairs without downtime by overlapping validity windows.
- **MUST NOT** reuse the same signing key indefinitely without a rotation plan.

### G.5 JWT ID (`jti`) and replay protection
- If `jti` is used, it **MUST** be a globally unique value per token (use UUID or equivalent) and **MUST** rotate with every token issuance — each new access or refresh token gets a fresh, unique `jti`. **MUST NOT** reuse a `jti` across tokens.
- For active replay protection, maintain a short-lived store (cache or DB) of seen or revoked `jti` values and reject any inbound token whose `jti` has already been processed or is on the revocation list.
- If the repo does not implement `jti`-based replay protection, do **not** add it unilaterally; follow the existing revocation strategy (see section H).

## H) Refresh tokens, logout, and revocation
- Refresh tokens are long-lived credentials and **MUST** be stored and managed server-side:
  - Store a hash of the refresh token (not the raw value) in a database or distributed cache keyed by user.
  - On refresh: validate the provided token against the stored hash; issue a new access token (and optionally rotate the refresh token).
  - **MUST** expire refresh tokens and enforce a maximum session lifetime even if the user is active.
- **Revocation**: to support logout or forced revocation (compromised credential, role change):
  - Maintain a **revocation list** (e.g., the token's `jti` claim — JWT ID, a unique identifier per token — stored in cache/DB with TTL matching the original token's remaining life), or
  - Use short-lived access tokens with server-side refresh token invalidation (recommended): invalidate the refresh token on logout; existing access tokens expire naturally within their short TTL.
- **Logout flow**:
  1. Client calls `POST /auth/logout` with its refresh token.
  2. Server invalidates (deletes) the stored refresh token record.
  3. Server responds `200` (or `204`); client discards both tokens.
  4. Access tokens remain technically valid until expiry; rely on their short TTL for gap coverage.
- **MUST NOT** store raw refresh tokens in plain text in the database; store their hash.
- **MUST NOT** return or log refresh tokens in error responses or server logs.

## I) Method-level security (`@PreAuthorize`)
Enable method-level security in your configuration:
```java
@Configuration
@EnableMethodSecurity  // replaces deprecated @EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig { ... }
```

Use `@PreAuthorize` on service or controller methods:
```java
@PreAuthorize("hasRole('ADMIN')")
public void deleteUser(Long userId) { ... }

@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public List<UserResponse> listAllUsers() { ... }

@PreAuthorize("hasRole('USER') and #userId == authentication.principal")
public UserResponse getProfile(String userId) { ... }
```

Rules:
- `hasRole('ADMIN')` checks for `GrantedAuthority` value `"ROLE_ADMIN"` — the `ROLE_` prefix **MUST** be present in the authority string (see G.2).
- `hasAuthority('READ_REPORTS')` checks the exact string without prefix — suitable for permission-based (not role-based) models.
- Method security applies **only** when the call passes through the Spring proxy. Calling a `@PreAuthorize`-annotated method from within the same class bypasses the proxy and skips the check — extract to a separate bean if needed.
- **MUST** enable `@EnableMethodSecurity` explicitly; method-level security annotations have no effect without it.

## J) Boundary-safe errors and sensitive data for auth
Authentication and authorization errors require extra care to avoid information leakage:

### J.1 Never log tokens or credentials
- **MUST NOT** log raw tokens (JWTs, API keys, opaque tokens), passwords, or hashed passwords — not even partially.
- Mask the `Authorization` header in access logs: log only `"Bearer [REDACTED]"` or the presence/absence of the header.
- Filter tokens from exception messages before logging: a token that appears in an exception chain will be written to log aggregators.

### J.2 Avoid account enumeration
- Authentication failure responses **MUST NOT** reveal whether the username exists:
  - **Correct**: `"Invalid credentials."` (for both bad username and bad password)
  - **Incorrect**: `"User not found."` or `"Password incorrect."` — these allow username enumeration
- Registration and "forgot password" flows follow the same rule: use identical response timing and messages for existing and non-existing accounts where feasible.

### J.3 Token validation errors
- JWT validation errors (expired, invalid signature, malformed) **SHOULD** result in a `401 Unauthorized` with a generic safe message only.
- The specific validation failure (e.g., `"Signature verification failed"`) **MUST NOT** appear in the response body. Log it internally at DEBUG/INFO with a correlation ID.

### J.4 Forbidden vs Unauthorized
- `401 Unauthorized`: the request is not authenticated (no token, invalid token, expired token).
- `403 Forbidden`: the request is authenticated but not authorized (insufficient role/permission).
- Returning `404 Not Found` instead of `403` is acceptable when you want to avoid revealing resource existence (use consistently if you choose this approach).

### J.5 Error response format
Auth errors **SHOULD** use the same envelope and error code pattern as other API errors (see REST API skill):
```json
{
  "success": false,
  "error": { "code": "UNAUTHORIZED", "message": "Authentication required." }
}
```

### J.6 Centralized 401/403 via `AuthenticationEntryPoint` and `AccessDeniedHandler`
Wire centralized handlers instead of letting Spring Security produce its default error pages. **Both handlers MUST follow the repo's REST response envelope and MUST NOT leak internal details.**

Wire them in the filter chain:
```java
http
    // ... other configuration ...
    .exceptionHandling(ex -> ex
        .authenticationEntryPoint(authenticationEntryPoint)  // 401: no/invalid credentials
        .accessDeniedHandler(accessDeniedHandler)            // 403: authenticated but not authorized
    );
```

Minimal implementations:
```java
@Component
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        // Boundary-safe: no stack trace, no internal detail, no account enumeration hint
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.getWriter().write(
            "{\"success\":false,\"error\":{\"code\":\"UNAUTHORIZED\",\"message\":\"Authentication required.\"}}");
    }
}

@Component
public class RestAccessDeniedHandler implements AccessDeniedHandler {
    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {
        // Boundary-safe: do not reveal which permission or resource was missing
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.getWriter().write(
            "{\"success\":false,\"error\":{\"code\":\"FORBIDDEN\",\"message\":\"Access denied.\"}}");
    }
}
```

Rules:
- Responses **MUST** follow the repo's REST API envelope convention.
- **MUST NOT** include stack traces, internal class names, or details about which permission was missing.
- Use these handlers for **all** filter chains where auth errors can occur.

## Review checklist (agent-use)
Review these before raising a Spring Security PR:

- [ ] `WebSecurityConfigurerAdapter` is **not** used (use `SecurityFilterChain` bean).
- [ ] `PasswordEncoder` bean is declared; passwords are **never** stored plain-text.
- [ ] Password hashing algorithm is BCrypt (or another adaptive algorithm) — **not** MD5/SHA-1/SHA-256-plain.
- [ ] CSRF: disabled only for stateless JWT APIs; **not** disabled for session-based apps.
- [ ] JWT secret (HS256) / private key (RS256) is loaded from environment/vault — **not** hardcoded in source code.
- [ ] JWT signing algorithm is not `none` and not a weak algorithm; `alg` header is validated on inbound tokens.
- [ ] `iss`, `aud`, `exp`, and `iat` claims are validated on every inbound JWT.
- [ ] Roles in JWT claims include the `ROLE_` prefix (required for Spring's `hasRole()` checks).
- [ ] `@EnableMethodSecurity` is declared; without it, `@PreAuthorize` annotations are silently ignored.
- [ ] `@PreAuthorize` methods are not called from within the same class (bypasses proxy, skips check).
- [ ] `permitAll` paths are enumerated explicitly — no overly broad wildcards.
- [ ] Tokens and passwords are **never** logged; `Authorization` header is masked in access logs.
- [ ] Authentication failure responses do **not** distinguish between unknown username and wrong password (prevents account enumeration).
- [ ] Refresh tokens are stored hashed (not plain-text) server-side; revocation is possible on logout.
- [ ] CORS `allowedOrigins` does **not** use wildcard `"*"` with `allowCredentials(true)`.
- [ ] Security context is populated in the filter — controllers and services do **not** re-validate the raw token.
- [ ] Actuator endpoints beyond `/actuator/health`, Swagger/OpenAPI docs, and internal admin endpoints are explicitly secured or disabled — not accidentally public.
- [ ] Multiple `SecurityFilterChain` beans (if used) have tight `securityMatcher` scopes and are `@Order`-ed correctly; no chain widens `permitAll` unintentionally.
- [ ] JWT claims do **not** include NRIC/FIN, email address, phone number, full name, or other PII unless explicitly required.
- [ ] If `jti` is used, each token has a unique `jti` that rotates on every issuance; `jti` values are **never** reused.
- [ ] `AuthenticationEntryPoint` (401) and `AccessDeniedHandler` (403) are configured via `http.exceptionHandling(...)` and return boundary-safe, envelope-conformant responses.
