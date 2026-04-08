---
name: java-jpa
description: >
  Conventions and best practices for JPA/Hibernate entities and Spring Data JPA repositories
  in NUS Java applications. Covers entity design, associations, fetching strategy, OSIV,
  N+1 avoidance, not-found conventions, Lombok pitfalls, and cascade safety.
---

# Java – JPA / Spring Data JPA (NUS defaults; pragmatic)

> **Scope:** JPA/Hibernate entity design, Spring Data JPA repositories, association mapping,
> fetching strategy, OSIV, N+1 avoidance, not-found conventions, and transaction boundaries.
>
> **See also:**
> - Coding skill (boundary-safe errors + sensitive data): `.github/skills/coding/SKILL.md`
> - Java umbrella skill: `.github/skills/java/SKILL.md`
> - Java REST API skill (API boundary, DTO rules, error mapping): `.github/skills/java/rest-api/SKILL.md`
> - Java Spring Service skill (service-layer transaction boundaries, entity-to-DTO mapping, N+1 orchestration): `.github/skills/java/spring-service/SKILL.md`

## A) Existing codebase rule (MOST IMPORTANT)
- For an **existing application**, you **MUST** follow the repo's established patterns:
  - Entity naming, annotation style, and package structure already in use.
  - Fetch type defaults already in use (`LAZY` vs `EAGER`).
  - Not-found convention already used (null returns, exceptions, or `Optional`).
  - Lombok usage on entities (if any).
  - Existing cascade configurations.
- You **MUST NOT** change fetch strategies, null-return conventions, or cascade settings globally unless explicitly requested.
- You **MUST NOT** introduce `Optional<T>`, `@EntityGraph`, or `@BatchSize` wholesale into a codebase that does not already use them.

## B) Entities are not external API contracts (boundary rule)
- JPA entities **MUST NOT** be used as REST response or request objects.
- Entities **MUST NOT** be serialized directly to JSON responses (e.g., do not annotate entities with Jackson annotations for the purpose of API exposure).
- Mapping is required at the boundary between the persistence layer and the service/API layer.
- This boundary prevents leaking lazy-loading proxies, internal schema details, and Hibernate internals to callers.

## C) Not-found conventions (follow repo; null-return is common)
- Repositories in this org **commonly return `null`** for not-found results.
- Callers (service layer) **MUST** null-check before using repository return values:
  ```java
  Account account = accountRepository.findByAccountId(accountId);
  if (account == null) {
      throw new AccountNotFoundException("Account not found: " + accountId);
  }
  ```
- **MUST NOT** introduce `Optional<T>` returns wholesale into a codebase that uses `null`; follow the existing pattern unless the change is explicitly requested.
- If the existing codebase already uses `Optional<T>`, continue using it consistently.
- Custom finder methods added to existing repositories **MUST** match the return type convention already used in that repository.

## D) Entity design
### D.1 Basic entity structure
- Entities **MUST** be annotated with `@Entity`.
- Each entity **MUST** have a primary key annotated with `@Id`.
- Use `@GeneratedValue` only if the DB generates the PK; if the application assigns the PK, omit it.
- Class name and `@Table` name **SHOULD** reflect the DB table; specify `@Table(name = "...")` explicitly when names diverge from JPA defaults.

### D.2 Field access vs property access
- Field access (annotating fields directly) is **PREFERRED** and common in this org.
- **MUST NOT** mix field access and property access within the same entity.

### D.3 Equals, hashCode, and toString (Lombok / manual)
- **MUST NOT** use Lombok `@Data` or `@EqualsAndHashCode` on JPA entities unless the repo already uses it — `@Data` generates `equals`/`hashCode` based on all fields and a `toString` that traverses associations, triggering lazy loading and risking `StackOverflowError` or `LazyInitializationException`.
- **MUST NOT** use Lombok `@ToString` on entities unless the repo already uses it; if it is already used, **MUST** add `@ToString.Exclude` on all association fields (`@OneToMany`, `@ManyToOne`, `@ManyToMany`, `@OneToOne`).
- When writing `equals`/`hashCode` manually:
  - **SHOULD** be based on the natural business key or surrogate PK only, not on association fields.
  - Avoid including mutable or lazy-loaded fields.
