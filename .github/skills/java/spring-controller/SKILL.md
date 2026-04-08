---
name: java-spring-controller
description: >
  Spring MVC controller mechanics and implementation patterns for NUS Java applications.
  Covers controller structure, method binding (@RequestBody, @RequestParam, @PathVariable,
  @ModelAttribute), content negotiation, file upload/download, @ControllerAdvice exception
  handling, filters/interceptors, async requests, and @WebMvcTest slice testing.
  Use this skill when implementing or reviewing Spring MVC controller code.
  Do not re-define API contract rules; refer to .github/skills/java/rest-api/SKILL.md
  for endpoint style, DTO naming, response envelope conventions.
---

# Java – Spring Controller (NUS defaults; pragmatic)

> **Scope:** Spring MVC controller mechanics — binding, content negotiation, file upload/download,
> `@ControllerAdvice` exception handling, filters/interceptors, async patterns, and slice testing.
>
> **This skill covers the *how* of controller wiring, not the *what* of API contracts.**
> Do not re-define API contract rules here. For endpoint style, DTO naming, response envelope
> conventions, and HTTP status codes, refer to `.github/skills/java/rest-api/SKILL.md`.
>
> **See also:**
> - Coding skill (boundary-safe errors + sensitive data): `.github/skills/coding/SKILL.md`
> - Java umbrella skill: `.github/skills/java/SKILL.md`
> - Java REST API skill (endpoint style, DTOs, response envelopes, error mapping): `.github/skills/java/rest-api/SKILL.md`
> - Java Spring Security skill (SecurityFilterChain, JWT, method security): `.github/skills/java/spring-security/SKILL.md`
> - Java Spring Service skill (service-layer conventions; thin controllers delegate to services): `.github/skills/java/spring-service/SKILL.md`

## Quick decision: REST API vs Spring Controller
- **MUST use this skill** for: controller wiring/mechanics (binding annotations, multipart handling, content negotiation, advice mechanics, filters/interceptors, slice testing).
- **MUST use `java-rest-api`** for: API contract decisions (endpoint style, DTO naming/validation conventions, response envelopes, HTTP status conventions, error response shape).
- **MUST NOT** redefine API contract rules here; link to `.github/skills/java/rest-api/SKILL.md`.

## A) Existing codebase rule (MOST IMPORTANT)
For an **existing application**, you **MUST** follow the repo's established patterns for:
- `@Controller` vs `@RestController` (do not switch styles unilaterally)
- use of `ResponseEntity` vs plain return types (follow existing handler method signatures)
- `@ControllerAdvice` vs `@RestControllerAdvice` and the existing exception hierarchy
- existing interceptors and servlet filters — their ordering and registration approach
- existing content negotiation configuration (default media types, Jackson configuration)
- `@ModelAttribute` and form binding style if used in the codebase

You **MUST NOT** refactor controller wiring style (e.g., converting `@Controller` to `@RestController`,
adding `ResponseEntity` wrappers everywhere, or changing advice class types) unless explicitly requested.

## B) Controller structure
### B.1 Injection and class design
- Controllers **MUST** use constructor injection (no field injection, no setter injection for required deps).
- Controllers **MUST** be thin: validate input (via `@Valid`), delegate to `@Service`, return result.
- Business logic **MUST NOT** live in controllers.
- Controllers **SHOULD NOT** return persistence entities; use DTOs (see Java REST API skill for DTO conventions).

### B.2 @Controller vs @RestController
- `@RestController` = `@Controller` + `@ResponseBody` on all methods; use when the controller only returns JSON/data.
- `@Controller` is **ALLOWED** (common in existing codebases); methods returning JSON **SHOULD** carry `@ResponseBody`.
- **MUST** follow whatever style the existing codebase uses (see section A).

### B.3 ResponseEntity usage
- `ResponseEntity<T>` is useful when you need to control headers or status code per method.
- Avoid using `ResponseEntity` purely for wrapping when the repo has centralized advice for status mapping; follow repo conventions.
- Do not mix returning `ResponseEntity` and plain types inconsistently within the same controller unless that is the existing pattern.

> **API contract details** (DTO naming, response envelope, HTTP status conventions): see `.github/skills/java/rest-api/SKILL.md`.

