---
name: coding
description: >
  General software coding best practices, naming conventions, code structure,
  documentation, and guidelines applicable across all languages and frameworks.
  Use this skill when asked to review code quality, apply naming conventions,
  structure a codebase, write comments, or follow clean code principles.
---

# Coding – Best Practices, Naming Conventions & Guidelines

## A) Coding Style & Formatting (NUS Defaults)

> **Terminology note:** “existing codebase” refers to code already present in a repository/application that may follow older conventions.  
> For existing codebases, avoid large non-functional churn unless explicitly planned.

### A.1 Formatting approach (pragmatic)
- **MUST** keep formatting consistent within the file/module being changed.
- For **new code**, **SHOULD** use IDE autoformat before committing.
- **MUST NOT** hand-format code in a way that fights IDE autoformat defaults.
- For **existing codebases**, **SHOULD** avoid large “format-only” diffs in PRs that are primarily functional changes.
  - If formatting improvements are desirable, **SHOULD** propose them as a follow-up task or limit formatting to the lines/blocks being modified.

### A.2 Indentation & whitespace
- Indentation **MAY** use tabs or spaces; the key requirement is clear, consistent indentation.
- **SHOULD** prefer spaces for new code when possible (commonly 4 spaces per level), but **MUST** follow the existing file’s indentation style unless explicitly refactoring formatting.
- **MUST** avoid trailing whitespace.
- **MUST** end files with a single newline.

### A.3 Line length (soft limit)
- **SHOULD** keep lines within **120 characters** where practical.
- If readability suffers due to excessive wrapping, prefer clarity over strict line length.

### A.4 Imports (general)
- **MUST** remove unused imports.
- Wildcard/glob imports (e.g., `import x.*`) are **ALLOWED**, but:
  - In production/source code, usage **SHOULD** be flagged as a code review item and considered for replacement with explicit imports.
  - In test code, wildcard/glob imports **MAY** be acceptable if that is the project’s convention.

### A.5 Wrapping, trailing commas, and micro-style rules
- Wrapping style and similar micro-formatting details are **IDE autoformat-defined**.
- **SHOULD NOT** introduce style-only changes unless they are directly related to the code being modified or explicitly requested.

### A.6 Code structure & maintainability (language-agnostic)
- Code **SHOULD** follow the Single Responsibility Principle: a class/module/function should have one clear reason to change.
- Methods/functions **SHOULD** be short and focused. As a rule of thumb, keep a method under ~20 lines where practical, but prefer clarity over rigid limits.
- Files/classes **SHOULD** remain focused; avoid “God classes” that accumulate unrelated responsibilities.
- Code **SHOULD** avoid deep nesting. Prefer guard clauses / early returns to keep the happy path readable.
- Shared mutable state **SHOULD** be minimized. Prefer immutability where reasonable (e.g., `final`/`const`, pure functions, explicit state transitions).

### A.7 Clean code principles (pragmatic)
- Code **SHOULD** follow **DRY**: avoid copy-paste duplication; extract shared logic when it improves readability and maintainability.
- Code **SHOULD** follow **KISS**: prefer simple, readable solutions over clever abstractions.
- Code **SHOULD** follow **YAGNI**: avoid building speculative features or abstractions without a clear current requirement.
- Code **SHOULD** “fail fast” on invalid inputs: validate early and return/throw a meaningful, **safe** error (see **Section C** for error handling and sensitive data rules).
- Code **SHOULD** prefer immutability where practical (e.g., `final`/`const`, pure functions, explicit state transitions).

### A.8 Comments & documentation
- Code **SHOULD** be self-documenting: good names and clear structure reduce the need for comments.
- Comments **SHOULD** explain the *why* (intent, constraints, trade-offs), not restate the *what*.
- Public APIs and non-trivial logic **SHOULD** have docstrings/Javadoc (or equivalent) that describe:
  - purpose and key behavior
  - parameters/return values (where not obvious)
  - error/edge-case behavior (safe, non-sensitive)
- Comments **MUST** be kept up to date. Stale comments **MUST** be removed or corrected.
- Commented-out code **SHOULD NOT** be left in the codebase; prefer version control history (unless temporarily required during an active debugging session, and removed before merge).

## B) Naming Conventions

> This section is language-agnostic; language/framework-specific rules belong in the respective skill files.

