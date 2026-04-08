---
name: java-rest-api
description: >
  Workable conventions for Spring MVC HTTP APIs in NUS Java applications.
  Supports @Controller and @RestController styles, POST-based CRUD/action endpoints
  (common in NUS apps), DTO/validation, request parameter patterns, response envelopes
  for Integration APIs, and boundary-safe error handling.
---

# Java – HTTP API (Spring MVC) (NUS defaults; pragmatic)

> **Scope:** Spring MVC controllers, request/response DTOs, validation, request params/path vars,
> response codes, response envelopes (Integration API), and centralized error mapping.
>
> **See also:**
> - Coding skill (boundary-safe errors + sensitive data): `.github/skills/coding/SKILL.md`
> - Java umbrella skill: `.github/skills/java/SKILL.md`
> - Java Spring Controller skill (Spring MVC mechanics): `.github/skills/java/spring-controller/SKILL.md`
> - Java Spring Security skill (authn/authz, JWT, filter chains): `.github/skills/java/spring-security/SKILL.md`
> - Java Spring Service skill (service-layer conventions; controllers should delegate to services): `.github/skills/java/spring-service/SKILL.md`

## Quick decision: REST API vs Spring Controller
- **MUST use this skill** for: endpoint style choices (POST-action vs REST verbs), URL base paths/versioning, request/response DTO contracts + validation, response envelopes, HTTP status codes, and centralized API error mapping.
- **MUST use `java-spring-controller`** for: Spring MVC mechanics/binding details (e.g., `@RequestPart` vs `@RequestParam`, multipart upload/download, content negotiation, filters/interceptors ordering, `@WebMvcTest` slice testing).
- **MUST NOT** duplicate controller mechanics guidance here; link to `.github/skills/java/spring-controller/SKILL.md`.

## A) Existing codebase rule (MOST IMPORTANT)
- For an **existing application**, you **MUST** follow the repo's established patterns:
  - `@Controller` vs `@RestController`
  - URL base path style (e.g., with or without `/api`, with or without versioning)
  - REST verbs vs POST-based CRUD/actions
  - response envelope conventions (if any)
  - error response shape (if any)
- You **MUST NOT** introduce a new API style (e.g., adding `/api/v1` everywhere, changing verbs) unless explicitly requested.

## B) Controller types: @Controller is allowed
### B.1 When to use what
- `@RestController` is **PREFERRED** when the controller only returns JSON.
- `@Controller` is **ALLOWED** and common in existing codebases.
  - If a `@Controller` returns JSON, methods **SHOULD** use `@ResponseBody` (or annotate class with `@ResponseBody`).

### B.2 Controller structure
- Controllers **MUST** use constructor injection.
- Controllers **MUST** be thin: delegate business logic to `@Service`.
- Controllers **SHOULD** not return persistence entities; use DTOs.

## C) Base paths & versioning (pragmatic)
- `/api/...` is **COMMON** and acceptable as a default **for new APIs**, but for existing codebases **follow what exists**.
- Versioning (`/v1`) is **OPTIONAL**:
  - If the repo already versions routes, follow it.
  - If the repo does not version routes, do not introduce `/v1` ad-hoc.

## D) Endpoint style
This repo/org may have **two** styles. The agent must pick the one the codebase already uses.

### D.1 Primary (NUS common): POST-based CRUD/actions
When this pattern is used, endpoints are modeled as actions:

- **Create**: `POST /<resource>/create`
- **Update**: `POST /<resource>/update`
- **Delete**: `POST /<resource>/delete`
- **Get by id**: `POST /<resource>/get` (or `POST /<resource>/detail`)
- **Search/list**: `POST /<resource>/search`

**Rationale:** works well with complex filters (request body), consistent validation, and enterprise gateway patterns.

### D.2 Optional: Standard REST verbs (ONLY if existing codebase uses it)
- `GET /<resource>`
- `GET /<resource>/{id}`
- `POST /<resource>`
- `PUT/PATCH/DELETE` **only** if the codebase already uses them consistently.

## E) Request inputs (concrete rules)
### E.1 Request body (`@RequestBody`) — recommended for NUS POST-based style
Use for:
- create/update/delete commands
- complex searches (recommended)
- bulk operations

Rules:
- Use `@Valid` on request bodies when Bean Validation is used.
- Prefer **one request DTO per endpoint** (clear validation + contract).