## C) Method signatures & binding
### C.1 @RequestBody
- Use `@RequestBody` for JSON (or other body-based) payloads.
- Always pair with `@Valid` when the request DTO carries Bean Validation constraints.
- Prefer one request DTO per endpoint (clear contract; easier validation).

```java
@PostMapping("/accounts/create")
@ResponseBody
public AccountResponse create(@Valid @RequestBody CreateAccountRequest request) {
    return accountService.create(request);
}
```

### C.2 @RequestParam
- Use for simple scalar inputs: pagination, filters on GET endpoints, optional flags.
- Provide `defaultValue` for optional params to avoid `MissingServletRequestParameterException`.
- Do **not** use `@RequestParam` for complex search criteria — use `@RequestBody` instead (NUS POST-based style).

```java
@GetMapping("/accounts")
public List<AccountResponse> list(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "50") int size
) { ... }
```

**Pagination guardrails** (endpoints accepting `page`/`size`):
- **MUST** enforce a maximum `size` (e.g., 200) to prevent unbounded queries; reject or silently cap oversized requests per repo convention.
- **MUST** set sensible defaults (`page = 0`, `size = 20`–`50`) so callers do not receive unbounded results by accident.
- **MUST** validate that `page` is non-negative; return `400` for negative values.
- This is a controller-level **binding guardrail** (parameter binding, size limits, default values). The response shape for paginated results, cursor/offset conventions, and envelope format are defined in `.github/skills/java/rest-api/SKILL.md` — do not redefine them here.

### C.3 @PathVariable
- Use when the codebase uses path-based resource identification (REST-verb style).
- Name **MUST** match the URI template placeholder exactly, or specify `@PathVariable("name")` explicitly.
- **MUST NOT** use path variables for sensitive data (IDs that expose internal key sequences may be acceptable; PII must not appear in URLs).

```java
@GetMapping("/accounts/{accountId}")
public AccountResponse getById(@PathVariable Long accountId) { ... }
```

### C.4 @ModelAttribute (form binding)
- Use `@ModelAttribute` for HTML form / `application/x-www-form-urlencoded` binding.
- **MUST NOT** mix `@RequestBody` and `@ModelAttribute` on the same method parameter — they use different message converters and will conflict.
- Do not introduce `@ModelAttribute` into a codebase that exclusively uses JSON APIs unless the requirement explicitly calls for it.

### C.5 Binding/validation nuances
- Bean Validation (`@Valid` / `@Validated`) triggers `MethodArgumentNotValidException` for `@RequestBody` and `ConstraintViolationException` for `@RequestParam`/`@PathVariable` — handle both in `@ControllerAdvice` (see section F).
- `@Validated` supports validation groups; `@Valid` does not — use the one the codebase already uses.
- Do not apply both `@Valid` and `@Validated` on the same parameter.

### C.6 @RequestHeader hygiene
Use `@RequestHeader` only for **safe, non-credential metadata** (e.g., correlation IDs, `Accept-Language`, custom trace headers).

**MUST NOT:**
- Log the value of sensitive headers (`Authorization`, `X-Api-Key`, or any bearer/token header), even at `DEBUG` level.
- Accept API keys, tokens, or passwords via `@RequestParam` (query parameters) — query parameters appear in server logs, browser history, and referrer headers.

**MUST:**
- Rely on the Spring Security / filter layer for authentication and authorization (see `.github/skills/java/spring-security/SKILL.md`). Do not re-implement credential extraction inside a controller method.
- Follow existing repo conventions for any custom headers (naming, casing, optionality).

```java
// GOOD — safe optional metadata header
@GetMapping("/items")
public List<ItemResponse> list(
        @RequestHeader(value = "X-Correlation-Id", required = false) String correlationId) {
    // correlationId is safe to use as a trace value; MUST NOT log raw auth headers here
    ...
}

// BAD — accepting a credential via query parameter
@GetMapping("/items")  // ?apiKey=secret  <-- MUST NOT
public List<ItemResponse> list(@RequestParam String apiKey) { ... }
```

## D) Content negotiation
### D.1 produces / consumes
- `produces` declares the media type the method returns; `consumes` declares what it accepts.
- Specify them explicitly when the controller handles a mix of media types or when the contract must be unambiguous.
- JSON-only controllers consuming/producing `application/json` do not need to repeat it on every method if the class-level default is correct.

