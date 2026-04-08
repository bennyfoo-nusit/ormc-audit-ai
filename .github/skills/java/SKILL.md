---
name: java
description: >
  Java-specific conventions and best practices (incl. common Spring ecosystem patterns)
  to complement the language-agnostic rules in the coding skill.
  Use this skill when reviewing or writing Java code, especially Spring Boot/Spring Data projects.
---

# Java – Conventions & Best Practices (NUS defaults)

> **Relationship to `coding` skill:** This document contains Java-idiomatic rules and Spring-adjacent conventions.
> For language-agnostic rules (error handling, sensitive data, review checklist), see the `coding` skill.

## A) Java naming & casing (idiomatic defaults)

### A.1 Naming & casing
- **Packages**: **MUST** be lowercase dot-separated (e.g., `nus.photo.api.dto`).
- **Types (classes/interfaces/enums/records)**: **SHOULD** be `PascalCase`.
- **Methods / variables**: **SHOULD** be `camelCase`.
- **Constants**: **SHOULD** be `UPPER_SNAKE_CASE`.
- **Booleans**: **SHOULD** use `is/has/can/should` prefixes.

### A.2 Enum naming (Java defaults)
- Enum types **SHOULD** be nouns without `Enum` suffix (e.g., `OrderStatus`).
- Enum constants **MUST** use `UPPER_SNAKE_CASE` (e.g., `PENDING_APPROVAL`).
- Enums **SHOULD** live near their domain usage; avoid “misc enums” packages unless there is a clear boundary.

### A.3 Imports (Java defaults)
- **MUST** remove unused imports.
- Wildcard imports (e.g., `import x.*`) are **ALLOWED**, but:
  - In production/source code, usage **SHOULD** be flagged as a code review item and considered for replacement with explicit imports.
  - In **JUnit tests**, wildcard imports have **no restriction**.

## B) Spring / persistence-oriented naming (when applicable)

### B.1 DAO vs Repository (technology-based rule)
Use naming based on the data access technology:

- **Spring JDBC / SQL-first approach** (`JdbcTemplate`, `NamedParameterJdbcTemplate`, explicit SQL):
  - Use `XxxDao` in a `...dao` package.
  - Acronym casing for new code: **MUST** use `Dao` (e.g., `UserDao`), not `DAO`.

- **Spring Data JPA / ORM approach** (`JpaRepository`, entities, JPQL):
  - Use `XxxRepository` in a `...repository` package.

**Existing codebase rule:** If an existing codebase consistently uses `XxxDAO`, keep it as-is. Do not rename purely for style unless part of a planned refactor (see `coding` skill **B.0**).

## C) DTO conventions (common Java/Spring apps)

### C.1 DTO naming for REST APIs
- REST DTOs **SHOULD** use purpose-based names:
  - Requests: `CreateXxxRequest`, `UpdateXxxRequest`, `XxxQueryRequest` (as appropriate)
  - Responses: `XxxResponse`, `XxxSummaryResponse`
- For **new applications**, REST DTO packages **SHOULD** be:
  - `...api.dto.request`
  - `...api.dto.response`

**Mutability policy (org default):**
- DTOs **MAY** be mutable POJOs with getters/setters.
- Java `record` is **OPTIONAL** and may be used for new applications where appropriate.

**Existing codebase scenarios:**
- **New application**: follow the org default above (`api.dto.request/response`, `Request/Response` suffix).
- **Existing codebase with consistent existing convention**: follow existing project convention (even if it differs).
- **Existing codebase with mixed conventions**: for new additions, prefer the org default and flag inconsistency as tech debt; avoid mass renames (see `coding` skill **B.0**).

### C.2 DTOs between DAO/service layers (persistence DTOs)
**Boundary rule (not REST-specific):**
- Persistence-layer DTOs/objects (e.g., under `...dao.dto`, `...persistence.dto`, or returned directly by DAOs/Repositories) **MUST NOT** be reused as **external API contract models**.
- Mapping is required at the boundary between persistence/service layers and external contracts.
  - (For REST/controller specifics, follow the REST API skill; this section only defines naming and boundary principles.)

**New application defaults:**
- For Spring JDBC / SQL-first applications:
  - Use `...dao.dto` for DAO-layer DTOs.
  - Name DAO-layer DTOs with `*Dto` suffix (e.g., `UserDto`, `AccountDto`) if the application chooses a DTO approach.
- For Spring Data JPA applications:
  - Using `...persistence.dto` for persistence DTOs is **ACCEPTABLE** (especially where JPA repositories coexist with projections or mapping layers).
  - For JPA apps, `...dao.dto` is uncommon; prefer `...persistence.dto` when persistence DTOs exist.

**Existing codebase rule:**
- Follow existing conventions unless the change is low impact (see `coding` skill **B.0**).
- Avoid introducing churn by renaming large numbers of DTOs/packages in functional PRs.

