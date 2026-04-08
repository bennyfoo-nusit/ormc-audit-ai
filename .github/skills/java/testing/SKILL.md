---
name: java-testing
description: >
  Guidelines for testing Java Spring Boot applications using JUnit 5, Mockito,
  MockMvc, @DataJpaTest, @DataJdbcTest, and Testcontainers.
  Use this skill when writing or reviewing unit, integration, or slice tests.
---

# Java – Testing

> **See also:**
> - Coding skill (org-wide conventions): `.github/skills/coding/SKILL.md`
> - Java umbrella skill (Java idioms + defaults): `.github/skills/java/SKILL.md`
> - Java Spring Service skill (service-layer conventions): `.github/skills/java/spring-service/SKILL.md`
> - Java Spring Controller skill (controller mechanics, @WebMvcTest): `.github/skills/java/spring-controller/SKILL.md`
> - Java JPA skill (entities, repositories, slice testing): `.github/skills/java/jpa/SKILL.md`
> - Java JDBC skill (SQL + transactions, @DataJdbcTest): `.github/skills/java/jdbc/SKILL.md`

## A) Existing codebase rule (MOST IMPORTANT)

For an **existing application**, you **MUST** follow the repo's established testing patterns:
- Test framework and assertion library already in use (JUnit 5, AssertJ, Hamcrest, etc.).
- Naming conventions for test classes and test methods already present in the repo.
- Existing base classes, shared test utilities, or custom annotations.
- Existing Testcontainers setup or in-memory DB strategy for slice/integration tests.

You **MUST NOT** introduce a new test framework, replace an existing assertion library, or
restructure the test source tree without explicit instruction.

## B) Test types and annotations

| Type              | Annotation                                    | Purpose                                         |
|-------------------|-----------------------------------------------|-------------------------------------------------|
| Unit test         | `@ExtendWith(MockitoExtension.class)`         | Test a single class in isolation                |
| Controller slice  | `@WebMvcTest(XxxController.class)`            | Test controller + MockMvc; no service beans     |
| JPA slice         | `@DataJpaTest`                                | Test repositories with in-memory DB             |
| JDBC slice        | `@DataJdbcTest`                               | Test JDBC repositories / DAOs                   |
| Full integration  | `@SpringBootTest`                             | Full application context (use sparingly)        |

Choose the **narrowest** test type that validates the behaviour under test:
- Unit tests for service logic, domain rules, and utility code.
- Slice tests for persistence layer or web layer behaviour.
- Full integration tests (`@SpringBootTest`) only when slice tests are insufficient.

## C) Test naming conventions

Test method names **SHOULD** follow the pattern:

```
methodName_expectedBehaviour_givenCondition()
```

Examples:
- `findById_returnsUser_whenExists()`
- `findById_throwsNotFound_whenMissing()`
- `createOrder_throwsConflict_whenDuplicateRef()`

Rules:
- **MUST** follow the naming convention already used in the existing test suite if one exists.
- **SHOULD** use descriptive names that read as a specification, not `testMethod1()`.

