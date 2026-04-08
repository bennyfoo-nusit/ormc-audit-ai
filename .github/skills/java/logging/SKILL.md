---
name: java-logging
description: >
  Guidelines for logging in Java Spring Boot applications using SLF4J and Logback,
  including log levels, structured logging, MDC/correlation IDs, and what to log.
  Use this skill when writing or reviewing logging code in Java.
---

# Java – Logging with SLF4J & Logback

> **See also:**
> - Coding skill (sensitive data rules, boundary-safe errors): `.github/skills/coding/SKILL.md`
> - NUS logging format skill (NUS log event taxonomy + JSON field contract): `.github/skills/nus-logging/SKILL.md`
> - NUS Log Java Shared Component skill (`nus-common-log` usage and review): `.github/skills/java/component/nus-logger/SKILL.md`
> - Java umbrella skill (Java idioms + defaults): `.github/skills/java/SKILL.md`
> - Java Spring Service skill (service-layer logging conventions): `.github/skills/java/spring-service/SKILL.md`

## A) Existing codebase rule (MOST IMPORTANT)

For an **existing application**, you **MUST** follow the repo's established logging patterns:
- Logger declaration style (`LoggerFactory.getLogger` vs `@Slf4j`).
- MDC fields and correlation-ID conventions already in use (field names, injection points).
- Logback configuration location and structure (`logback-spring.xml` vs `application.yml` properties).
- Log level defaults and any profile-specific overrides.

You **MUST NOT** introduce a new logging framework, replace the existing appender configuration, or add
MDC fields that conflict with existing ones unless explicitly requested.

## B) Logger declaration

SLF4J + Logback is included by default in `spring-boot-starter`. Declare **one logger per class**.

```java
// Standard — always correct
private static final Logger log = LoggerFactory.getLogger(UserService.class);
```

If the codebase already uses Lombok, `@Slf4j` is acceptable:

```java
@Slf4j
@Service
public class UserService { ... }
```

Rules:
- **MUST NOT** use `System.out.println`, `System.err.println`, or `java.util.logging` in application code.
- **MUST** declare the logger as `private static final`.
- `@Slf4j` **MUST NOT** be introduced as a new pattern if the codebase uses `LoggerFactory.getLogger` consistently.

## C) Log levels – when to use

| Level   | When to use                                                           |
|---------|-----------------------------------------------------------------------|
| `TRACE` | Very detailed diagnostic — high volume; development only              |
| `DEBUG` | Development diagnostics — inputs, outputs, control-flow branching     |
| `INFO`  | Key business events — resource created, job completed, action taken   |
| `WARN`  | Unexpected but recoverable situation — retry, fallback, partial result |
| `ERROR` | Failure requiring attention — always include the exception object      |

Rules:
- Production log level **SHOULD** be `INFO` at the root.
- Package-level `DEBUG` **MAY** be enabled for a specific package in non-production environments.
- `TRACE` **MUST NOT** be enabled in production.
- `ERROR` **MUST** include the exception object as the last argument (see section D.2).

## D) Usage rules

### D.1 Parameterised messages (no string concatenation)

**MUST** use SLF4J's `{}` placeholders. **MUST NOT** concatenate strings in log statements.

```java
// GOOD — deferred evaluation; no cost when level is disabled
log.debug("Fetching user with id={}", id);
log.info("Order placed orderId={} userId={}", order.getId(), order.getUserId());
log.warn("Retry attempt {}/{} for paymentId={}", attempt, maxRetries, paymentId);

// BAD — string concatenation always evaluates regardless of log level
log.debug("Fetching user with id=" + id);
```

### D.2 Exception logging (throwable as last argument)

**MUST** pass the exception object as the **last positional argument** to the log method.
SLF4J will automatically append the stack trace.

```java
// GOOD — exception as last arg; full stack trace appended automatically
log.error("Failed to process orderId={}", orderId, ex);
log.warn("Transient failure on paymentId={}, will retry", paymentId, ex);

// BAD — formats exception via toString(); stack trace lost
log.error("Failed to process orderId=" + orderId + ": " + ex.getMessage());
```

