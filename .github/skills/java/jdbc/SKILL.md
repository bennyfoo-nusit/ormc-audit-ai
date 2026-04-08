---
name: java-jdbc
description: >
  Practical conventions for JDBC in NUS Java Spring applications using Spring JDBC
  (JdbcTemplate / NamedParameterJdbcTemplate) and plain SQL. Covers safe parameter binding,
  null-return patterns, inline SQL building (StringBuilder/concat), row mapping, generated keys,
  batch operations, and pragmatic transaction boundaries.
  Use this skill when writing or reviewing SQL-based repository/DAO code (not JPA/Hibernate).
---

# Java – JDBC (Spring JDBC) (NUS pragmatic defaults)

> **Scope:** Spring JDBC (`JdbcTemplate`, `NamedParameterJdbcTemplate`), inline SQL, safe parameter binding,
> null-return read patterns, mapping, batch, and transaction boundaries.
>
> **See also:**
> - Coding skill (boundary-safe errors + sensitive data): `.github/skills/coding/SKILL.md`
> - Java umbrella skill: `.github/skills/java/SKILL.md`
> - Java REST API skill (API boundary, DTO rules, error mapping): `.github/skills/java/rest-api/SKILL.md`
> - Java Spring Service skill (service-layer transaction + exception handling for DAO callers): `.github/skills/java/spring-service/SKILL.md`

## A) Existing codebase rule (MOST IMPORTANT)
For an **existing application**, you **MUST** follow what the repo already does for:
- DAO/repository naming (`*Dao` vs `*Repository`), package location
- `JdbcTemplate` vs `NamedParameterJdbcTemplate` usage
- SQL style (text blocks vs concatenated strings), spacing/format
- how "not found" is represented (in this org: **often `null`**)
- transaction placement conventions
- logging conventions (SQL logging on/off, redaction rules)

You **MUST NOT** refactor the whole data-access style unless explicitly requested.

## B) Core safety rules (non-negotiable)
- **Never** concatenate untrusted input into SQL values. Always bind values as parameters.
- Dynamic SQL structure (e.g., ORDER BY column, direction) **MUST** use allowlists; do **not** pass user strings into SQL identifiers.
- Prefer selecting explicit columns; avoid `SELECT *` unless the codebase already accepts it.

## C) Template choice (pragmatic)
- **Preferred:** `NamedParameterJdbcTemplate` for readability and complex queries.
- `JdbcTemplate` is acceptable in existing codebases; don't introduce `NamedParameterJdbcTemplate` everywhere unless asked.

Constructor injection is required.

```java
@Repository
public class UserDao {
    private final NamedParameterJdbcTemplate jdbc;

    public UserDao(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }
}
```

## D) "Not found" convention (NUS common)
- For "get by id" / "single row" reads, returning **`null`** is acceptable and common.
- If returning `null`, call sites **MUST** perform null checks (service/controller layer).

### D.1 Single-row query returning null
Use `query(...)` + `stream().findFirst().orElse(null)` to avoid exceptions for 0 rows.

```java
public UserDto findById(Long id) {
    String sql =
        "SELECT id, name, email " +
        "FROM users " +
        "WHERE id = :id";

    List<UserDto> results = jdbc.query(
        sql,
        new MapSqlParameterSource("id", id),
        userRowMapper()
    );

    return results.stream().findFirst().orElse(null);
}
```

**Avoid** `queryForObject` unless the codebase already uses it heavily, because it throws on 0 rows.

## E) Mapping rules (avoid fragile mappers)
- Prefer explicit `RowMapper<T>` (lambda or dedicated class) for stability.
- `BeanPropertyRowMapper` is allowed only if the codebase already uses it and column-to-field mapping is consistent.

```java
private RowMapper<UserDto> userRowMapper() {
    return (rs, rowNum) -> {
        UserDto dto = new UserDto();
        dto.setId(rs.getLong("id"));
        dto.setName(rs.getString("name"));
        dto.setEmail(rs.getString("email"));
        dto.setCreatedAt(rs.getTimestamp("created_at")); // map to java.util.Date via Timestamp if needed
        return dto;
    };
}
```