- When writing `toString` manually or via Lombok, **MUST** exclude association fields to prevent lazy loading and recursion.

Example (safe manual pattern):
```java
@Entity
@Table(name = "account")
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    // equals/hashCode based on id only; toString excludes associations
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Account)) return false;
        Account other = (Account) o;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "Account{id=" + id + ", displayName='" + displayName + "'}";
    }
}
```

## E) Associations
### E.1 Default fetch types
JPA specification defaults:
- `@OneToMany` and `@ManyToMany` default to `LAZY`.
- `@ManyToOne` and `@OneToOne` default to `EAGER`.

Guidelines:
- `@OneToMany` and `@ManyToMany` **SHOULD** declare `fetch = FetchType.LAZY` explicitly (it is already the default, but explicit is clearer and prevents surprises if the annotation is copied):
  ```java
  @OneToMany(mappedBy = "account", fetch = FetchType.LAZY)
  private List<Order> orders;
  ```
- `@ManyToOne` **SHOULD** override the `EAGER` default with `fetch = FetchType.LAZY` unless the association is always needed alongside the owning entity:
  ```java
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "department_id")
  private Department department;
  ```
- `@OneToOne` **SHOULD** also be declared `LAZY` where possible; note that Hibernate cannot always lazily load the inverse (`mappedBy`) side without bytecode enhancement — prefer the owning side or accept `EAGER` only when the association is small and always used.

### E.2 Nullability annotations for required FKs
- When a FK is required (non-nullable in the DB schema), declare nullability explicitly to match:
  ```java
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "department_id", nullable = false)
  private Department department;
  ```
- `optional = false` tells Hibernate the FK is never null; `nullable = false` on `@JoinColumn` tells the DDL generator to create a NOT NULL column.
- These two annotations **MUST** agree with each other and with the actual DB schema.
- For nullable FKs, use the default (`optional = true`) and omit `nullable = false`.

### E.3 Cascade rules (cascade remove is dangerous)
- **MUST NOT** use `CascadeType.REMOVE` or `CascadeType.ALL` on `@ManyToOne` or `@ManyToMany` associations, or on any association to a shared/non-owned entity.
  - Cascading remove on `@ManyToOne` would delete the shared parent when the child is deleted — almost always wrong.
  - Cascading remove on `@ManyToMany` is similarly dangerous for shared entities.
- `CascadeType.PERSIST` and `CascadeType.MERGE` on `@OneToMany` (owned collection) are generally safe.
- `CascadeType.ALL` is only appropriate on `@OneToMany` / `@OneToOne` where the child is fully owned by the parent and has no independent lifecycle.
- When in doubt, omit cascade and manage the lifecycle explicitly.

### E.4 Bidirectional associations — keep both sides in sync
- For bidirectional associations, **MUST** maintain both sides in memory (add helper methods if needed):
  ```java
  // In Account entity
  public void addOrder(Order order) {
      orders.add(order);
      order.setAccount(this);
  }
  ```
- The `mappedBy` side **MUST NOT** be the owning side; the `@JoinColumn` side owns the FK.

## F) Repository conventions (Spring Data JPA)
### F.1 Repository interface naming
- Use `XxxRepository` extending `JpaRepository<Xxx, ID>` or `CrudRepository<Xxx, ID>`.
- Repository interfaces **SHOULD** be in a `...repository` package.

### F.2 Custom finder methods
- Prefer Spring Data derived query methods for simple lookups:
  ```java
  Account findByEmail(String email); // returns null if not found (no Optional)
  List<Account> findByDepartmentId(Long departmentId);
  ```
- For complex queries, use `@Query` with JPQL or native SQL:
  ```java
  @Query("SELECT a FROM Account a WHERE a.status = :status AND a.createdAt >= :since")
  List<Account> findActiveAccountsSince(@Param("status") AccountStatus status,
                                        @Param("since") Date since);
  ```