### E.2 Path parameters (`@PathVariable`)
Use when the codebase uses path-based IDs (REST-verb style):
```java
@GetMapping("/accounts/{accountId}")
public AccountDto get(@PathVariable Long accountId) { ... }
```

### E.3 Query parameters (`@RequestParam`)
Use for small/simple inputs such as pagination for GET endpoints:
```java
@GetMapping("/accounts")
public ResponseEntity<List<AccountDto>> list(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "50") int size,
    @RequestParam(required = false) String sort
) { ... }
```

### E.4 Headers (`@RequestHeader`)
Use for authentication credentials or optional caller metadata. Do **not** prescribe a correlation-ID header as a default.

**Integration API – API key (do not log):**
```java
@PostMapping("/accounts/search")
@ResponseBody
public ResponseEntity<ApiEnvelope<SearchAccountsResponse>> search(
    @RequestHeader(name = "X-Api-Key") String apiKey, // do not log
    @Valid @RequestBody SearchAccountsRequest request
) { ... }
```

**Internal frontend/BFF API – JWT bearer (do not log):**
```java
@PostMapping("/accounts/search")
@ResponseBody
public SearchAccountsResponse search(
    @RequestHeader(name = "Authorization") String authorization, // Bearer <jwt>; do not log
    @Valid @RequestBody SearchAccountsRequest request
) { ... }
```

See section K for authentication rules (logging, missing-key response, etc.).

## F) DTOs & validation
- Controllers **MUST** use request/response DTOs (decouple contracts from domain/persistence models).
- Validation **SHOULD** live in request DTOs using Bean Validation annotations.
- For search endpoints, request DTO **SHOULD** include pagination fields.

Example DTOs:
```java
public record CreateAccountRequest(
    @NotBlank String displayName,
    @Email @NotBlank String email
) {}

public record SearchAccountsRequest(
    String displayNameContains,
    String emailContains,
    @Min(0) Integer page,
    @Min(1) @Max(200) Integer size
) {}
```

## G) Integration API vs Internal frontend/BFF API response style (NUS guidance)
### G.1 Integration API: envelope + ResponseEntity
For Integration APIs (consumed by other NUS-hosted applications/services; outside this app boundary but within NUS):
- Responses **SHOULD** be wrapped in an envelope, e.g.:
  - `{ "success": true, "data": ... }`
  - `{ "success": false, "error": { "code": "...", "message": "..." } }`
- Controllers **SHOULD** return `ResponseEntity<ApiEnvelope<T>>` and set appropriate HTTP status codes.

Recommended (minimal) envelope shape:
```java
public record ApiEnvelope<T>(
    boolean success,
    T data,
    ApiError error,
    OffsetDateTime timestamp
) {}

public record ApiError(
    String code,
    String message
) {}
```

Rules:
- `message` **MUST** be boundary-safe (no stack traces, SQL, internal hostnames/paths, secrets).
- If the technical team chooses a different envelope, **follow that**.

### G.2 Internal frontend/BFF API: DTO direct return is allowed
For Internal frontend/BFF API endpoints used by your own frontend:
- Returning DTO directly (without `ResponseEntity`) is **ALLOWED** if that's the established style.
- Still follow validation and safe error-handling rules.

## H) Response codes (pragmatic)
Follow the repo's existing conventions. If not established:
- For POST-based actions, `200 OK` for success is **ACCEPTABLE**.
- `400` for validation failures.
- `404` when a requested resource is missing.
- `409` for conflicts (duplicates / optimistic locking / invalid state).
- `500` for unexpected errors (safe message only).

## I) Example controller (POST-based CRUD/actions; @Controller style)
```java
@Controller
@RequestMapping("/api/accounts") // /api is OK as a default; use existing base path if different
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping("/get")
    @ResponseBody
    public AccountDto getById(@Valid @RequestBody GetAccountRequest req) {
        return accountService.getById(req);
    }

    @PostMapping("/create")
    @ResponseBody
    public AccountDto create(@Valid @RequestBody CreateAccountRequest req) {
        return accountService.create(req);
    }

    @PostMapping("/update")
    @ResponseBody
    public AccountDto update(@Valid @RequestBody UpdateAccountRequest req) {
        return accountService.update(req);
    }

    @PostMapping("/delete")
    @ResponseBody
    public void delete(@Valid @RequestBody DeleteAccountRequest req) {
        accountService.delete(req);
    }

    @PostMapping("/search")
    @ResponseBody
    public SearchAccountsResponse search(@Valid @RequestBody SearchAccountsRequest req) {
        return accountService.search(req);
    }
}
```

