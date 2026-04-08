---
name: java-spring-batch
description: >
  Practical conventions for Spring Batch in NUS Java applications. Covers job/step
  structure, naming, reader/processor/writer patterns, chunk vs tasklet choice,
  transaction boundaries, restartability, idempotency, parameter validation,
  logging/observability, and testing approaches. Use this skill when implementing
  or reviewing Spring Batch jobs/steps and related batch infrastructure.
---

# Java – Spring Batch (NUS defaults; pragmatic)

> **Scope:** Spring Batch jobs/steps, chunk processing, tasklets, item readers/processors/writers,
> job parameters, restartability, idempotency, observability, and batch testing patterns.
>
> **See also:**
> - Coding skill (boundary-safe errors + sensitive data): `.github/skills/coding/SKILL.md`
> - Java umbrella skill: `.github/skills/java/SKILL.md`
> - Java JDBC skill (SQL + JdbcTemplate patterns): `.github/skills/java/jdbc/SKILL.md`
> - Java JPA skill (entities/repositories; avoid leaking persistence models): `.github/skills/java/jpa/SKILL.md`
> - Java Spring Service skill (service-layer conventions; tasklets may delegate to services): `.github/skills/java/spring-service/SKILL.md`

## A) Existing codebase rule (MOST IMPORTANT)
For an **existing application**, you **MUST** follow the repo's established patterns for:
- Where batch code lives (package layout, module layout)
- Job/step builder style (Java config vs XML, `JobBuilderFactory`/`StepBuilderFactory` vs newer builders depending on Spring Batch version)
- Naming conventions for jobs, steps, parameters, and tables
- Existing restartability strategy (allow restart vs prevent restart)
- Where transactions are defined (step vs service layer)
- Error handling + retry/skip policies already in use
- Existing operational conventions (scheduling, locking, run IDs, retention, monitoring)

You **MUST NOT** refactor the batch architecture (switch chunk ↔ tasklet, rewrite job structure, change table schema) unless explicitly requested.

## B) Terminology & core principles
- A **Job** is a top-level unit of work; a **Step** is a phase in a job.
- Batch code **MUST** be designed for:
  - **restartability** (a job may be re-run after failure)
  - **idempotency** (reprocessing must not create duplicates or corrupt state)
  - **bounded resource usage** (avoid loading whole datasets into memory)
  - **operability** (logs, metrics, clear failure reasons; safe to expose)

## C) Naming conventions (strong defaults)
### C.1 Job and step names
- Job names **MUST** be stable, descriptive, and versionable:
  - `userSyncJob`, `dailyAccountReconciliationJob`, `invoiceExportJob`
- Step names **MUST** describe their action:
  - `readUsersStep`, `validateInvoicesStep`, `writeExportsStep`
- Avoid vague names like `step1`, `processStep`.

### C.2 Job parameter names and contract
- Parameters **SHOULD** be `camelCase`.
- **Standard parameters (use these unless the repo differs):**
  - Include `requestDate` (ISO date: `requestDate=2026-03-21`) as the **business trigger date** for all scheduled and on-demand jobs.
  - Include the **business primary key(s)** relevant to the job (e.g., `accountId`, `batchGroupId`, `sourceSystem`).
  - For on-demand runs that may occur multiple times on the same `requestDate`, also include a unique `requestId` (UUID) so Spring Batch treats each submission as a distinct `JobInstance`.
- Parameters **MUST NOT** include secrets.
- Parameters **MUST** be validated early; fail fast with a boundary-safe error on missing or invalid input.

**Example (daily scheduled job):**
```text
requestDate=2026-03-21
sourceSystem=CORE_BANKING
```

**Example (on-demand job triggered via scheduler or API):**
```text
requestDate=2026-03-21
accountId=ACC-00123
requestId=<uuid>
```

### C.3 Parameter validation snippet (fail-fast)

Validate all required parameters at the start of the job (e.g., in a `JobExecutionListener` or the first tasklet):