## F) Multi-row queries
```java
public List<UserDto> findAll() {
    String sql =
        "SELECT id, name, email " +
        "FROM users " +
        "ORDER BY name";

    return jdbc.query(sql, new MapSqlParameterSource(), userRowMapper());
}
```

## G) SQL building style (inline; StringBuilder for complex)
### G.1 Simple SQL: string concatenation is OK
- Use `"..." + "..."` only for fixed SQL fragments (no user-supplied values).

### G.2 Complex SQL: use StringBuilder + named params
```java
public List<UserDto> search(UserSearchCriteria c) {
    StringBuilder sql = new StringBuilder();
    MapSqlParameterSource params = new MapSqlParameterSource();

    sql.append("SELECT id, name, email ");
    sql.append("FROM users ");
    sql.append("WHERE 1=1 ");

    if (c.getNameLike() != null && !c.getNameLike().isBlank()) {
        sql.append("AND name LIKE :nameLike ");
        params.addValue("nameLike", "%" + c.getNameLike() + "%");
    }

    if (c.getEmailLike() != null && !c.getEmailLike().isBlank()) {
        sql.append("AND email LIKE :emailLike ");
        params.addValue("emailLike", "%" + c.getEmailLike() + "%");
    }

    sql.append("ORDER BY name ");

    return jdbc.query(sql.toString(), params, userRowMapper());
}
```

## H) Safe ORDER BY (allowlist only)
You cannot parameter-bind column names. If sorting is needed, use allowlists:

```java
private static final Map<String, String> SORT_COLUMNS = Map.of(
    "name", "name",
    "email", "email",
    "createdAt", "created_at"
);

public List<UserDto> searchSorted(String sortBy, String sortDir) {
    String baseSql = "SELECT id, name, email, created_at FROM users WHERE 1=1 ";

    String col = SORT_COLUMNS.getOrDefault(sortBy, "created_at");
    String dir = "DESC".equalsIgnoreCase(sortDir) ? "DESC" : "ASC";

    String sql = baseSql + " ORDER BY " + col + " " + dir;
    return jdbc.query(sql, new MapSqlParameterSource(), userRowMapper());
}
```

## I) IN clause (lists)
Spring can expand named list params:
```java
public List<UserDto> findByIds(List<Long> ids) {
    String sql = "SELECT id, name, email FROM users WHERE id IN (:ids)";
    return jdbc.query(sql, new MapSqlParameterSource("ids", ids), userRowMapper());
}
```

## J) Insert / update / delete
### J.1 Insert (no key needed)
```java
public int insert(UserDto user) {
    String sql =
        "INSERT INTO users (name, email) " +
        "VALUES (:name, :email)";

    MapSqlParameterSource params = new MapSqlParameterSource()
        .addValue("name", user.getName())
        .addValue("email", user.getEmail());

    return jdbc.update(sql, params);
}
```

### J.2 Insert with generated key (when required by caller)
```java
public Long insertAndReturnId(UserDto user) {
    String sql =
        "INSERT INTO users (name, email) " +
        "VALUES (:name, :email)";

    MapSqlParameterSource params = new MapSqlParameterSource()
        .addValue("name", user.getName())
        .addValue("email", user.getEmail());

    KeyHolder keyHolder = new GeneratedKeyHolder();
    jdbc.update(sql, params, keyHolder, new String[] {"id"}); // follow DB/PK conventions

    Number key = keyHolder.getKey();
    return (key == null) ? null : key.longValue();
}
```

### J.3 Update
```java
public int update(UserDto user) {
    String sql =
        "UPDATE users " +
        "SET name = :name, email = :email " +
        "WHERE id = :id";

    MapSqlParameterSource params = new MapSqlParameterSource()
        .addValue("id", user.getId())
        .addValue("name", user.getName())
        .addValue("email", user.getEmail());

    return jdbc.update(sql, params);
}
```

