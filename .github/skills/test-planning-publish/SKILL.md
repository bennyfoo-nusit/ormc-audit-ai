# test-planning-publish Skill

This skill contains the full ADO publish workflow for the Test Planning Agent. Load this skill when the user invokes the `publish` command.

---

## Publish Command — Create Test Case Work Items in Azure DevOps

### Purpose
The `publish` command reads test cases from a generated `test-plan/<user story id>-test-plan.md` file and creates Azure DevOps Test Case work items for each one, using the project configuration in `docs/projectassetlocation`.

### Command Variants

| Command | Behavior |
|---|---|
| `publish <user story id> <test case id>` | Publishes a single test case from the test plan of `<user story id>` |
| `publish <user story id>` | Publishes all test cases in the test plan of `<user story id>` |

### Inputs
- `user story id` (required): The ADO work item ID of the User Story whose test plan should be published (e.g., `81937`). Used to resolve the source file `test-plan/<user story id>-test-plan.md`.
- `test case id` (optional): A Test Case ID present in the resolved test plan file (e.g., `TC-81937-P01`). When provided, only that single test case is published.
- `docs/projectassetlocation`: read to obtain **Organization** and **Project Name** for ADO API calls.

### Resolving the Test Plan File

The source file is always resolved directly from `<user story id>`:

1. Resolve the source file as `test-plan/<user story id>-test-plan.md`.
2. If the file does not exist, stop and inform the user:
   > `test-plan/<user story id>-test-plan.md` was not found. Run `analyze <user story id>` first to generate it.

### Parsing Test Cases from Markdown
Each test case block in the markdown file follows this structure:

```
### Test Case: TC-<user story id>-<suffix>
- **Title:** <title>
- **Type:** Positive | Negative | Edge
- **Priority:** <1|2|3>
- **Requirement Mapping:** <AC references>
- **Test Data:** <data description>

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1    | ...    | ...             |
...
```

Parsing rules:
- A test case block begins at `### Test Case: <ID>` and ends immediately before the next `### Test Case:` heading, a `---` separator, or end of file.
- Extract the Test Case ID from the heading line.
- Extract metadata from the `- **Field:** Value` lines (Title, Type, Priority, Requirement Mapping, Test Data).
- Extract step rows from the markdown table, excluding the header and separator rows. Each row yields one `Action` and one `Expected Result`.
- If a field is missing or blank in the markdown, mark it as `Not provided` in the ADO work item.

### ADO Test Case Work Item Field Mapping

| Markdown Field | ADO Work Item Field | Notes |
|---|---|---|
| Title | `System.Title` | Required; use the test case title from markdown |
| Priority | `Microsoft.VSTS.Common.Priority` | Map `1` → `1`, `2` → `2`, `3` → `3`; default to `2` if absent |
| Type | `System.Tags` | Append the type value (e.g., `Positive`, `Negative`, `Edge`) as a tag |
| Requirement Mapping | `System.Description` | Include as "Requirement Mapping: AC-n" in the description |
| Test Data | `System.Description` | Append to the description block |
| Steps (Action/Expected Result) | Test Steps (via `mcp_microsoft_azu_testplan_update_test_case_steps`) | Each step row maps to one ADO test step with `Action` and `Expected Result` |
| Test Case ID | `System.Tags` | Include the test case ID (e.g., `TC-81937-P01`) as a tag for traceability |
| Test Automation Status | `Custom.TestAutomationStatus` | Always set to `Pending Automation` on every publish operation |
| Complexity | `Custom.Complexity` | Derived from complexity assessment at publish time; see Complexity Assessment Rules |

Description format to use when creating the work item:
```
Requirement Mapping: <AC references>

Test Data: <test data value>

Type: <Positive|Negative|Edge>
```

### Complexity Assessment Rules

At publish time, derive a `Complexity` value for each test case using the criteria below. Apply the **highest** matching level.

**Inputs to the assessment:**
- Total number of rows in the step table (all steps, including the mandatory navigate and login steps)
- Test case `Type` (`Positive`, `Negative`, `Edge`)
- Number of distinct Acceptance Criteria referenced in `Requirement Mapping`

| Complexity | Criteria (any one is sufficient) |
|---|---|
| `Simple` | ≤ 4 total steps **and** `Positive` type **and** ≤ 1 AC reference |
| `Medium` | 5–7 total steps **or** `Negative` type **or** 2 AC references |
| `Complex` | ≥ 8 total steps **or** `Edge` type **or** ≥ 3 AC references |

Assessment rules:
- Evaluate all criteria; use the highest level that matches.
- If the step count or AC reference count cannot be determined from the parsed test case, default to `Medium`.
- Valid values are exactly: `Simple`, `Medium`, `Complex`.
- Record the derived value as the `Complexity` metadata field in the published ADO work item (`Custom.Complexity`).