```java
@Component
public class AccountSyncJobParameterValidator implements JobParametersValidator {

    @Override
    public void validate(JobParameters parameters) throws JobParametersInvalidException {
        String requestDate = parameters.getString("requestDate");
        if (requestDate == null || requestDate.isBlank()) {
            throw new JobParametersInvalidException("requestDate is required (format: yyyy-MM-dd)");
        }
        try {
            LocalDate.parse(requestDate); // throws DateTimeParseException if invalid — parse result discarded intentionally
        } catch (DateTimeParseException e) {
            throw new JobParametersInvalidException("requestDate must be in yyyy-MM-dd format, got: " + requestDate);
        }

        String accountId = parameters.getString("accountId");
        if (accountId == null || accountId.isBlank()) {
            throw new JobParametersInvalidException("accountId is required");
        }
    }
}
```

Wire the validator into the job:
```java
@Bean
public Job accountSyncJob(JobRepository jobRepository, Step readAccountsStep,
                          AccountSyncJobParameterValidator validator) {
    return new JobBuilder("accountSyncJob", jobRepository)
        .validator(validator)
        .start(readAccountsStep)
        .build();
}
```

## D) Triggered vs scheduled jobs
### D.1 Two operational modes
- **Scheduled jobs:** triggered by a cron/scheduler (e.g., Spring Scheduler, Quartz, external scheduler). `requestDate` typically corresponds to the business date.
- **On-demand jobs:** triggered manually or by an event (e.g., operator action, downstream system callback). **MUST** include a unique parameter (e.g., `requestId`) to differentiate multiple runs for the same `requestDate`.

### D.2 Synchronous vs asynchronous execution
- **Synchronous:** caller waits for job completion. Use only for short-lived jobs or internal tooling.
- **Asynchronous:** job is submitted and caller receives an acknowledgement; outcome is polled or notified separately. **SHOULD** be the default for long-running jobs.
- HTTP POST triggers for batch jobs are **rare** in this org; prefer scheduled or event-driven invocation. If HTTP triggering is used, it **MUST** be asynchronous (return `202 Accepted` with a job reference).

## E) Chunk vs Tasklet (decision rule)
### E.1 Prefer chunk-oriented for large datasets
Use chunk processing when:
- reading many records and transforming/writing each item
- you want commits every N items (transaction per chunk)

### E.2 Prefer tasklet for orchestration / single operations
Use a tasklet for:
- file move/rename, one-off validation, cleanup, notification
- "call service once" operations

Rule: if both work, **prefer chunk** for record processing and **tasklet** for orchestration.

## F) Chunk step template (implementation reference)

Use this skeleton when adding a chunk-oriented step. JDBC-first (prefer `JdbcPagingItemReader` /
`JdbcBatchItemWriter`); adjust reader/writer for file or JPA sources per repo conventions.

