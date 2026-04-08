---
name: java-spring-service
description: >
  Service-layer conventions for NUS Java Spring applications. Covers service responsibilities,
  transaction boundaries (@Transactional), orchestration patterns, exception strategy,
  boundary-safe logging/observability, and authorization placement.
---

# Java – Spring Service (NUS defaults; pragmatic)

> **Scope:** Spring `@Service` layer mechanics and conventions — responsibilities, orchestration,
> transaction boundaries, exception strategy, boundary-safe logging, and authorization patterns.
>
> **This skill covers the *how* of service-layer implementation, not the *what* of API contracts.**
> For controller wiring and HTTP contract rules, refer to the REST API and Spring Controller skills.
>
> **See also:**
> - Coding skill (boundary-safe errors + sensitive data + review checklist): `.github/skills/coding/SKILL.md`
> - Java umbrella skill (Java idioms + defaults): `.github/skills/java/SKILL.md`
> - Java REST API skill (endpoint style, DTOs, envelopes, HTTP statuses): `.github/skills/java/rest-api/SKILL.md`
> - Java Spring Controller skill (binding, multipart, advice mechanics): `.github/skills/java/spring-controller/SKILL.md`
> - Java JDBC skill (SQL + transactions guidance for Spring JDBC): `.github/skills/java/jdbc/SKILL.md`
> - Java JPA skill (entities/repositories, OSIV, fetching, N+1): `.github/skills/java/jpa/SKILL.md`
> - Java Spring Security skill (SecurityFilterChain, JWT, method security): `.github/skills/java/spring-security/SKILL.md`

## A) Existing codebase rule (MOST IMPORTANT)

For an **existing application**, you **MUST** follow the repo's established patterns for:
- Service class naming (`XxxService` vs other naming), package structure, and injection style.
- Transaction placement (`@Transactional` on service methods vs elsewhere).
- Exception style (null returns vs exceptions; domain exceptions vs framework exceptions).
- Logging conventions and what fields must be present (correlation ID, trace ID, etc.).

You **MUST NOT** introduce a "clean architecture rewrite" (new service layer everywhere, package moves,
mass renames, or pervasive DTO refactors) unless explicitly requested.

## B) Service layer responsibilities

### B.1 What services do (default)
In Spring applications, services **SHOULD**:
- Orchestrate business workflows (multi-step operations).
- Enforce domain/business rules that are not purely request-binding validation.
- Coordinate multiple repositories/DAOs and downstream clients.
- Own transaction boundaries for multi-step operations (see section C).
- Provide a stable boundary for error translation and observability (sections D and E).

### B.2 What services MUST NOT do
Services **MUST NOT**:
- Contain HTTP/web concerns (`HttpServletRequest`, `HttpServletResponse`, `ResponseEntity`,
  controller annotations, header parsing, request mapping).
- Depend on controller DTOs as "internal domain objects" unless the repo already uses that pattern.
- Return persistence entities as external API contracts (see JPA skill boundary rule).

**Rule of thumb:** controllers translate HTTP → service call; repositories translate DB → domain/persistence models;
services orchestrate and enforce business meaning.

### B.3 Controllers are thin; services are testable
- Controllers **MUST** remain thin (see controller skills).
- Service methods **SHOULD** be written so they can be unit tested without Spring MVC.

## C) Service method template (implementation reference)

Use this skeleton when adding or generating a service class. Plain Spring style — no Lombok; use getters/setters.

```java
@Service
public class AccountService {

    private static final Logger log = LoggerFactory.getLogger(AccountService.class);

    private final AccountDao accountDao;
    private final AuditDao auditDao;

    public AccountService(AccountDao accountDao, AuditDao auditDao) {
        this.accountDao = accountDao;
        this.auditDao = auditDao;
    }

    // --- write operation: must be @Transactional ---
    @Transactional
    public AccountDto create(CreateAccountRequest request) {
        // 1. Business-rule validation (not request-binding; that belongs in the DTO/@Valid layer)
        AccountDto existing = accountDao.findByEmail(request.getEmail());
        if (existing != null) {
            throw new AccountConflictException("Account already exists"); // boundary-safe message
        }

        // 2. Orchestrate persistence
        AccountDto account = new AccountDto();
        account.setDisplayName(request.getDisplayName());
        account.setEmail(request.getEmail());
        Long id = accountDao.insertAndReturnId(account);
        account.setId(id);

        // 3. Side-effects within the same transaction
        auditDao.insertAudit("ACCOUNT_CREATE", account.getId(), new Date());

        // 4. Boundary-safe log: opaque id only — no email, no PII
        log.info("Account created id={}", account.getId());
        return account;
    }

    // --- read operation: readOnly hint where beneficial ---
    @Transactional(readOnly = true)
    public AccountDto getById(Long id) {
        AccountDto account = accountDao.findById(id);  // returns null if not found (NUS common)
        if (account == null) {
            throw new AccountNotFoundException("Account not found"); // boundary-safe
        }
        return account;
    }

    // --- update operation ---
    @Transactional
    public AccountDto update(UpdateAccountRequest request) {
        AccountDto account = accountDao.findById(request.getId());
        if (account == null) {
            throw new AccountNotFoundException("Account not found");
        }
        account.setDisplayName(request.getDisplayName());
        accountDao.update(account);
        log.info("Account updated id={}", account.getId());
        return account;
    }
}
```