### Execution Workflow

The workflow is structured into **4 sequential phases** to minimise API round-trips. Custom fields (`Description`, `Tags`, `Custom.TestAutomationStatus`, `Custom.Complexity`) cannot be set via `mcp_microsoft_azu_testplan_create_test_case` — they must be applied in a separate batch update call. Always batch these updates across all test cases in a single `mcp_microsoft_azu_wit_update_work_items_batch` call rather than updating each work item individually.

**Phases overview:**
- Phase 1 — Create work items sequentially (one call per test case)
- Phase 2 — Update steps sequentially (one call per test case; use `id` as the parameter name)
- Phase 3 — Batch-update all custom fields in a **single** `mcp_microsoft_azu_wit_update_work_items_batch` call
- Phase 4 — Update markdown and print summary in one pass

**Detailed steps:**

1. Parse the command to determine the variant (`publish <user story id> <test case id>` or `publish <user story id>`).
2. Read `docs/projectassetlocation` to obtain **Organization** and **Project Name**. If the file does not exist, stop and inform the user:
   > `docs/projectassetlocation` was not found. Please run `@connectivity-agent setup` to configure project assets, then retry.
3. Confirm the resolved project with the user before proceeding:
   > Test case(s) will be published to Azure DevOps project **`<Project Name>`** (Organization: `<Organization>`). Confirm? `[Y/n]`
   - If the user responds with anything other than `Y` or `y` (including `n`, `N`, or leaving it blank), stop immediately:
     > Publish cancelled. No work items were created.
4. Resolve the test plan file using the Resolving the Test Plan File rules above.
5. Parse the test plan file and collect the target test case(s):
   - `publish <user story id> <test case id>`: collect the single test case whose ID matches exactly.
     - If no matching test case is found, stop and inform the user:
       > Test case `<test case id>` was not found in `test-plan/<user story id>-test-plan.md`. Verify the ID and retry.
   - `publish <user story id>` (no test case id): collect all test cases in the file.

**Phase 1 — Create work items** (one call per test case, sequentially):

6. For each test case, call `mcp_microsoft_azu_testplan_create_test_case` with:
   - **Project**: Project Name from `docs/projectassetlocation`
   - **Title**: test case Title field
   - **Priority**: mapped Priority value
   - **testsWorkItemId**: the user story ID (links the test case to the User Story)
   - Capture the returned ADO work item ID for each test case.

**Phase 2 — Update test steps** (one call per test case, sequentially):

7. For each created work item, call `mcp_microsoft_azu_testplan_update_test_case_steps` with:
   - **`id`**: the ADO work item ID returned in Phase 1 — use exactly `id` as the parameter name (not `workItemId`)
   - **`steps`**: a newline-delimited **string** where each line represents one step in the format `<n>. <Action>|<Expected Result>`. Do NOT pass a JSON array — passing a JSON array will serialize all steps into a single row in ADO instead of individual step rows. 

**Phase 3 — Batch-update custom fields** (single call for all test cases):

8. Call `mcp_microsoft_azu_wit_update_work_items_batch` once with all field updates across all test cases, including for each work item:
   - `System.Description`: formatted per ADO Test Case Work Item Field Mapping
   - `System.Tags`: Test Case ID and Type (comma-separated)
   - `Custom.TestAutomationStatus`: `Pending Automation`
   - `Custom.Complexity`: value derived from the Complexity Assessment Rules

**Phase 4 — Update markdown and print summary**:

9. Update the test plan markdown file (`test-plan/<user story id>-test-plan.md`) for **all** published test cases in a single multi-replace operation, adding or updating under each test case heading:
   - `- **ADO Work Item ID:** <returned ADO work item ID>`
   - `- **Publish Status:** Published`
10. Print the summary table:

```
| Test Case ID     | ADO Work Item ID | Status  |
|------------------|-----------------|---------|
| TC-81937-P01     | 12345           | Created |
| TC-81937-P02     | 12346           | Created |
| ...              | ...             | ...     |
```

11. If any individual creation or step update fails, record the failure in the summary with the reason and continue processing remaining test cases. Do not abort the entire batch on a single failure.

### Guardrails for Publish

- Do not re-publish a test case that already has `Publish Status: Published` recorded in the test plan markdown. Warn the user instead:
  > `TC-81937-P01` may already exist in ADO (ADO ID: `12345`). Pass `--force` or remove the existing `Publish Status` and ADO Work Item ID from the markdown to republish.
- Never create duplicate test case work items in a single publish run (deduplicate by Test Case ID within the batch).
- Never modify or delete existing ADO work items during the publish operation.
- Do not expose credential values at any point during or after the publish workflow.

Stop conditions:
- Required authentication input unavailable
- Application cannot be accessed after reasonable retry attempts

When stopped, provide a concise reason and next required action.