```java
@Configuration
public class AccountSyncJobConfig {

    // --- Job wiring ---
    @Bean
    public Job accountSyncJob(JobRepository jobRepository,
                              AccountSyncJobParameterValidator validator,
                              Step syncAccountsStep) {
        return new JobBuilder("accountSyncJob", jobRepository)
            .validator(validator)
            .start(syncAccountsStep)
            .build();
    }

    // --- Chunk step: read → process → write, 100 items per transaction ---
    @Bean
    public Step syncAccountsStep(JobRepository jobRepository,
                                 PlatformTransactionManager txManager,
                                 ItemReader<AccountRecord> accountReader,
                                 ItemProcessor<AccountRecord, AccountDto> accountProcessor,
                                 ItemWriter<AccountDto> accountWriter) {
        return new StepBuilder("syncAccountsStep", jobRepository)
            .<AccountRecord, AccountDto>chunk(100, txManager)
            .reader(accountReader)
            .processor(accountProcessor)
            .writer(accountWriter)
            .faultTolerant()
            .skipLimit(50)                          // bounded skip
            .skip(AccountValidationException.class) // only skip expected validation failures
            .build();
    }

    // --- JDBC paging reader (stream; no full-table load) ---
    @Bean
    @StepScope
    public JdbcPagingItemReader<AccountRecord> accountReader(
            DataSource dataSource,
            @Value("#{jobParameters['requestDate']}") String requestDate) {

        Map<String, Order> sortKeys = new LinkedHashMap<>();
        sortKeys.put("account_id", Order.ASCENDING);

        OraclePagingQueryProvider queryProvider = new OraclePagingQueryProvider(); // use DB-specific provider
        queryProvider.setSelectClause("SELECT account_id, display_name, status");
        queryProvider.setFromClause("FROM accounts");
        queryProvider.setWhereClause("WHERE request_date = :requestDate AND status = 'PENDING'");
        queryProvider.setSortKeys(sortKeys);

        return new JdbcPagingItemReaderBuilder<AccountRecord>()
            .name("accountReader")
            .dataSource(dataSource)
            .queryProvider(queryProvider)
            .parameterValues(Map.of("requestDate", requestDate))
            .rowMapper((rs, rowNum) -> {
                AccountRecord r = new AccountRecord();
                r.setAccountId(rs.getString("account_id"));
                r.setDisplayName(rs.getString("display_name"));
                r.setStatus(rs.getString("status"));
                return r;
            })
            .pageSize(100)
            .build();
    }

    // --- JDBC batch writer (idempotent upsert preferred) ---
    @Bean
    @StepScope
    public JdbcBatchItemWriter<AccountDto> accountWriter(DataSource dataSource) {
        String sql =
            "MERGE INTO processed_accounts dst " +
            "USING (SELECT :accountId AS account_id, :displayName AS display_name FROM dual) src " +
            "ON (dst.account_id = src.account_id) " +
            "WHEN MATCHED THEN UPDATE SET dst.display_name = src.display_name " +
            "WHEN NOT MATCHED THEN INSERT (account_id, display_name) " +
            "  VALUES (src.account_id, src.display_name)";

        return new JdbcBatchItemWriterBuilder<AccountDto>()
            .sql(sql)
            .dataSource(dataSource)
            .itemSqlParameterSourceProvider(item -> new MapSqlParameterSource()
                .addValue("accountId", item.getAccountId())
                .addValue("displayName", item.getDisplayName()))
            .build();
    }
}
```

Key rules illustrated by the template:
- `@StepScope` on reader/writer so `jobParameters` are resolved at step start time.
- Paging reader streams records; no full-table load into memory.
- Upsert (MERGE) in the writer makes writes idempotent.
- `skipLimit` is bounded; only declared, expected exceptions are skipped.
- Chunk size (100) drives transaction granularity — one commit per 100 items.

## G) Tasklet template (orchestration steps: cleanup / notify / file move)

Use this skeleton for orchestration steps that perform a single operation rather than record-by-record
processing (cleanup tables, send a completion notification, move/rename a file, etc.).

```java
@Component
public class NotifyCompletionTasklet implements Tasklet {

    private static final Logger log = LoggerFactory.getLogger(NotifyCompletionTasklet.class);

    private final NotificationService notificationService;

    public NotifyCompletionTasklet(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Override
    public RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext) {
        JobParameters params = chunkContext.getStepContext()
            .getStepExecution().getJobParameters();

        String requestDate = params.getString("requestDate"); // business trigger date
        String accountId   = params.getString("accountId");  // business key

        // Delegate to service; tasklet stays thin
        notificationService.notifyCompletion(requestDate, accountId);

        // Boundary-safe log — no PII, no tokens
        log.info("Completion notification sent requestDate={} accountId={}", requestDate, accountId);

        return RepeatStatus.FINISHED;
    }
}
```

Wire the tasklet as a step in the job config:

```java
@Bean
public Step notifyCompletionStep(JobRepository jobRepository,
                                 PlatformTransactionManager txManager,
                                 NotifyCompletionTasklet notifyCompletionTasklet) {
    return new StepBuilder("notifyCompletionStep", jobRepository)
        .tasklet(notifyCompletionTasklet, txManager)
        .build();
}

@Bean
public Job accountSyncJob(JobRepository jobRepository,
                          AccountSyncJobParameterValidator validator,
                          Step syncAccountsStep,
                          Step notifyCompletionStep) {
    return new JobBuilder("accountSyncJob", jobRepository)
        .validator(validator)
        .start(syncAccountsStep)
        .next(notifyCompletionStep)
        .build();
}
```

Key rules illustrated by the template:
- Tasklet reads `requestDate` and business key(s) from `JobParameters`.
- Business logic is delegated to a `@Service`; tasklet stays thin (no domain logic inline).
- Log only safe identifiers — no PII, no secrets.

## H) Reader / Processor / Writer patterns (chunk steps)

