---
name: java-component-nus-logger
description: >
  Guidelines for implementing and reviewing NUS-format application logging in Java
  using the NUS Log Java shared component (`nus-common-log`). Use this skill
  when a Java application logs through the NUS shared logger and must comply with
  the NUS log field contract and event taxonomy.
---

# NUS Log Java Shared Component

> **Use this skill when:** a Java application implements or reviews logging through the
> NUS Log Java shared component rather than plain SLF4J/Logback-only logging.
>
> **See also:**
> - NUS logging format skill: `.github/skills/nus-logging/SKILL.md`
> - Java logging skill: `.github/skills/java/logging/SKILL.md`
> - Java umbrella skill: `.github/skills/java/SKILL.md`
> - Coding skill: `.github/skills/coding/SKILL.md`
>
> **Source basis:** Confluence page `NUS Log Java Library Usage Guide` (page `757923853`)
> plus the NUS logging guideline page referenced by that document.

## A) Scope and relationship to other skills

This skill covers the **Java shared component usage pattern** for NUS-standard logging:
- dependency and runtime setup
- Java shared component imports and initialization
- request-aware shortcut APIs
- full log-record builders (`ExceptionLog`, `AuthenticationLog`, `EventLog`)
- configuration via `config.json`
- migration from SLF4J / Log4j2 / Commons Logging to the NUS Java shared component
- code review rules specific to the component logger API

This skill does **not** redefine the organisation-wide log format.
- Use `.github/skills/nus-logging/SKILL.md` for the canonical NUS log fields and event semantics.
- Use this skill for **how to use the Java shared component correctly**.

## B) Existing codebase rule (MOST IMPORTANT)

For an existing application:
- **MUST** follow the repository's established usage of the NUS Log Java shared component.
- **MUST** preserve existing logger initialization style where the Java shared component is already adopted.
- **MUST NOT** mix multiple logging abstractions inconsistently in the same changed area unless the task is an intentional migration.
- **SHOULD** migrate incrementally: prefer adapting touched code paths instead of broad churn unless explicitly requested.

If the repository already uses standard SLF4J/Logback without the NUS Log Java shared component, do **not** introduce `nus-common-log` unless explicitly required.

## C) Dependencies and compatibility

### C.1 Maven dependencies from the usage guide

For **JDK 17 / `javax`** applications:

```xml
<dependency>
  <groupId>nus</groupId>
  <artifactId>nus-common-log</artifactId>
  <version>1.3.0</version>
</dependency>
<dependency>
  <groupId>javax.servlet</groupId>
  <artifactId>javax.servlet-api</artifactId>
  <version>4.0.1</version>
</dependency>
```

For **JDK 21 / `jakarta`** applications:

```xml
<dependency>
  <groupId>nus</groupId>
  <artifactId>nus-common-log</artifactId>
  <version>2.0.1</version>
</dependency>
<dependency>
  <groupId>jakarta.servlet</groupId>
  <artifactId>jakarta.servlet-api</artifactId>
  <version>6.0.0</version>
</dependency>
```

Bridge dependency from the guide:

```xml
<dependency>
  <groupId>org.apache.logging.log4j</groupId>
  <artifactId>log4j-slf4j-impl</artifactId>
  <version>2.17.2</version>
</dependency>
```

Jackson dependencies from the guide if not already present:

```xml
<dependency>
  <groupId>com.fasterxml.jackson.core</groupId>
  <artifactId>jackson-core</artifactId>
  <version>2.15.4</version>
</dependency>
<dependency>
  <groupId>com.fasterxml.jackson.core</groupId>
  <artifactId>jackson-databind</artifactId>
  <version>2.15.4</version>
</dependency>
<dependency>
  <groupId>com.fasterxml.jackson.core</groupId>
  <artifactId>jackson-annotations</artifactId>
  <version>2.15.4</version>
</dependency>
```

Rules:
- **MUST** match the NUS Log Java shared component logger version to the application's servlet namespace (`javax` vs `jakarta`).
- **MUST NOT** add duplicate or conflicting logging bridges.
- **SHOULD** align dependency versions with the repo's dependency management if it already centralizes versions.

## D) Configuration and runtime setup

### D.1 `config.json`

The usage guide requires a `config.json` on the application classpath, typically under `resources`:

```json
{
  "appName": "UGREPORT",
  "appId": "795",
  "moduleName": "jasper",
  "stacktraceTopLimit": 3,
  "userTypeLabel": "_userType_",
  "userIdLabel": "_userId_"
}
```

Rules:
- `appName`, `appId`, and `moduleName` **MUST** reflect the real deployed application/module identity.
- `stacktraceTopLimit` **SHOULD** be kept consistent with team policy and supportability needs.
- session label names in config **MUST** match the keys actually written into the HTTP session.

### D.2 Session attributes for request-derived user info

The guide stores user metadata in session attributes:

```java
request.getSession().setAttribute("_userType_", wsOneOAuth.getUsertype());
request.getSession().setAttribute("_userId_", wsOneOAuth.getUserid());
```