```java
@PostMapping(value = "/report", produces = MediaType.APPLICATION_PDF_VALUE)
public ResponseEntity<byte[]> downloadReport(@Valid @RequestBody ReportRequest request) { ... }
```

### D.2 JSON vs form
- JSON is the default for `@RestController` / `@ResponseBody`.
- `application/x-www-form-urlencoded` requires `@ModelAttribute` (see C.4) and explicit `consumes`.
- `multipart/form-data` requires `MultipartFile` (see section E).
- Do not configure multiple `consumes` values on one endpoint unless the business requirement genuinely allows both.

### D.3 Streaming responses
- For streaming / chunked responses, return `ResponseEntity<StreamingResponseBody>` or `StreamingResponseBody` directly.
- Set `Content-Type` and `Content-Disposition` headers explicitly in the response.
- Do not load the full content into memory; write to the `OutputStream` incrementally (see section E for file download patterns).

```java
@GetMapping(value = "/export", produces = MediaType.TEXT_CSV_VALUE)
public ResponseEntity<StreamingResponseBody> exportCsv() {
    StreamingResponseBody body = outputStream -> {
        // write CSV rows incrementally
    };
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"export.csv\"")
        .body(body);
}
```

## E) File upload / download
### E.1 File upload (MultipartFile)
- Use `@RequestParam MultipartFile file` (or `MultipartFile[]` for multiple files).
- Always validate:
  - file size (enforce via `spring.servlet.multipart.max-file-size` / `max-request-size` in config, **not** only in code)
  - content type (`file.getContentType()`) against an allowlist — **MUST NOT** trust the client-supplied MIME type blindly; validate file bytes/magic numbers for security-sensitive contexts
  - filename — **MUST NOT** use `file.getOriginalFilename()` directly as a storage path; sanitize or replace with a server-generated name to prevent path traversal

```java
@PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public UploadResponse upload(@RequestParam("file") MultipartFile file) {
    if (file.isEmpty()) {
        throw new ValidationException("File must not be empty");
    }
    String safeFilename = UUID.randomUUID() + getExtension(file.getOriginalFilename());
    // store safeFilename, not the original name
    return storageService.store(file.getInputStream(), safeFilename);
}
```

**MUST NOT** rules for file upload:
- **MUST NOT** use `file.getOriginalFilename()` as a filesystem path without sanitization.
- **MUST NOT** store uploaded files to the application's classpath or deployment directory.
- **MUST NOT** accept executable file types (`.exe`, `.sh`, `.jar`, etc.) unless explicitly required and scoped.

### E.2 File download
- Set `Content-Disposition: attachment; filename="<safe-name>"` — **MUST** use a server-controlled filename, not a user-supplied name.
- Set `Content-Type` explicitly; do not let the browser guess.
- Stream large files — **MUST NOT** load the full file into a `byte[]` before writing when the file may be large.

```java
@GetMapping("/files/{fileId}/download")
public ResponseEntity<StreamingResponseBody> download(@PathVariable Long fileId) {
    FileMetadata meta = storageService.getMetadata(fileId);
    StreamingResponseBody body = out -> storageService.streamTo(fileId, out);
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION,
            "attachment; filename=\"" + meta.getSafeFilename() + "\"")
        .contentType(MediaType.parseMediaType(meta.getContentType()))
        .body(body);
}
```

**MUST NOT** rules for file download:
- **MUST NOT** set `Content-Disposition` to a user-supplied filename without sanitization.
- **MUST NOT** expose internal storage paths in the download URL or response headers.

### E.3 `@RequestPart` vs `@RequestParam` for multipart

| Scenario | Annotation to use |
|---|---|
| File **only** (plain form field) | `@RequestParam("file") MultipartFile` |
| File **plus** a JSON/structured metadata part | `@RequestPart` for each named part |

Use `@RequestPart` when the client submits a `multipart/form-data` request that contains both a file and a JSON DTO as separate named parts:

```java
@PostMapping(path = "/documents/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public UploadResponse upload(
        @RequestPart("file") MultipartFile file,
        @RequestPart("metadata") @Valid DocumentMetadata metadata) {
    // file     = the binary part
    // metadata = deserialized from the application/json part via Jackson
    return storageService.store(file, metadata);
}
```