### B.0 Existing codebase refactoring rule (low-impact only)
- For **new applications**, follow the standards in Section B.
- For an **existing codebase**, follow the project’s established conventions by default.
- Refactoring existing naming/package conventions is **OPTIONAL** and should be suggested **only when low impact** and benefit is clear.
- If not low impact, capture as a tech debt item instead of introducing churn in a functional PR.

**Low-impact refactor checklist (ALL should be true):**
- The change has a small blast radius (limited files/usages).
- The change is mostly mechanical (rename/move) with minimal behavioural risk.
- The code area is well-covered by tests OR the change is low-risk enough to validate quickly.
- No external consumers/contracts are impacted (no shared module/public API breakage).
- The PR remains reviewable (avoid massive rename-only/format-only noise).

### B.1 General naming rules (language-idiomatic)
- Names **MUST** be specific and reflect responsibility; avoid vague names.
- Naming **MUST** follow the project’s established conventions. For new codebases, **SHOULD** follow the language ecosystem’s idioms.

- **Types (classes/structs/interfaces/enums)**: **SHOULD** use `PascalCase` (common across many ecosystems), unless the project uses a different standard.
- **Functions/methods & variables**: **SHOULD** follow language conventions (e.g., Java methods often `camelCase`, C# methods often `PascalCase`; locals commonly `camelCase`).
- **Booleans**: **SHOULD** be prefixed with `is`, `has`, `can`, or `should` (e.g., `isActive`, `hasPermission`, `canRetry`, `shouldRefreshCache`).
- **Constants**: **SHOULD** follow language conventions (e.g., `UPPER_SNAKE_CASE` in many languages; `PascalCase` in some .NET codebases).
- **Packages / namespaces / modules**: **SHOULD** follow language conventions and be consistent within the repository.
- **Avoid abbreviations**: **SHOULD** prefer clear terms unless the abbreviation is a well-known domain term (e.g., `nric`, `fin`, `jwt`, `url`).

### B.1.1 Enum naming
- Enum types **SHOULD** be named as nouns without `Enum` suffix (e.g., `OrderStatus`, not `OrderStatusEnum`), unless the project already uses a suffix convention.
- Enum member naming **SHOULD** follow language conventions (e.g., Java often `UPPER_SNAKE_CASE`; C# commonly `PascalCase`).
- Enums **SHOULD** be placed near the domain where they are used rather than in a “misc enums” dumping area.
- For existing codebases, keep the current approach unless change is low impact (see **B.0**).

### B.2 Common class suffix conventions (layered architecture)
The following suffixes are **common** in layered applications, but projects **MAY** use different patterns:
- Actions / Controllers / Handlers: `XxxAction`, `XxxController`, `XxxHandler`
- Services: `XxxService`
- Data access: `XxxRepository`, `XxxDao` (technology-specific; follow project conventions)
- Configuration: `XxxConfig`
- Exceptions: `XxxException`, `XxxNotFoundException`

### B.3 Discouraged / review-required suffixes
The following are **allowed** but **SHOULD be avoided** for new code and **SHOULD be flagged in code review** unless clearly justified:
- `Helper` (usually unclear responsibility)
- `Manager` (often too broad)
- `Common` (usually indicates poor ownership)
- `Impl` (usually adds no meaning unless it distinguishes multiple implementations)

**Guidance:**
- Prefer names that describe *what it does*: `JwtTokenValidator` over `SecurityHelper`.
- If multiple implementations exist, prefer meaningful implementation names:
  - `NotificationService` with `EmailNotificationService`, `SmsNotificationService` (avoid `NotificationServiceImpl`).

### B.4 Technology/framework-specific conventions
Technology/framework-specific naming and packaging rules **MUST** live in the relevant language/framework skill.
- For Java/Spring conventions, see `.github/skills/java/SKILL.md`.

## C) Error handling, API-safe failures & sensitive data (NUS defaults)

### C.0 Principles
- Errors **MUST** be safe to expose at system boundaries (do not leak internal implementation details).
- Error handling **SHOULD** preserve the original root cause for debugging, while returning a sanitized message externally.
- Unexpected failures **MUST** be observable (logs/metrics/tracing as available) and should include correlation identifiers where possible.
- Code **MUST NOT** silently swallow exceptions. If an error is caught, it **MUST** be handled meaningfully or rethrown/wrapped with context and made observable.
- Where available, logs/telemetry/traces **SHOULD** include a correlation identifier (request ID / trace ID / job execution ID), and it **MUST NOT** be derived from sensitive identifiers (e.g., NRIC/FIN, email address, phone number, or any other PII). Use opaque generated IDs such as `traceId`, `requestId`, or `jobId` (e.g., UUID-based).

### C.1 Sensitive data handling (NUS defaults)
**Sensitive data MUST NOT be logged or exposed externally in clear text.** This includes (non-exhaustive):
- Full name
- NRIC / FIN
- Credit card number
- Bank account number
- Residential Address
- Home line number
- Mobile phone number

**Masking / redaction rule:**
- Sensitive data **MUST NOT** be shown on-screen in clear text by default.
- Full name is an **EXCEPTION** and **MAY** be shown on-screen when it is a legitimate business requirement.
- Sensitive data **MUST** be masked/redacted in logs (logs can be extracted and shared).
- Masking **MUST** be applied before writing to logs, telemetry, traces, or error reports.
- Full name **MUST be masked in logs** even if it is shown on screen.
- Never log secrets/tokens/passwords. If such values exist, they **MUST** be fully redacted (no partial display).
- Exception messages **MUST NOT** include sensitive data in clear text, because exceptions are commonly logged and propagated.

### C.2 Error categories (taxonomy)
When raising/handling errors, classify them consistently:
- **Validation errors**: caller provided invalid input (missing/invalid fields, invalid format).
- **Business rule violations**: input is valid but violates business constraints (e.g., state transitions, quota exceeded).
- **Not found**: referenced resource/entity does not exist (or is not accessible).
- **Conflict**: request cannot be completed due to current state (e.g., optimistic locking, duplicate keys).
- **Dependency failures**: downstream system/database/network failures.
- **System/unexpected errors**: bugs, null dereferences, unhandled edge cases.

### C.3 Messages: internal vs external
- External-facing messages **MUST** be:
  - non-sensitive (see **C.1**)
  - stable (do not expose stack traces, SQL, internal hostnames, internal IDs that should not be public)
  - user-consumable (brief, clear)
- Internal messages (for logs/alerts) **SHOULD** include enough context to diagnose:
  - operation name and key identifiers (non-sensitive)
  - root cause exception
  - correlation ID (if available)

### C.4 Exception / error object structure
- Prefer domain-specific exception types or error objects that encode:
  - **category** (from C.2)
  - **error code/key** (stable identifier suitable for dashboards and client handling)
  - **safe message** (for boundary responses)
  - **cause** (original exception, preserved internally)
- Avoid creating many near-duplicate exception types with no additional meaning.
- Boundary-safe errors **SHOULD** include a stable **error code/key** suitable for client handling and dashboards, independent of the message text.

### C.5 Boundary mapping (API-safe failures)
At any system boundary (REST API, message consumer, CLI, batch job output, etc.):
- Internal exceptions **MUST** be mapped to a boundary-safe error representation.
- Boundary-safe errors **MUST NOT** leak:
  - stack traces
  - SQL statements / schema details
  - internal file paths
  - internal network/service names
  - secrets or sensitive data (see **C.1**)
- Mapping logic **SHOULD** be centralized (one place per boundary) to keep behavior consistent.
- For unexpected/system errors, external responses **MUST** use a generic safe message and avoid revealing whether a specific user/resource exists (where applicable).

### C.6 Retriable vs non-retriable failures
- Retriable failures **SHOULD** be limited to transient conditions (timeouts, temporary dependency unavailability).
- Non-retriable failures **MUST NOT** be retried blindly (validation failures, business rule violations, deterministic conflicts).
- If retry is implemented, it **MUST** have:
  - bounded retries
  - backoff strategy
  - clear observability (logs/metrics)
- Retries **MUST** be designed to be safe (idempotent where required) to avoid duplicate side effects.

### C.7 Logging (generic rules)
- Errors **SHOULD** be logged with a consistent severity and include correlation identifiers where available.
- Logs **MUST NOT** contain secrets or sensitive personal data in clear text (see **C.1**).
- Follow NUS organization-specific logging format and libraries where applicable (see also).

## D) Code review rules (Copilot checklist)

> Use this section as a **review checklist** and as guidance for what Copilot should propose by default.
> This checklist is language-agnostic; language/framework-specific rules belong in the respective skill files.

### D.0 PR scope & reviewability
- PRs **SHOULD** be small and focused on a single change/theme (keep changes reviewable).
- PRs **MUST NOT** mix unrelated concerns (e.g., broad refactors, mass renames, formatting churn) with functional changes unless explicitly planned.
- If a PR unavoidably contains multiple concerns, the PR description **SHOULD** explain why it cannot be split.

### D.1 Correctness & defensive coding
- Code changes **MUST** preserve existing behavior unless the PR explicitly intends to change it.
- Inputs and assumptions **SHOULD** be validated at boundaries; fail fast with a meaningful, **safe** error (see **Section C**).
- Edge cases **SHOULD** be handled explicitly (null/empty, timeouts, retries, partial failures) where applicable.

### D.2 Security, privacy & sensitive data (NUS defaults)
- PRs **MUST NOT** introduce logging or exposure of sensitive data (see **C.1**).
- Error messages and logs **MUST** remain boundary-safe (see **C.5**) and **MUST NOT** leak stack traces, SQL, internal hostnames, internal IDs, or secrets.
- Secrets/tokens/passwords **MUST NOT** be committed into source control (use environment variables / secret managers as applicable).

### D.3 Security basics (implementation rules)
- When interacting with SQL or query languages, code **MUST** use parameterized queries/bind variables. Code **MUST NOT** build queries via string concatenation using untrusted input.
- When rendering/returning user-controlled content (web/UI/HTML/email/templates), outputs **SHOULD** be validated/encoded to prevent injection/XSS where applicable.
- Deserialization and dynamic evaluation (e.g., reflective execution, expression languages) **SHOULD** be avoided for untrusted input; if required, it **MUST** be constrained and justified.

### D.4 Tests & verification (NUS defaults)
- For **new code**, **JUnit tests MUST be added** where applicable.
- When modifying **business logic**, unit tests **SHOULD** be added/updated to cover expected behavior and edge cases.
- When modifying **controllers or integration points**, tests **SHOULD** be added/updated (unit and/or integration tests as appropriate to the repo).
- Regression tests **MUST** be added when making **core changes** to the application and a regression scenario is identifiable.
- CI checks **MUST** pass before merge unless there is an explicit waiver and follow-up plan.

> **Note:** NUS CI/CD pipelines may include gating tools such as **Sonatype**, **SonarQube**, and **Fortify**. Copilot cannot directly query these tools here; reviewers **MUST** rely on the PR checks/results and address any reported issues before merge.

### D.5 Maintainability & readability
- Code **SHOULD** follow SRP and avoid “God classes” (see **A.6**).
- Code **SHOULD** avoid duplication (DRY) and unnecessary complexity (KISS/YAGNI) (see **A.7**).
- Public APIs and non-trivial logic **SHOULD** be documented (see **A.8**).
- Naming **MUST** follow repo conventions; new naming conventions **MUST NOT** be introduced ad-hoc (see **Section B**).

### D.6 Error handling & observability
- Exceptions/errors **MUST NOT** be swallowed; caught errors **MUST** be handled meaningfully or rethrown/wrapped with context (see **C.0**).
- Logs/telemetry **SHOULD** include correlation identifiers where available and **MUST NOT** include sensitive data (see **C.0**, **C.1**, **C.7**).
- Retry logic (if added) **MUST** be bounded and safe (idempotent where required) (see **C.6**).

### D.7 Compatibility & operational impact
- Changes **SHOULD** avoid breaking external contracts (APIs, message schemas, database schemas) unless explicitly planned and versioned.
- If a migration is required (schema/config), the PR **SHOULD** include rollout/rollback considerations or a linked follow-up task.
- Performance-sensitive changes **SHOULD** avoid unbounded reads/loads and obvious hot-path inefficiencies; where risk exists, include evidence (benchmark, metrics, query plan) or an explicit follow-up.

### D.8 Copilot review output format (recommended)
When performing a review or proposing changes, Copilot **SHOULD** use this structure (omit sections that are not applicable):

- **Summary**: what changed and why.
- **Must fix**:
  - violations of **MUST/MUST NOT** rules from this skill (security/privacy, boundary-safe errors, etc.)
  - missing/invalid Azure DevOps work item reference token (`AB#<digits>`) in the **PR title** or **commit messages**, **when the repository uses Azure DevOps** (see **Section E**)
- **Should fix**: strong improvements (correctness, maintainability, edge cases).
- **Nice to have**: minor readability/cleanup suggestions.
- **Suggested tests**: what tests to add/update and what scenarios to cover (see **D.4**).
- **Verification notes**:
  - refer to the CI gate note in **D.4** (Sonatype / SonarQube / Fortify) and ensure PR checks/results are addressed
  - state any assumptions made due to missing context

## E) Git conventions (NUS defaults; required for Copilot-assisted changes)

> These conventions are used to standardize Copilot-assisted changes for traceability.  
> If a repository already has established Git/PR conventions, those repo rules take precedence.

### E.0 Azure DevOps work item reference (traceability rule)
- **If the repository uses Azure DevOps (ADO) for work item tracking**, PRs and commits **MUST** include a work item reference token in the exact format: `AB#<digits>` (e.g., `AB#12345`).
- The token **MUST** use uppercase `AB#` followed by **one or more digits** (no spaces).
- If a PR includes **multiple work items**, the PR body **MAY** include multiple tokens; in that case the PR title **MUST** include the primary token.
- **If the repository does not use Azure DevOps**, follow the repository's existing traceability conventions. **MUST NOT** invent `AB#` tokens that have no corresponding ADO work item.

### E.1 Commit message format
- **For ADO-linked repositories:** commit messages **MUST** start with the work item token followed by `: ` and a concise description.
- **For non-ADO repositories:** follow existing repo commit message conventions.

**Examples (ADO-linked repos):**
- `AB#12345: feat: add user lookup endpoint`
- `AB#12345: fix: handle null account status`
- `AB#12345: chore: bump dependencies`

### E.2 Branch naming
- Branch names **SHOULD** include the work item token when available.
- Recommended pattern: `<type>/AB#12345-<short-desc>`
  - `<type>` examples: `feature`, `bugfix`, `chore`, `hotfix`

### E.3 Pull request title format
- **For ADO-linked repositories:** PR titles **MUST** start with the work item token followed by `: ` and a concise description.
- **For non-ADO repositories:** follow existing repo PR title conventions.

**Examples (ADO-linked repos):**
- `AB#12345: Add user lookup endpoint`
- `AB#12345: Fix null pointer in payment reconciliation`

### E.4 Definition of Done (DoD)
A PR is “done” only when:
- Work item reference is present when the repository uses Azure DevOps (see **E.0–E.3**); otherwise the repository’s traceability conventions are met.
- Requirements are met and behavior matches expected outcome.
- Tests are added/updated as appropriate (see **D.4**).
- CI checks are green, including NUS pipeline gates (e.g., Sonatype/SonarQube/Fortify) where configured.
- No sensitive data is logged or exposed (see **C.1**).
- Documentation is updated if behavior/ops procedures changed (when applicable).

## See also
- Java skill: Java-idiomatic naming, exceptions, Spring/JPA conventions (see `.github/skills/java/SKILL.md`).
- Java REST API skill: HTTP contract, endpoint style, DTO/validation, response envelopes, boundary-safe error mapping (see `.github/skills/java/rest-api/SKILL.md`).
- Spring Controller skill: Spring MVC wiring mechanics (binding, multipart, controller advice, filters, slice testing) (see `.github/skills/java/spring-controller/SKILL.md`).
- Spring Service skill: service-layer conventions (@Transactional, orchestration, exception strategy, observability, authorization placement) (see `.github/skills/java/spring-service/SKILL.md`).
- Spring Security skill: authentication/authorization (SecurityFilterChain, JWT, method security) (see `.github/skills/java/spring-security/SKILL.md`).
- Java JPA skill: entities/repositories, fetching, OSIV, N+1 avoidance (see `.github/skills/java/jpa/SKILL.md`).
- Java JDBC skill: JdbcTemplate/NamedParameterJdbcTemplate + SQL patterns (see `.github/skills/java/jdbc/SKILL.md`).
- [Testing skill: test naming/structure conventions, unit vs integration testing guidance.]
- Spring Boot skill (Boot application setup, `@ConfigurationProperties`, profiles, Actuator): `.github/skills/java/spring-boot/SKILL.md`.
- Spring Batch skill: job/step naming, reader/processor/writer naming, batch package conventions (see `.github/skills/java/spring-batch/SKILL.md`).
- [Logging skill (NUS-specific): required log format/fields and custom Java logging library usage.]