Example request DTOs:
```java
public record GetAccountRequest(@NotNull Long id) {}
public record DeleteAccountRequest(@NotNull Long id) {}

public record UpdateAccountRequest(
    @NotNull Long id,
    @NotBlank String displayName
) {}
```

## J) Centralized error handling (recommended; required for Integration APIs)
- Use `@ControllerAdvice` / `@RestControllerAdvice` to centralize exception mapping.
- Errors **MUST** be boundary-safe (see `coding` skill).
- If the repo has no error standard yet, teams **SHOULD** introduce a consistent `ApiError` / envelope for Integration APIs.

Minimum expectation:
- Validation errors -> `400`
- Not found -> `404`
- Conflict -> `409`
- Unknown/unexpected -> `500` with safe error body

## K) Authentication inputs (boundary-level; implementation belongs in Spring Security skill)
This section defines **HTTP contract expectations** only. Spring Security configuration details (filter chains, token validation, etc.) belong in a dedicated security skill.

### K.1 Integration API: API key via `X-Api-Key` header
- Integration API endpoints **SHOULD** authenticate using the `X-Api-Key` header (NUS most common convention).
- Controllers/filters/interceptors **MUST NOT** log the `X-Api-Key` value.
- Missing or invalid API key → respond with `401 Unauthorized` (or follow repo convention).
- Error response **MUST** be boundary-safe (no internal details leaked).

### K.2 Internal frontend/BFF API: token/JWT via `Authorization` header
- Internal frontend/BFF API endpoints commonly use `Authorization: Bearer <jwt>`.
- The REST API skill **DOES NOT** prescribe how to validate tokens; that belongs in the Spring Security skill.
- Missing or invalid token → follow repo conventions (`401` vs `403`).

### K.3 General rules (both API types)
- Never echo credentials (API keys, tokens) in any response body or log.
- Never accept API keys or tokens in query parameters unless the existing codebase already does so (flag as tech debt even then).

## L) Integration API envelope examples
If your Integration API uses an envelope, the practical minimal JSON contract is:

### L.1 Success response example
```json
{
  "success": true,
  "data": {
    "id": 123,
    "displayName": "Alice Tan"
  },
  "error": null,
  "timestamp": "2026-03-21T10:15:30+08:00"
}
```

### L.2 Error response example
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "displayName: must not be blank"
  },
  "timestamp": "2026-03-21T10:15:30+08:00"
}
```

### L.3 Minimal Java envelope record (with timestamp)
```java
public record ApiEnvelope<T>(
    boolean success,
    T data,
    ApiError error,
    OffsetDateTime timestamp
) {}

public record ApiError(
    String code,
    String message
) {}
```

Notes:
- `timestamp` (`OffsetDateTime`) helps operational support and debugging; it is more practical than requiring a correlation ID header.
- If the repo already has a different envelope shape, **follow that**.

---

## Review checklist (agent-use)

When reviewing or generating REST API code, check:

- [ ] API path follows the repo's versioning convention (`/api/v1/...` or established pattern); version is not omitted for new endpoints
- [ ] Response envelope shape matches the repo standard (success/data/error/timestamp or established shape); no one-off structures introduced
- [ ] Input DTOs use `@Valid` + JSR-303 constraints; validation errors return HTTP 400 with a structured error body
- [ ] Authentication is enforced at the security layer; endpoints require authentication unless explicitly `permitAll`
- [ ] Authorization checks cover all protected resources; no missing authorization gap for new or modified endpoints
- [ ] Error responses do not leak stack traces, SQL, internal hostnames, class names, or sensitive data
- [ ] Non-idempotent operations (POST mutations) have idempotency considered; `requestId`/deduplication present where required
- [ ] Paginated endpoints validate and bound `page` and `size` parameters; defaults are set and `size` has a maximum
- [ ] Timeouts are configured for any blocking calls to downstream services; unbounded waits are not introduced
- [ ] No sensitive data (tokens, NRIC/FIN, passwords) is logged from request/response bodies or authorization headers
- [ ] 4xx vs 5xx status codes are applied correctly: business rule violations and validation errors use 4xx; unexpected system errors use 5xx
- [ ] OpenAPI/Swagger annotations or contract documents are updated when an endpoint signature changes