- `@RequestPart` routes the part through the configured `HttpMessageConverter` (e.g., Jackson for `application/json` parts), enabling full DTO binding and `@Valid` validation.
- `@RequestParam` binds a form field as a `String` or `MultipartFile`; it does **not** invoke message converters, so it cannot deserialize a JSON part.
- **MUST NOT** use `@RequestParam` to receive a structured JSON part; use `@RequestPart` instead.

## F) Exception handling mechanics
### F.1 @ControllerAdvice vs @RestControllerAdvice
- `@RestControllerAdvice` = `@ControllerAdvice` + `@ResponseBody`; use when all advice methods return a JSON body.
- `@ControllerAdvice` is the more general form; use it if the codebase includes non-JSON controllers or the project already uses it.
- **MUST** follow the existing advice class type in the repo (see section A).

### F.2 Mapping exceptions to responses
- Map exceptions to HTTP status codes and boundary-safe response bodies in the advice.
- Map both `MethodArgumentNotValidException` (body binding) **and** `ConstraintViolationException` (param/path binding) to `400`.
- Map `NoHandlerFoundException` / `NoResourceFoundException` to `404`.
- Map unexpected exceptions to `500` with a **safe, generic** message — **MUST NOT** leak stack traces, SQL, internal class names, or internal service identifiers.

```java
@RestControllerAdvice
public class GlobalExceptionAdvice {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiError handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .collect(Collectors.joining("; "));
        return new ApiError("VALIDATION_ERROR", message);
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiError handleUnexpected(Exception ex) {
        log.error("Unexpected error", ex); // log internally with full detail
        return new ApiError("INTERNAL_ERROR", "An unexpected error occurred"); // safe message externally
    }
}
```

> **Envelope note:** `ApiError` above is illustrative. If the repo has an established error envelope type (e.g., `ApiResponse<Void>`), **MUST** use that type instead. Refer to `.github/skills/java/rest-api/SKILL.md` for the repo's error envelope convention.

### F.3 Boundary-safe errors (MUST)
- Errors **MUST** be boundary-safe: do not leak stack traces, SQL, internal hostnames, internal class names, or sensitive data.
- Log the full exception internally (with correlation ID if available); return only the safe envelope externally.
- See `coding` skill (section C) and `.github/skills/java/rest-api/SKILL.md` (section J) for error envelope and status code conventions.

### F.4 Scope advice classes correctly
- Advice can be scoped to specific packages or controller classes using `basePackages` / `assignableTypes` on `@ControllerAdvice`.
- Global advice (no scope restriction) is the common pattern; do not introduce scoped advice unless there is a clear reason.

> **HTTP status code and response envelope conventions:** see `.github/skills/java/rest-api/SKILL.md`.

## G) Filters and interceptors
### G.1 OncePerRequestFilter vs HandlerInterceptor
- `OncePerRequestFilter` (Servlet filter): runs at the Servlet container level, before Spring MVC dispatch. Use for:
  - authentication/authorization (Spring Security already handles this — follow security skill)
  - request/response logging and correlation ID injection
  - anything that must run regardless of whether a handler is matched
- `HandlerInterceptor`: runs within the Spring MVC dispatch cycle. Use for:
  - pre/post-handler logic tightly coupled to MVC (e.g., setting a `ModelAttribute`, auditing MVC-resolved handler metadata)
  - per-controller timing or access logging where handler metadata is needed

**Rule:** if both could work, prefer `OncePerRequestFilter` for infrastructure concerns (logging, request ID) and `HandlerInterceptor` for MVC-specific concerns.