## D) Unit tests – service layer with Mockito

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    UserRepository userRepository;

    @InjectMocks
    UserService userService;

    @Test
    void findById_returnsUser_whenExists() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(new User(1L, "Alice")));

        UserDto result = userService.findById(1L);

        assertThat(result.getName()).isEqualTo("Alice");
    }

    @Test
    void findById_throwsNotFound_whenMissing() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.findById(99L))
            .isInstanceOf(ResourceNotFoundException.class);
    }
}
```

### D.1 Mockito rules
- **MUST** use `@ExtendWith(MockitoExtension.class)` — do not use `@RunWith(MockitoJUnitRunner.class)` in new tests.
- **MUST** declare mocks with `@Mock` and inject with `@InjectMocks`; avoid manual `Mockito.mock()` unless required.
- **MUST NOT** use `@MockBean` in unit tests; `@MockBean` is for Spring slice/integration tests only.
- **SHOULD** verify interactions (`verify(...)`) only when the interaction itself is the expected behaviour, not as a habit on every mock.
- **MUST NOT** mock types you do not own (e.g., `java.util.List`, `HttpServletRequest` in a unit test for business logic).
- Spy (`@Spy` / `Mockito.spy`) **SHOULD** be used sparingly; prefer refactoring the class under test.

## E) Controller slice tests – MockMvc

```java
@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockBean
    UserService userService;

    @Test
    void getById_returns200_whenUserExists() throws Exception {
        when(userService.findById(1L)).thenReturn(new UserDto(1L, "Alice"));

        mockMvc.perform(get("/api/v1/users/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Alice"));
    }

    @Test
    void getById_returns404_whenNotFound() throws Exception {
        when(userService.findById(99L)).thenThrow(new ResourceNotFoundException("Not found"));

        mockMvc.perform(get("/api/v1/users/99"))
            .andExpect(status().isNotFound());
    }
}
```

### E.1 Controller slice rules
- **MUST** use `@MockBean` (not `@Mock`) for service collaborators in `@WebMvcTest` tests.
- **SHOULD** test the happy path and at least one error path per endpoint.
- **SHOULD** assert the HTTP status code and key response-body fields; avoid over-specifying every field.
- **MUST NOT** test business logic in controller slice tests; delegate to service unit tests.
- If security is configured, **SHOULD** use `@WithMockUser` (or the repo's equivalent) to exercise
  authenticated paths; do not ignore security context in tests that cover secured endpoints.

## F) Integration tests

### F.1 Testcontainers (database integration)

```java
@SpringBootTest
@Testcontainers
class UserIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    UserRepository userRepository;

    @Test
    void saveAndFind_persistsUser() {
        User user = userRepository.save(new User("Alice"));
        assertThat(userRepository.findById(user.getId())).isPresent();
    }
}
```

### F.2 Integration test rules
- `@SpringBootTest` **SHOULD** be used sparingly — prefer slice tests where possible because full-context
  tests are slower and harder to isolate.
- Testcontainers images **SHOULD** be declared `static` so they are shared across tests in the class.
- **MUST NOT** rely on a shared external database for test isolation; use Testcontainers or an
  in-memory DB appropriate to the slice.
- Test data **MUST** be set up and torn down within the test (or use `@Transactional` on the test class
  to roll back after each test).
- **MUST NOT** hardcode ports, credentials, or environment-specific hostnames in integration tests.

## G) What to test

**SHOULD** write tests for:
- Business rules and domain logic in service classes.
- Controller binding, validation errors (400 responses), and not-found/conflict responses.
- Repository queries that are non-trivial or custom (e.g., `@Query`, hand-written SQL, dynamic predicates).
- Edge cases: null inputs, empty collections, boundary values.

**NEED NOT** write exhaustive tests for:
- Simple getters/setters or generated code.
- Framework behaviour already covered by framework tests (e.g., Spring's own JSON serialisation).

## H) Determinism and flakiness

**MUST** write deterministic tests:
- **MUST NOT** use `Thread.sleep` to wait for asynchronous outcomes; use `Awaitility` or similar if
  the repo already uses it, or redesign the test to be synchronous.
- **MUST NOT** depend on wall-clock time (`new Date()`, `LocalDate.now()`); inject a `Clock` or mock
  the time source.
- **MUST NOT** depend on hash-based or insertion-order iteration that is not guaranteed.
- **MUST NOT** share mutable state between tests; each test **MUST** be independent.
- **MUST** ensure test data does not leak across tests (use `@Transactional` rollback, `@BeforeEach`
  setup, or container-per-class Testcontainers).

## Review checklist (agent-use)

- [ ] Narrowest test type chosen: unit test for business logic, slice test for web/persistence layer, `@SpringBootTest` only when necessary
- [ ] Test method names follow `methodName_expectedBehaviour_givenCondition` (or existing repo convention)
- [ ] `@Mock` / `@InjectMocks` used in unit tests; `@MockBean` used only in slice / integration tests
- [ ] Mockito `verify(...)` used only when interaction is the assertion, not as a default habit
- [ ] Controller slice tests cover both happy path and at least one error path per endpoint
- [ ] Integration tests use Testcontainers or an in-memory DB; no dependency on shared external databases
- [ ] Test data is isolated: each test sets up its own data or rolls back via `@Transactional`
- [ ] No `Thread.sleep` or wall-clock `new Date()` / `LocalDate.now()` in tests; time sources are injectable
- [ ] No mutable shared state between tests
- [ ] Tests follow existing codebase conventions (naming, base classes, assertion library, DB strategy)