Rules:
- session attribute keys **MUST** match `userTypeLabel` and `userIdLabel` from `config.json`.
- values **SHOULD** be set as early as possible after authentication succeeds.
- values **MUST NOT** contain secrets or raw sensitive payloads beyond the approved user identifier.

### D.3 Logging configuration

The usage guide shows `log4j2.xml` outputting the built POJO log record as the message body:

```xml
<Configuration status="debug">
    <Appenders>
        <Console name="PojoConsoleAppender" target="SYSTEM_OUT">
            <PatternLayout pattern="%m%n"/>
        </Console>
    </Appenders>
    <Loggers>
        <Root level="error"></Root>
        <Logger name="sg.edu.nus.eitu" level="info" additivity="false">
            <AppenderRef ref="PojoConsoleAppender" />
        </Logger>
    </Loggers>
</Configuration>
```

Rules:
- appender pattern **SHOULD** preserve the structured message payload (e.g. `%m%n`).
- **MUST NOT** wrap or decorate the structured payload in a way that breaks downstream parsing.
- production logger levels **MUST NOT** be set broader than necessary.
- follow repo conventions for logger names, package scopes, and appenders.

## E) Core record types and builders

The Java shared component centers around these record types:
- `ExceptionLog`
- `AuthenticationLog`
- `EventLog`
- event details types such as:
  - `EventDetailsForException`
  - `EventDetailsForAuthorizationUpdate`
  - `EventDetailsForBusiness`
  - `EventDetailsForConfParamUpdate`
  - `EventDetailsForSensitiveDataAccess`

### E.1 Exception log example

```java
ExceptionLog exceptionLog = ExceptionLog.builder()
    .timestamp("2024-10-03T06:45:36Z")
    .userid("c.cai@nus.edu.sg")
    .isUser(true)
    .env("PRD")
    .appId("1234")
    .app("uNivUS")
    .mod("Scholarship")
    .className("ScholarshipAdminController")
    .ver("1.5.1.2")
    .ip("185.123.152.50")
    .sip("185.123.152.50")
    .server("inetapps.nus.edu.sg")
    .level("Error")
    .event("ex")
    .msg("Unable to load the configuration for XX service, system cannot proceed with processing.")
    .details(EventDetailsForException.builder().build())
    .build();
```

### E.2 Authentication log example

```java
AuthenticationLog authenticationLog = AuthenticationLog.builder()
    .timestamp("2024-10-03T13:05:45Z")
    .userid("j.smith@nus.edu.sg")
    .isUser(true)
    .env("PRD")
    .appId("9876")
    .app("LoginPortal")
    .mod("WebAuth")
    .className("AuthController")
    .ver("1.0.2")
    .ip("192.168.1.1")
    .sip("10.1.1.1")
    .server("auth.nus.edu.sg")
    .event("authn")
    .success(true)
    .mfa(true)
    .mfat("TOTP")
    .build();
```

### E.3 Event log example

```java
EventLog log = EventLog.builder()
    .timestamp(Instant.now())
    .userid("a.lee@nus.edu.sg")
    .isUser(true)
    .env("PRD")
    .appId("1234")
    .app("uNivUS")
    .mod("Registration")
    .className("RegistrationController")
    .ver("2.3.4")
    .ip("192.168.0.1")
    .sip("10.0.0.1")
    .server("prodapps.nus.edu.sg")
    .level("Info")
    .event("cancel-application")
    .msg("The user has cancelled the application process.")
    .details(EventDetailsForBusiness.builder()
        .evCode("cancel-application")
        .evDetails("User cancelled the application process at step 3.")
        .evActor("a.lee@nus.edu.sg")
        .build())
    .build();
```

### E.4 Event details builders

```java
EventDetails details = EventDetailsForAuthorizationUpdate.builder()
    .grantor("m.tan@nus.edu.sg")
    .grantee("j.ong@nus.edu.sg")
    .objt("Role")
    .obj("Admin")
    .build();

EventDetails details = EventDetailsForBusiness.builder()
    .evCode("cancel-application")
    .evDetails("User cancelled the application process at step 3.")
    .evActor("a.lee@nus.edu.sg")
    .build();

EventDetails details = EventDetailsForConfParamUpdate.builder()
    .updId("system")
    .obj("MaxConnections")
    .val("500")
    .build();

EventDetails details = EventDetailsForSensitiveDataAccess.builder()
    .accId("r.lim@nus.edu.sg")
    .objt("UserProfile")
    .obj("12345")
    .build();

EventDetails details = EventDetailsForException.builder()
    .name(ex.toString())
    .stackTrace(List.of(
        "at ScholarshipAdminController.LoadConfiguration() ...",
        "at ScholarshipAdminController.ProcessRequest() ...",
        "at Middleware.RequestHandler.Invoke() ..."))
    .build();
```