### G.2 Ordering
- Filter ordering **MUST** be controlled explicitly (`@Order` or `FilterRegistrationBean.setOrder()`).
- Interceptor ordering is controlled by registration order in `WebMvcConfigurer.addInterceptors()`.
- Security filters (Spring Security's `FilterChainProxy`) run before custom `OncePerRequestFilter` beans unless ordered explicitly — understand placement.
- **MUST NOT** change existing filter/interceptor ordering without understanding the chain; incorrect ordering can silently bypass security or break request handling.

### G.3 Scope
- **MUST NOT** implement business logic in filters or interceptors; they are infrastructure concerns.
- If a filter needs to read the request body, use `ContentCachingRequestWrapper`; be aware of memory implications for large payloads.
- Do **not** add a new filter or interceptor for a single controller's concern — use `@ControllerAdvice` or handler method logic instead.

```java
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class CorrelationIdFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String correlationId = Optional.ofNullable(request.getHeader("X-Correlation-Id"))
            .orElse(UUID.randomUUID().toString());
        MDC.put("correlationId", correlationId);
        response.setHeader("X-Correlation-Id", correlationId);
        try {
            filterChain.doFilter(request, response);
        } finally {
            MDC.remove("correlationId");
        }
    }
}
```

## H) Async / long-running requests
### H.1 Prefer following existing repo patterns
- If the repo already uses `CompletableFuture`, `WebAsyncTask`, `DeferredResult`, or reactive streams, **MUST** follow that pattern.
- **MUST NOT** introduce async controller patterns ad-hoc without explicit requirement.

### H.2 Avoid blocking Servlet threads
- Do not perform long-running I/O (DB calls, remote calls, file operations) on the Servlet request thread without considering timeouts.
- For endpoints that may block, consider:
  - `WebAsyncTask` with a configured timeout (follows existing patterns)
  - `DeferredResult` with a timeout callback that returns a safe error
  - Returning `CompletableFuture<T>` from the handler method (Spring MVC manages async dispatch automatically)

```java
@PostMapping("/reports/generate")
public WebAsyncTask<ReportResponse> generateReport(@Valid @RequestBody ReportRequest request) {
    WebAsyncTask<ReportResponse> task = new WebAsyncTask<>(30_000L, () ->
        reportService.generate(request)
    );
    task.onTimeout(() -> {
        throw new ServiceUnavailableException("Report generation timed out");
    });
    return task;
}
```

### H.3 @Async on service methods
- `@Async` on service methods is a separate concern from async controller methods; follow the repo's existing threading model.
- If you use `@Async`, ensure `@EnableAsync` is configured and an appropriate `Executor` bean is registered.
- **MUST NOT** call `@Async` methods from within the same bean without a proxy (it will not be async).

### H.4 Timeouts
- **MUST** configure timeouts for async requests — do not leave them unbounded.
- `WebAsyncTask` timeout **MUST** have a timeout handler that returns a boundary-safe error.
- `DeferredResult` timeout value **SHOULD** be set via `setTimeoutResult()`.

## I) Testing controllers
### I.1 Use @WebMvcTest (slice tests; preferred)
- `@WebMvcTest(XxxController.class)` loads only the MVC layer (controllers, advice, filters in the MVC chain).
- Use `MockMvc` to issue requests and assert responses.
- Mock all service/repository dependencies with `@MockBean`.
- **MUST NOT** spin up the full application context (`@SpringBootTest`) just to test controller logic.

```java
@WebMvcTest(AccountController.class)
class AccountControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AccountService accountService;

    @Test
    void create_validRequest_returns200() throws Exception {
        given(accountService.create(any())).willReturn(new AccountResponse(1L, "Alice"));

        mockMvc.perform(post("/api/accounts/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"displayName\":\"Alice\",\"email\":\"alice@example.com\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void create_missingDisplayName_returns400() throws Exception {
        mockMvc.perform(post("/api/accounts/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"alice@example.com\"}"))
            .andExpect(status().isBadRequest());
    }
}
```

### I.2 What to test with MockMvc
- Happy path: correct request → expected response body and status code.
- Validation failures: missing/invalid fields → `400` with meaningful error body.
- Not found: service throws `NotFoundException` → `404` with safe error body.
- Unexpected error: service throws `RuntimeException` → `500` with safe generic message (no stack trace in body).
- Auth: if the controller requires authentication, use `@WithMockUser` or configure `SecurityMockMvcConfigurer` as appropriate.

### I.3 Full context tests
- Use `@SpringBootTest` + `MockMvc` (or `TestRestTemplate`) only when you need to test the full request pipeline (e.g., Spring Security integration, filter chain, transactional behavior end-to-end).
- Keep full-context tests minimal — they are slower and harder to maintain.

### I.4 Testing advice and filters
- `@ControllerAdvice` is automatically loaded in a `@WebMvcTest` slice — test exception mapping in the same slice test.
- `OncePerRequestFilter` beans registered as `@Component` are **not** automatically loaded in `@WebMvcTest`; add them via `@Import` or use `@SpringBootTest` for filter chain tests.

## K) Security context access in controllers

### K.1 Prefer parameter injection over SecurityContextHolder
Controllers **SHOULD** access the authenticated principal via method-parameter injection, not static calls:

- `@AuthenticationPrincipal` — resolves the principal directly from the `SecurityContext`:

```java
@GetMapping("/profile")
public ProfileResponse getProfile(@AuthenticationPrincipal UserDetails principal) {
    return profileService.getProfile(principal.getUsername());
}
```

- `Authentication` method parameter — Spring MVC injects it automatically:

```java
@GetMapping("/profile")
public ProfileResponse getProfile(Authentication authentication) {
    return profileService.getProfile(authentication.getName());
}
```

**MUST NOT** call `SecurityContextHolder.getContext().getAuthentication()` inline in controller methods unless the repo already uses this pattern. It couples the controller to a static context, obscures the dependency, and makes controller-slice tests harder to write.

### K.2 Follow repo conventions
- The principal type (`String`, `UserDetails`, or a custom object) **MUST** match what the repo's security configuration sets — see `.github/skills/java/spring-security/SKILL.md` (section E.1) for principal-shape guidance.
- **MUST NOT** refactor the principal type in a small controller PR; it breaks downstream authorization and auditing logic.

## L) Controller logging rules (boundary-safe)

### L.1 MUST NOT log in controllers
Controllers **MUST NOT** log the following, even at `DEBUG` level:
- `Authorization` header contents, JWTs, API keys, or bearer tokens.
- NRIC/FIN, passwords, PINs, or any secret values.
- Raw `MultipartFile` bytes or file contents.
- Raw request bodies for authentication endpoints (login, token refresh, password reset).

### L.2 Safe to log
- Correlation / trace IDs from `MDC` (see `CorrelationIdFilter` example in section G).
- Non-sensitive, opaque identifiers (internal UUIDs, masked resource IDs).
- HTTP method, URI path (without query parameters that may carry sensitive data), and response status.

> **Rule:** If in doubt whether a value is safe to log, treat it as unsafe and omit it. Prefer logging correlation IDs and delegating detail to the service layer with appropriate redaction. See also the coding skill (`.github/skills/coding/SKILL.md`) for boundary-safe error and logging conventions.

## Review checklist (agent-use)
When reviewing or generating Spring MVC controller code, check:

- [ ] Constructor injection used (no `@Autowired` field injection on required deps)
- [ ] Controllers are thin — no business logic, no direct DB access
- [ ] `@Valid` is present on `@RequestBody` parameters when DTO has constraints
- [ ] Both `MethodArgumentNotValidException` and `ConstraintViolationException` are handled in advice
- [ ] `@ControllerAdvice` / `@RestControllerAdvice` type matches the repo's existing pattern
- [ ] Unexpected exceptions return a **safe, generic** message — no stack trace, SQL, or class names leaked externally
- [ ] File uploads: `getOriginalFilename()` is **not** used as a storage path; content type validated
- [ ] File downloads: `Content-Disposition` uses a server-controlled filename; large files streamed (not loaded into `byte[]`)
- [ ] `produces` / `consumes` declared when media type must be unambiguous
- [ ] Async endpoints have configured timeouts with safe timeout handlers
- [ ] `@WebMvcTest` used for controller tests (not full `@SpringBootTest`)
- [ ] New filters/interceptors follow ordering rules and do not contain business logic
- [ ] `@ModelAttribute` and `@RequestBody` are not mixed on the same endpoint
- [ ] Sensitive data (NRIC, tokens, passwords) is not echoed in response bodies or logged from request parameters
- [ ] `@RequestPart` used (not `@RequestParam`) when receiving a structured JSON part alongside a file upload
- [ ] Pagination `size` is bounded by a maximum; `page` is validated non-negative; defaults are set
- [ ] Principal accessed via `@AuthenticationPrincipal` or `Authentication` parameter, not `SecurityContextHolder` (unless repo already uses it)
- [ ] Controllers do not log `Authorization` headers, JWTs, NRIC/FIN, passwords, raw multipart bytes, or raw auth-endpoint bodies
- [ ] `@RequestHeader` used only for safe metadata; credentials/tokens MUST NOT be accepted via query params; sensitive header values MUST NOT be logged
- [ ] Exception advice returns the repo's established error envelope type, not a one-off structure