Key rules illustrated by the template:
- Constructor injection, no field injection.
- `@Transactional` on the write method; `@Transactional(readOnly = true)` on reads.
- Null-check after DAO call; throw a domain exception with a boundary-safe message.
- Log opaque identifiers only (no email, name, NRIC, or other PII).

## D) Transactions (service-owned by default)

### D.1 Transaction boundary rule
- For Spring applications, `@Transactional` **SHOULD** live at the **service layer** for multi-step operations.
- Repository/DAO methods **SHOULD** be "transaction participants" and not own business transactions,
  unless the repo already uses repository-level transactions consistently.

### D.2 Read vs write
- Write operations (create/update/delete) **MUST** be transactional (service method or service class).
- Read operations **SHOULD** use `@Transactional(readOnly = true)` where beneficial and consistent with repo patterns.
- Do not add transactions indiscriminately; follow existing conventions.

### D.3 Self-invocation pitfall (proxy bypass)

`@Transactional` relies on Spring proxies. Calling a transactional method from **within the same class** bypasses
the proxy and **does not** apply the transaction.

```java
// BAD — self-invocation; @Transactional on doCreate() is NOT applied
@Service
public class AccountService {
    public void create(CreateAccountRequest request) {
        this.doCreate(request); // proxy is bypassed
    }

    @Transactional
    public void doCreate(CreateAccountRequest request) { ... }
}

// GOOD — move the transactional logic to a separate bean, OR annotate the entry-point method
@Service
public class AccountService {
    @Transactional
    public void create(CreateAccountRequest request) { ... } // annotate the called method
}
```

### D.4 Propagation and boundaries (pragmatic defaults)
- Default propagation (`REQUIRED`) is usually correct; do not change propagation unless there is a clear requirement.
- `REQUIRES_NEW` and nested transactions **MUST NOT** be introduced ad-hoc; they affect consistency and error handling.
- Avoid long-running transactions (do not wrap remote calls or large file operations in a DB transaction unless explicitly required).

### D.5 JDBC + JPA mixed applications
- In mixed applications, ensure the transaction manager and boundaries match what the repo uses.
- You **MUST** follow repo conventions on transaction manager selection, whether OSIV is enabled (JPA skill),
  and exception translation strategy.

## E) Exception strategy (service layer)

### E.1 Service exceptions: domain-first, boundary-safe
Services **SHOULD** throw domain-meaningful exceptions such as:
- `XxxNotFoundException`
- `XxxConflictException`
- `XxxValidationException` (for business-rule validation, not request binding)
- `DependencyFailureException` (downstream outages / timeouts)

Rules:
- Exception messages **MUST** be boundary-safe (no SQL, no internal hostnames, no stack traces, no secrets/PII).
- Preserve original cause internally (wrap and attach `cause`) for debugging.

```java
// Wrapping a lower-level failure with context; preserving the cause
try {
    downstreamClient.fetch(accountId);
} catch (TimeoutException e) {
    throw new DependencyFailureException("Downstream fetch failed", e); // cause preserved; message is safe
}
```

### E.2 Avoid leaking persistence exceptions to controllers
- Services **SHOULD** catch lower-level exceptions when they need translation to a domain error category.
- For example:
  - DB unique constraint violation → `Conflict`
  - missing row → `NotFound` (depending on repo convention)

Do not invent a new global exception style; follow the repo's existing approach and advice mapping.

### E.3 Null vs Optional vs exception
- You **MUST** follow repository conventions:
  - If repositories return `null` for not-found, service **MUST** handle null explicitly and decide whether to throw a not-found exception.
  - **MUST NOT** introduce `Optional` wholesale into a codebase that uses `null`.