### H.1 Reader
- Reader **MUST** stream data (cursor/paging) for large tables/files. **MUST NOT** load entire datasets into memory.
- Use JDBC-based paging or cursor readers for database sources (follow repo pattern):
  - `JdbcPagingItemReader` or `JdbcCursorItemReader` depending on repo conventions.
- For file sources, use `FlatFileItemReader` (CSV) or equivalent.
- Custom readers (e.g., API pagination) **MUST** apply bounded backoff/timeouts.

### H.2 Processor
- Processor **MUST** be pure-ish: transform/validate; avoid side effects.
- Validation failures:
  - If expected, use skip policy with a bounded skip limit, and write bad records to a reject output (if the job requires it).
  - If unexpected, fail fast with a meaningful, boundary-safe error.

### H.3 Writer
- Writer **MUST** be idempotent or protected by constraints (unique keys, upserts, job-run markers).
- For DB writes (JDBC-first):
  - Prefer JDBC batch inserts/updates (`JdbcBatchItemWriter` or `NamedParameterJdbcTemplate` batch operations).
  - Use upsert (MERGE / ON CONFLICT) semantics where the DB supports it.
  - Avoid per-item transactions outside chunk boundaries.

## I) Transactions (pragmatic)
- Chunk steps: transaction is typically "one transaction per chunk".
- **MUST NOT** open a transaction that spans the entire job for large datasets.
- If service methods are called from a writer, ensure their transactional settings do not conflict with the step transaction (follow repo conventions).

## J) Restartability & idempotency (non-negotiable)
### J.1 Restartability
- Steps **SHOULD** be restartable unless the business requirement demands "run once".
- If not restartable, document why and how ops should recover.

### J.2 Idempotency techniques (choose one, follow repo)
- Use a processed-marker table keyed by `(jobName, requestDate, <businessKey>)`
- Use upsert semantics (MERGE / ON CONFLICT) when supported
- Use unique constraints and treat duplicate writes as no-ops (with appropriate error handling)

Rule: **never rely on "we will never rerun"** as an idempotency strategy.

## K) Concurrency, scheduling, and locking
- If the job is scheduled, it **MUST** be protected against concurrent runs:
  - DB-based lock (preferred) or scheduler-level singleton enforcement
- Parallel steps/partitions are allowed only if the data is safely partitionable and the repo already uses partitioning.

## L) Error handling, retries, and skips
- Retry only for transient dependency failures (timeouts, temporary DB/network errors).
- Validation/business rule issues are **non-retriable**.
- Skip policies:
  - **MUST** have a bounded skip limit.
  - **MUST** produce observability (counts, reason categories).
- All error messages **MUST** be boundary-safe (no secrets/PII).

## M) Logging & observability (batch-operational defaults)
- Each job run **SHOULD** log:
  - `jobName`, `jobExecutionId`, `requestDate` (if present), start/end timestamps, status
- Chunk steps **SHOULD** emit progress logs periodically (every N chunks), not per item.
- **MUST NOT** log:
  - tokens, passwords, API keys
  - NRIC/FIN, or other sensitive identifiers in clear text
  - full raw payloads for large items
- Prefer structured logs if the repo uses them.

## N) Testing (pragmatic)
- Prefer step-level tests for readers/processors/writers.
- Use Spring Batch test utilities where available (follow repo).
- Add an integration test for the job wiring only when needed (keep it minimal).

Suggested test coverage:
- parameter validation (missing/invalid `requestDate` or business keys)
- restart scenario (fail mid-way, rerun)
- idempotency (rerun does not duplicate)
- chunk size boundaries (large dataset / paging)

## Review checklist (agent-use)
- [ ] Job/step names are stable and descriptive
- [ ] Job parameters include `requestDate` and relevant business primary key(s); on-demand runs include a unique `requestId`
- [ ] Parameters validated early; safe errors on invalid inputs
- [ ] Reader streams data (no full-table load)
- [ ] Writer is idempotent or protected by constraints/markers
- [ ] No secrets/PII in logs or parameters
- [ ] Retry/skip policies are bounded and appropriate
- [ ] Concurrency protection exists (no overlapping runs)
- [ ] Restartability behavior is deliberate and documented
- [ ] Async execution used for long-running jobs (synchronous only for short-lived or tooling jobs)