## D) Package strategy (Java/Spring defaults)

### D.1 Package strategy: layer-first default, domain-first allowed
- For **new applications**, default to a **layer-first** structure (example):
  - `...controller`, `...service`, `...dao` / `...repository`, `...api.dto`, `...config`, `...exception`
- Domain-first packaging (e.g., `...domain.user`, `...domain.order`) is **ALLOWED** only if it is a deliberate, documented design choice.
- Once a package strategy is chosen in an application, it **MUST** be applied consistently in that application.
- For existing codebases, avoid package moves unless low impact (see `coding` skill **B.0**).

## E) Service interface vs concrete class (Java defaults)

### E.1 Service interface vs concrete class
- Default rule: create a single concrete service class named `XxxService` (no interface).
- Use an interface only when there is a real need, such as:
  - multiple implementations (e.g., email vs SMS)
  - profile-based swapping (dev vs prod)
  - clear module boundary / shared library contract

**Existing codebase rule for `XxxService` + `XxxServiceImpl`:**
- Keep existing pattern as-is.
- Optionally suggest refactor only when low impact and benefit is clear (see `coding` skill **B.0**).

## F) Pragmatic org defaults (when repo is not explicit)

When the repository does not give explicit guidance on the topics below, apply these defaults.

### F.1 Null handling (DAO layer)
- Returning `null` for "not found" is common and acceptable in the DAO layer.
- Callers (service layer) **MUST** perform null checks before using DAO return values.
- **MUST NOT** introduce `Optional<T>` wholesale into an existing codebase that uses `null`; follow the existing pattern unless the change is explicitly requested.

### F.2 Date/time types
- Many existing codebases use `java.util.Date` (and `java.sql.Timestamp` for JDBC).
- **MUST NOT** introduce `java.time.*` (`LocalDate`, `LocalDateTime`, `OffsetDateTime`, etc.) wholesale unless the repo already uses it or the change is explicitly requested.
- Follow the existing date/time types in the file or module being changed.

### F.3 Exception style
- Prefer unchecked (runtime) exceptions for application-level errors.
- Wrap lower-level exceptions with context (operation name, key non-sensitive identifiers) before re-throwing.
- Exception messages at system boundaries **MUST** remain boundary-safe (see `coding` skill **C.5**).
- For exception taxonomy and structure, refer to the `coding` skill (**C.2–C.4**).

### F.4 Lombok and records
- Use Lombok annotations (`@Data`, `@Builder`, `@Getter`, etc.) **only if** the codebase already uses Lombok.
- Use Java `record` **only if** the codebase already uses records.
- **MUST NOT** introduce Lombok or records as a new dependency or pattern without explicit instruction.

### F.5 Package moves and renames
- **MUST NOT** introduce large package moves or renames in functional PRs.
- If a structural improvement is genuinely needed, propose it as a separate, low-impact refactor (see `coding` skill **B.0**).

## See also
- Coding skill: org-wide language-agnostic conventions (see `.github/skills/coding/SKILL.md`).
- Java REST API skill: HTTP contract, endpoint style, DTO/validation, API error handling (see `.github/skills/java/rest-api/SKILL.md`).
- Spring Controller skill: Spring MVC wiring mechanics (binding, multipart, controller advice, filters, slice testing) (see `.github/skills/java/spring-controller/SKILL.md`).
- Spring Service skill: service-layer conventions (@Transactional, orchestration, exception strategy, observability, authorization placement) (see `.github/skills/java/spring-service/SKILL.md`).
- Spring Security skill: authentication/authorization (SecurityFilterChain, JWT, method security) (see `.github/skills/java/spring-security/SKILL.md`).
- Java JPA skill: entities/repositories, fetching, OSIV, N+1 avoidance (see `.github/skills/java/jpa/SKILL.md`).
- Java JDBC skill: JdbcTemplate/NamedParameterJdbcTemplate + SQL patterns (see `.github/skills/java/jdbc/SKILL.md`).
- Java Testing skill: test naming/structure conventions, unit vs integration testing guidance (see `.github/skills/java/testing/SKILL.md`).
- Spring MVC skill (DispatcherServlet, WebMvcConfigurer, CORS, interceptors, static resources; MVC-only and Boot+MVC): `.github/skills/java/spring-mvc/SKILL.md`.
- Spring Boot skill (Boot application setup, `@ConfigurationProperties`, profiles, Actuator; Boot apps only): `.github/skills/java/spring-boot/SKILL.md`.
- Spring Batch skill: job/step naming, reader/processor/writer naming, batch package conventions (see `.github/skills/java/spring-batch/SKILL.md`).
- Java Logging skill: SLF4J/Logback conventions, log levels, structured logging, MDC/correlation IDs (see `.github/skills/java/logging/SKILL.md`).
- NUS Log Java Shared Component skill: usage and review guidance for the `nus-common-log` component (see `.github/skills/java/component/nus-logger/SKILL.md`).