### E.4 Don't swallow exceptions
- Exceptions **MUST NOT** be swallowed.
- If you catch an exception, you **MUST**:
  - either rethrow it,
  - or wrap it with meaningful context (operation + non-sensitive identifiers),
  - and ensure it remains observable (logs/metrics) as appropriate.

(See `coding` skill section C.0 and C.6.)

## F) Logging & observability (service layer)

### F.1 What is safe to log
Services **MAY** log:
- operation name (e.g., `createAccount`, `submitApplication`)
- correlation/trace IDs from `MDC` (if already present in repo)
- non-sensitive, opaque identifiers (internal UUIDs / surrogate keys)
- outcome (success/failure), timing, counts

```java
// GOOD — opaque id only
log.info("Account created id={}", account.getId());

// BAD — PII in log
log.info("Account created for email={} name={}", account.getEmail(), account.getName());
```

### F.2 MUST NOT log (sensitive)
Services **MUST NOT** log:
- credentials (JWTs, API keys, bearer tokens, passwords)
- NRIC/FIN, bank account numbers, credit card data, addresses, phone numbers
- full request/response payloads that may contain sensitive data, unless the repo has a proven redaction strategy

(See `coding` skill C.1 and C.7; Spring Security skill token rules.)

### F.3 Prefer structured logs with context
- Logs **SHOULD** include correlation ID / trace ID (if available), operation name, non-sensitive key identifiers,
  and error code/category (if the repo uses one).
- If in doubt about a field's sensitivity, omit it.

### F.4 Idempotency and retry visibility
If the service implements retries or idempotency:
- Retries **MUST** be bounded and observable (log/metric per attempt).
- Do not retry non-retriable failures (validation/conflict).

(See `coding` skill C.6.)

## G) Authorization placement (Spring Security integration)

### G.1 Prefer method-level authorization
- Authorization rules **SHOULD** be expressed via method-level security (`@PreAuthorize`) on service methods
  where the repo uses Spring Security.
- Controllers **SHOULD** remain thin and not implement complex authorization logic.

```java
@Service
public class AccountService {

    // Only the owning user or an ADMIN may retrieve the account
    @PreAuthorize("hasRole('ADMIN') or #request.accountId == authentication.principal.accountId")
    @Transactional(readOnly = true)
    public AccountDto getById(GetAccountRequest request) {
        AccountDto account = accountDao.findById(request.getAccountId());
        if (account == null) {
            throw new AccountNotFoundException("Account not found");
        }
        return account;
    }
}
```

### G.2 Service must not parse raw tokens
- Services **MUST NOT** parse or validate JWTs / API keys directly.
- Authentication and token parsing belong in Spring Security filters/config.

### G.3 Security context access
- Services **MAY** accept the caller identity as an explicit parameter (preferred for testability), or read from
  Spring Security context if that is the repo convention.
- **MUST** follow the repo's established principal shape and access pattern (see Spring Security skill E.1).

## H) Service design & maintainability (pragmatic)

### H.1 Keep services cohesive
- Services **SHOULD** follow SRP; avoid "God services".
- Prefer one public method per use case when it improves clarity.

### H.2 Avoid cross-layer leakage
- Services **SHOULD NOT** return JPA entities directly to controllers.
- Services **SHOULD** map persistence models to API response DTOs (directly or via a mapper), consistent with repo approach.

### H.3 Avoid N+1 and chatty persistence
- Services **MUST** avoid loops that call repositories repeatedly on large collections.
- Prefer repository queries that load the required data efficiently (see JPA skill for fetch and N+1 patterns).
- For large result sets, **MUST** use pagination.

## I) Testing services (pragmatic)

- Service business logic **SHOULD** have unit tests.
- Integration tests **MAY** be used for:
  - transactional behavior
  - repository integration
  - security method-level rules (`@PreAuthorize`)
- **MUST** keep tests aligned with existing repo test strategy and tooling.

## Review checklist (agent-use)

When reviewing or generating service-layer code, check:

- [ ] Service does not contain HTTP concerns (`ResponseEntity`, request/response objects, header parsing)
- [ ] `@Transactional` is applied at correct boundary; no self-invocation proxy bypass
- [ ] Null/not-found conventions are handled explicitly and consistently
- [ ] Exceptions are boundary-safe and preserve root cause internally
- [ ] No sensitive data or credentials are logged
- [ ] Authorization is enforced consistently (prefer `@PreAuthorize` if repo uses it)
- [ ] No N+1 / chatty repository usage introduced; pagination used for large sets
- [ ] Changes follow existing codebase conventions; no architecture rewrite without request