### J.4 Delete
```java
public int deleteById(Long id) {
    String sql = "DELETE FROM users WHERE id = :id";
    return jdbc.update(sql, new MapSqlParameterSource("id", id));
}
```

## K) Batch operations
```java
public int[] batchInsert(List<UserDto> users) {
    String sql = "INSERT INTO users (name, email) VALUES (:name, :email)";

    SqlParameterSource[] batch = users.stream()
        .map(u -> new MapSqlParameterSource()
            .addValue("name", u.getName())
            .addValue("email", u.getEmail()))
        .toArray(SqlParameterSource[]::new);

    return jdbc.batchUpdate(sql, batch);
}
```

Notes:
- Some drivers return `Statement.SUCCESS_NO_INFO` for batch counts; do not assume exact counts unless required and supported.

## L) Dates and timestamps (java.util.Date convention)
- Many NUS codebases use `java.util.Date`. Prefer consistent mapping with the existing schema:
  - Read timestamps using `rs.getTimestamp("col")` and assign to `Date`.
  - When binding `Date`, pass as a parameter value; optionally specify SQL type if needed.

Example:
```java
params.addValue("createdAt", user.getCreatedAt());
```

If null handling is sensitive, specify types:
```java
params.addValue("createdAt", user.getCreatedAt(), Types.TIMESTAMP);
```

## M) Error handling (DataAccessException)
- Spring JDBC throws `DataAccessException` (runtime).
- Repository layer may let it bubble up; service/controller boundary **MUST** convert it to safe errors (no SQL leak).
- Do not log raw SQL with parameter values if it may contain sensitive data.

## N) Transactions (pragmatic)
- Prefer `@Transactional` at **service layer** for multi-step operations.
- Do not introduce repository-level `@Transactional` unless the codebase already uses it.

```java
@Service
public class UserService {
    private final UserDao userDao;
    private final AuditDao auditDao;

    public UserService(UserDao userDao, AuditDao auditDao) {
        this.userDao = userDao;
        this.auditDao = auditDao;
    }

    @Transactional
    public void createUser(UserDto user) {
        userDao.insert(user);
        auditDao.insertAudit("USER_CREATE", new Date());
    }
}
```

## O) Joins and one-to-many mapping (common pitfall)
- If a join duplicates parent rows (one-to-many), do **not** map directly to a single object per row without aggregation.
- Preferred approaches:
  1) two queries (parent first, then children), or
  2) aggregate in Java using a `Map<Id, ParentDto>` while iterating rows.

Do not introduce complex ORM-like mapping unless explicitly requested.

---

## Review checklist (agent-use)

When reviewing or generating JDBC-layer code, check:

- [ ] All SQL parameters use bind variables; no string concatenation with user-supplied input
- [ ] Named parameters (`NamedParameterJdbcTemplate`) used when more than one parameter improves readability
- [ ] Queries against large tables use pagination or cursor streaming; no unbounded full-table reads
- [ ] ORDER BY column names are validated against an allowlist; never constructed from user input
- [ ] IN clause uses collection binding; empty-collection case is handled explicitly
- [ ] Batch operations use `batchUpdate` where appropriate; per-row inserts in a loop avoided for bulk writes
- [ ] No N+1 SQL pattern: related data is loaded in a single join or a separate bulk query, not per-row
- [ ] Transaction boundaries are owned by the service layer; DAO/repository methods do not begin or commit transactions unless explicitly required
- [ ] `DataAccessException` is caught at the appropriate layer and mapped to domain or boundary-safe errors
- [ ] No sensitive data (NRIC, passwords, tokens) is embedded in SQL strings, logged from queries, or exposed in error messages
- [ ] Connection lifecycle is managed by `JdbcTemplate`; connections are not obtained or closed manually
- [ ] Date/timestamp types follow the repo convention (`java.util.Date` / `java.sql.Timestamp`)