- Date/time parameter types **MUST** follow the repo's established convention; `java.util.Date` is common in this org — do not introduce `java.time.*` types (e.g. `LocalDateTime`) unless the codebase already uses them.
- Return type of finder methods **MUST** match the not-found convention already in use (null vs `Optional`).

### F.3 Avoid N+1 queries
- When loading a collection and accessing associations in a loop, use `JOIN FETCH` or `@EntityGraph` to avoid N+1:
  ```java
  @Query("SELECT a FROM Account a JOIN FETCH a.department WHERE a.status = 'ACTIVE'")
  List<Account> findActiveWithDepartment();
  ```
- **MUST NOT** introduce `JOIN FETCH` on collections that can return more than one row per root entity without de-duplication (`DISTINCT` or `LinkedHashSet`); this causes result set multiplication.
- Use `@EntityGraph` only if the codebase already uses it.

## G) Fetching strategy & OSIV
### G.1 Open Session In View (OSIV)
- Spring Boot enables OSIV by default (`spring.jpa.open-in-view=true`).
- OSIV keeps the Hibernate session open through the view/controller layer, which can hide N+1 issues and hold DB connections longer than necessary.
- For new applications, **SHOULD** disable OSIV (`spring.jpa.open-in-view=false`) and load all required associations in the service layer before returning.
- For existing applications, follow the existing OSIV setting; do not change it without explicit instruction.

### G.2 Loading strategy summary
| Situation | Recommended approach |
|---|---|
| Single entity by PK | Custom finder (returns null per org convention) or `findById` (returns `Optional`) — match repo convention |
| Entity + required association (always needed) | `JOIN FETCH` in JPQL query |
| Entity + optional association (rarely needed) | Load separately only when needed |
| List of entities + association | `JOIN FETCH` with `DISTINCT`, or batch loading |
| Large collections | Use pagination (`Pageable`) |

## H) Transactions
- Service methods that modify data **MUST** be annotated with `@Transactional` (or the service class itself).
- Read-only service methods **SHOULD** use `@Transactional(readOnly = true)` to signal intent and allow Hibernate optimizations.
- **MUST NOT** call `@Transactional` methods from within the same class (bypasses proxy); extract to a separate bean if needed.
- Repository methods provided by Spring Data JPA are already transactional; do not add `@Transactional` to repository interfaces unless you need to change the propagation or readOnly flag.

## I) Pagination
- Use Spring Data's `Pageable` and `Page<T>` for large result sets:
  ```java
  Page<Account> findByStatus(AccountStatus status, Pageable pageable);
  ```
- **MUST NOT** return entire unbounded collections from queries against large tables without pagination.

---

## Review checklist (agent-use)

When reviewing or generating JPA/Spring Data JPA code, check:

- [ ] Entities are not returned directly from controllers; DTOs or view models are used at API boundaries
- [ ] Lazy-loaded associations are initialized within the transaction scope; no `LazyInitializationException` risk in the controller or view layer
- [ ] `@Transactional` is applied at the service layer; repositories do not own transaction boundaries for business operations
- [ ] Repository method names follow Spring Data JPA conventions and return expected types (`Optional`, `List`, `Page`)
- [ ] `JOIN FETCH` or `@EntityGraph` used when associations are always needed together; N+1 queries avoided
- [ ] Unbounded collection queries against large tables use `Pageable`; `Page<T>` or `Slice<T>` returned
- [ ] `@OneToMany` / `@ManyToMany` cascade operations are deliberate; `CascadeType.ALL` and `REMOVE` are justified and reviewed
- [ ] OSIV setting matches repo convention; all required associations are loaded in the service layer if OSIV is disabled
- [ ] `@Modifying` + `@Transactional` is present on bulk JPQL update/delete repository methods
- [ ] Bidirectional association helper methods keep both sides of the relationship consistent
- [ ] Entity `toString()` methods do not include sensitive fields (NRIC, tokens, passwords); entities are not inadvertently logged in full
- [ ] No persistence model (entity class) is leaked as the external API response body; DTO conversion is explicit
