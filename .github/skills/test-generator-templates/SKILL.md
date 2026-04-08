# Test Generator Templates Skill

Framework-agnostic outcome report templates, test data conventions, test plan status update rules, and traceability conventions for the Test Generator Agent. Load this skill before producing the final outcome report.

Code scaffolding templates (page objects, spec files, fixtures) are defined in the active framework skill (e.g., `test-generator-playwright-web`), not here.

---

## 1. Per-Case Outcome Reports

### Automated (Passing) Report
```
Test Generator Report
──────────────────────────────────
ADO Test Case:   <id> — <title>
Spec File:       tests/<file>.spec.ts
Result:          ✅ AUTOMATED — test passes

Steps Automated: <n> of <total>
Page Objects:    <list of created/modified page objects>
Fixtures:        <list of created/modified fixtures, or "No changes">
Test Data:       <data file path, or "Inline values only">
MCP Evidence:    <brief note on what MCP inspection confirmed>
Repair Attempts: <n> (0 if passed on first run)
```

### Blocked Report
```
Test Generator Report
──────────────────────────────────
ADO Test Case:   <id> — <title>
Spec File:       tests/<file>.spec.ts (generated but not passing)
Result:          ❌ BLOCKED — automation could not be completed

Blocker Reason:  <specific reason — be precise>
Root Cause:      <category and details>
Attempts Made:   <n> of 5
Last Failure:    <brief description of the last failure>
Recommendation:  <suggested next action — e.g., fix product bug, update ADO test case, check environment>
```

### Skipped Report (Duplicate)
```
Test Generator Report
──────────────────────────────────
ADO Test Case:   <id> — <title>
Result:          ⏭️ SKIPPED — automation already exists

Existing Spec:   tests/<file>.spec.ts
Suggestion:      Use @test-healer-agent fix-test <id> to repair if broken
```

---

## 2. Batch Summary Report

When processing multiple test case IDs, produce a consolidated summary after all cases are processed:

```
Test Generator — Batch Summary
══════════════════════════════════════════════════════════════════════
ID      Title                              Result         Spec File
──────────────────────────────────────────────────────────────────────
<id>    <title>                            ✅ Automated    tests/<file>.spec.ts
<id>    <title>                            ❌ Blocked      tests/<file>.spec.ts
<id>    <title>                            ⏭️ Skipped      tests/<file>.spec.ts
──────────────────────────────────────────────────────────────────────
Total: <n> | Automated: <n> | Blocked: <n> | Skipped: <n>

Files Created:
  - src/pages/<file>.page.ts
  - tests/<file>.spec.ts
  - test-data/TC-<id>.json

Files Modified:
  - src/pages/<existing>.page.ts (added <method> method)
  - src/fixtures/base.fixture.ts (added <fixture> fixture)
  - test-plan/<id>-test-plan.md (updated Automation Status)
```

---

## 3. Test Data File Convention

When test data externalization is justified:

**File format:** JSON
**Location:** `test-data/`
**Naming:** `TC-<id>.json` or `<feature-slug>.json`

```json
{
  "testCaseId": "<ADO-ID>",
  "description": "<brief description of test data purpose>",
  "data": {
    "<field>": "<value>"
  }
}
```

**Rules:**
- Create only when inline values are insufficient (parameterized tests, complex data)
- At most one data file per test case
- Include test case ID in filename
- Keep data minimal and human-readable
- Do not duplicate data already available in existing files

---

## 4. Test Plan Status Update Convention

After a confirmed passing run, update the test plan file:

**File location:** `test-plan/<user-story-id>-test-plan.md`

**Update rule:** Find the test case section and set (or add):
```
- Automation Status: Automated
```

If the test case is blocked, set:
```
- Automation Status: Blocked — <brief reason>
```

If the `Automation Status` field doesn't exist, add it to the test case metadata section.

---

## 5. Traceability Convention

Every generated artifact must maintain traceability back to the ADO test case:

| Artifact | Traceability Marker |
|----------|-------------------|
| Spec file test title | `[<ADO-ID>]` prefix |
| Spec file comment | `// ADO Test Case: <ID>` at file level |
| Page object (if created for this case) | Comment noting which case triggered creation |
| Test data file | `testCaseId` field in JSON |
| Test plan update | `Automation Status` field per case |
| Batch summary report | ID column in summary table |