Rules:
- **MUST** use the record type appropriate to the log category.
- `event("ex")` and `event("authn")` are fixed for exception and authentication logs respectively.
- for business / authorization / sensitive-data / configuration events, **MUST** follow `.github/skills/nus-logging/SKILL.md` and use a **domain-specific event code** rather than a broad placeholder such as `func`.
- `EventDetailsForBusiness.evCode` **SHOULD** align with the `event` value where both are used.
- **MUST NOT** copy sample values that violate NUS privacy rules (for example, raw sensitive object names) into production logging.

## F) Logger APIs and shortcut methods

The Java shared component supports both:
- full structured record building, and
- shortcut APIs that derive request context and emit full-format records internally.

### F.1 Authentication shortcut after successful login

```java
log.info(log.authenticationLog(request).success(true).build());
```

### F.2 Request-aware shortcut logging

```java
logger.error("Error Occur! ", request, e);
logger.info("message", request);
```

### F.3 System-triggered logging without servlet request context

```java
logger.info("cronjob xxx is running!", "system");

logger.error("remote callback xxx is called and throw exception!",
             "system", ex);

ExceptionLog log = logger.exceptionLog(null)
    .userid("system")
    .isUser(false)
    .msg("Error Occur!")
    .exceptionDetails(logger, ex)
    .build();
logger.error(log);
```

Rules:
- use request-aware shortcuts when the required context lives on `HttpServletRequest`.
- use full builder APIs when the shortcut is insufficient for the required NUS log payload.
- for scheduler/batch/system-triggered flows, **MUST** set `userid`/actor semantics explicitly and correctly.
- shortcut APIs **SHOULD NOT** be used blindly if the resulting record would violate the NUS field contract.

## G) Exception handling patterns

The usage guide strongly recommends centralized exception handling.

### G.1 Recommended capture points
- `@ControllerAdvice`
- servlet filters
- `SimpleMappingExceptionResolver`
- servlet error handlers / error-page mappings

### G.2 Centralized exception logging example

```java
public class CustomSimpleMappingExceptionResolver extends SimpleMappingExceptionResolver {
    @Override
    protected void logException(Exception ex, HttpServletRequest request) {
        String userid = SecurityContextHolder.getContext().getAuthentication().getName();
        boolean isUser = (userid != null && !userid.isBlank());
        ExceptionLog log = logger.exceptionLog(request)
            .userid(userid != null ? userid : "system")
            .isUser(isUser)
            .msg("Error Message!")
            .exceptionDetails(logger, ex)
            .build();
        logger.error(log);
    }
}
```

Rules:
- exception logging **SHOULD** be centralized rather than duplicated across controllers/services.
- external responses **MUST** remain boundary-safe even when full exceptions are logged internally.
- **MUST** preserve the original throwable when using logger APIs that accept the exception.
- **MUST NOT** swallow exceptions silently after logging unless the application intentionally handles them.

## H) Migration guidance

### H.1 Replace imports

The guide provides migration targets for common logger abstractions:

```java
// legacy imports to replace
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
```

```java
// NUS Log Java shared component imports
import sg.edu.nus.monitor.Log;
import sg.edu.nus.monitor.LogFactory;
import sg.edu.nus.monitor.Logger;
import sg.edu.nus.monitor.LoggerFactory;
import sg.edu.nus.monitor.LogManager;
```

### H.2 Existing initialization patterns

```java
Logger log = LogManager.getLogger(...);
Logger log = LoggerFactory.getLogger(...);
Log log = LogFactory.getLog(...);

logger.error("Error Occur! ", e);
logger.info("message");
```

Migration rules:
- simple logger initialization and simple logging calls **MAY** remain visually similar after migration.
- when dynamic request data such as user ID, user type, or client IP is required, **SHOULD** use the Java shared component logger's request-aware APIs.
- migration **MUST** preserve the required NUS fields and privacy rules, not just method signatures.
- search/replace-only migrations **MUST** be reviewed for semantic correctness.

## I) Code review checklist

- [ ] The app actually requires the Java shared component; it was not introduced gratuitously
- [ ] `nus-common-log` version matches the application's `javax`/`jakarta` runtime
- [ ] `config.json` exists on the classpath and keys match runtime/session usage
- [ ] Session labels in code match `userTypeLabel` / `userIdLabel`
- [ ] Logger output configuration preserves the structured log payload (`%m%n`-style output)
- [ ] `ExceptionLog`, `AuthenticationLog`, and `EventLog` are used for the correct scenarios
- [ ] Exception logs use `event="ex"`; authentication logs use `event="authn"`
- [ ] Business/security/configuration event logs use domain-specific event codes aligned with `.github/skills/nus-logging/SKILL.md`
- [ ] No confidential values, raw sensitive payloads, passwords, tokens, or secrets are logged
- [ ] Centralized exception handling is used where practical
- [ ] Request-aware APIs are used when request context is needed; explicit/system user IDs are used for non-request flows
- [ ] Migration changes preserve behavior and do not mix old/new logger abstractions inconsistently