### D.3 Sensitive data (MUST NOT log)

**MUST NOT** log:
- Credentials: passwords, JWTs, API keys, bearer tokens, session IDs.
- Personal identifiers: NRIC/FIN, bank account numbers, credit card data.
- Raw PII: full names, email addresses, phone numbers, physical addresses, birth dates.
- Full request/response payloads unless the repo has a proven redaction strategy.

**SHOULD** log stable, opaque identifiers (surrogate keys, UUIDs) instead of raw user data.

```java
// GOOD — opaque identifier only
log.info("User created id={}", user.getId());

// BAD — PII in log
log.info("User created email={} nric={}", user.getEmail(), user.getNric());
```

(See `coding` skill sections C.1 and C.7 for the organisation-wide sensitive data policy.)

### D.4 Logging volume (no per-item spam)

**MUST NOT** emit a log line for every item inside a loop over a large collection.

```java
// BAD — O(n) log lines; overwhelms log aggregators
for (User user : users) {
    log.info("Processing user id={}", user.getId());
}

// GOOD — log before and after with totals; log individual items only on error
log.info("Starting batch processing count={}", users.size());
int errors = 0;
for (User user : users) {
    try {
        process(user);
    } catch (Exception ex) {
        errors++;
        log.error("Failed to process userId={}", user.getId(), ex);
    }
}
log.info("Batch complete total={} errors={}", users.size(), errors);
```

## E) Structured logging & MDC / correlation IDs

### E.1 Use MDC for cross-cutting context

When the repo already uses MDC-based correlation IDs (e.g., `requestId`, `traceId`, `userId`),
include them in log statements automatically via MDC rather than repeating them in each message.

```java
// Set once in a filter/interceptor — then every log line in the request includes it automatically
MDC.put("requestId", requestId);
try {
    // ... handle request ...
} finally {
    MDC.clear(); // MUST clear MDC to prevent context leaking across threads/requests
}
```

Rules:
- **MUST** call `MDC.clear()` (or remove specific keys) in a `finally` block or `OncePerRequestFilter`.
- **MUST NOT** put sensitive data into MDC (same rules as D.3 apply).
- **MUST NOT** introduce new MDC field names that conflict with existing conventions in the repo.
- If MDC is not yet used in the repo, **SHOULD NOT** introduce it without explicit instruction.

### E.2 Logback configuration in application.yml (pragmatic defaults)

For simple applications, Logback can be configured via Spring Boot's `application.yml`:

```yaml
logging:
  level:
    root: INFO
    com.example: DEBUG        # adjust to your package
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
```

Note: `%n` in the pattern is the platform-independent newline (preferred over `\n`).

For production structured logging (JSON output for log aggregators), prefer `logback-spring.xml`
with a JSON encoder (e.g., `logstash-logback-encoder`) — follow existing repo configuration.

Rules:
- `logback-spring.xml` **SHOULD** use Spring profiles (`<springProfile>`) for environment-specific config.
- **MUST NOT** hardcode hostnames or credentials in Logback appender configuration.
- **MUST NOT** set root level to `DEBUG` or `TRACE` in any production-deployed configuration.

## Review checklist (agent-use)

- [ ] No `System.out.println` / `System.err.println` / `java.util.logging` in application code
- [ ] Logger declared as `private static final Logger log = LoggerFactory.getLogger(...)` (or `@Slf4j` if already used)
- [ ] All log statements use `{}` parameterised placeholders — no string concatenation
- [ ] Exception objects passed as the last argument to `log.error()` / `log.warn()` where applicable
- [ ] No sensitive data logged: no passwords, tokens, NRIC/FIN, raw PII, full request/response bodies
- [ ] Appropriate log level used (INFO for key events, DEBUG for diagnostics, ERROR with exception for failures)
- [ ] No per-item log spam inside loops over large collections
- [ ] MDC cleared in `finally` if set; no sensitive fields put into MDC
- [ ] Logging follows existing codebase conventions (logger style, MDC field names, log level defaults)
- [ ] Logback configuration does not hardcode credentials or set root DEBUG/TRACE in production profiles
