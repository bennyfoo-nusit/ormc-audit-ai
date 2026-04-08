# test-planning-templates Skill

This skill contains the output templates and test case format rules for the Test Planning Agent. Load this skill when generating a test plan (`analyze` or `explore` commands).

---

## Test Case Format Rules

### Test Case Step Format
Step 1 of every test case must be: `Open browser and navigate to <application name from docs/projectassetlocation>` | `Application loads and displays the expected page title`.

Step 2 of every test case must be: `Log in` | `User is successfully authenticated and redirected to the application landing page`.

### Test Case Step Content Rules
- Step 1 of every test case must be: `Open browser and navigate to <application name from docs/projectassetlocation>` | `Application loads and displays the expected page title`.
- Step 2 of every test case must be: `Log in using the test user account` | `User is successfully authenticated and redirected to the application landing page`.
- For `analyze`: subsequent steps must be grounded in the acceptance criteria and requirements from the ADO User Story.
- For `explore`: subsequent steps must be grounded in observed application behavior from Playwright MCP exploration.

### Azure DevOps Test Case Format Rules
- Every test case must be structured in Azure DevOps Test Case work item style, not Gherkin.
- Every test case must include these metadata fields:
	- `Test Case ID: <id>`
	- `Title: <clear test case title>`
	- `Type: Positive | Negative | Edge`
	- `Priority: <1|2|3>`
	- `Requirement Mapping: AC-<n>` (for `analyze`) or `Flow: <flow name>` (for `explore`)
	- `Test Data: <data values or data set reference>`
- Test Case IDs must be unique and deterministic, for example: `TC-57551-P01`, `TC-57551-N01`, `TC-57551-E01`.
- For `explore` mode without a user story ID, use `TC-EXP-<flow-slug>-P01` format.
- The `Type` value must be exactly one of: `Positive`, `Negative`, `Edge`.
- Steps must be written in Azure DevOps-friendly Action/Expected Result style.
- Include enough test data detail so a tester can execute without guessing inputs.
- Credential rules: never include credential values, `.env` key names, or actual usernames/passwords in Test Data or step tables. Refer to credentials generically (e.g., "test user account").

### Generation Rules
- Do not invent requirements beyond the source content (User Story for `analyze`, observed behavior for `explore`).
- Label inferred items as `Assumption`.
- Explicitly call out mismatch between ADO criteria and observed behavior.
- Document inaccessible pages/flows and reason if known.
- Keep output actionable and execution-ready.

---

## Sample Output Structure — Analyze Mode
Use this structure for `analyze` output (`test-plan/<user story id>-test-plan.md`):

```md
# <user story id> - Test Plan

## 1. User Story Reference
- ID:
- Title:
- Tags:
- Links:

## 2. User Story Summary
- Business goal:
- Actor:
- Expected outcome:

## 3. Acceptance Criteria (from ADO)
1.
2.
3.

## 4. Scope
- In scope:
- Out of scope:

## 5. Assumptions
- Assumption A:
- Assumption B:

## 6. Preconditions
- User role/account:
- Environment:
- Data setup:

## 7. Test Cases
### Test Case: TC-<user story id>-P01
- Title: <positive test case title>
- Type: Positive
- Priority: 2
- Requirement Mapping: AC-1
- Test Data: test user account, <other non-credential input values>
- Publish Status: Not Published
- Automation Status: Not Automated
- Complexity: <Simple|Medium|Complex>

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open browser and navigate to <application name from docs/projectassetlocation> | Application loads and displays the expected page title |
| 2 | Log in using the test user account | User is successfully authenticated and redirected to the application landing page |
| 3 | <user action grounded in AC> | <expected system response> |

### Test Case: TC-<user story id>-N01
- Title: <negative test case title>
- Type: Negative
- Priority: 2
- Requirement Mapping: AC-2
- Test Data: test user account, <invalid or boundary non-credential values>
- Publish Status: Not Published
- Automation Status: Not Automated
- Complexity: <Simple|Medium|Complex>

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open browser and navigate to <application name from docs/projectassetlocation> | Application loads and displays the expected page title |
| 2 | Log in using the test user account | User is successfully authenticated and redirected to the application landing page |
| 3 | <invalid/blocked action> | <validation or error behavior> |

### Test Case: TC-<user story id>-E01
- Title: <edge case test title>
- Type: Edge
- Priority: 2
- Requirement Mapping: AC-3
- Test Data: test user account, <edge input values>
- Publish Status: Not Published
- Automation Status: Not Automated
- Complexity: <Simple|Medium|Complex>

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open browser and navigate to <application name from docs/projectassetlocation> | Application loads and displays the expected page title |
| 2 | Log in using the test user account | User is successfully authenticated and redirected to the application landing page |
| 3 | <edge condition action> | <boundary-safe behavior> |

## 8. Environment Requirements
- Environment name:
- Browser/device notes:

## 9. Dependencies
- Upstream systems:
- Feature flags/config:

## 10. Risks / Gaps / Questions
- Risks:
- Gaps:
- Open questions:

## Traceability Matrix
- AC-1 -> TC-<user story id>-P01
- AC-2 -> TC-<user story id>-N01
- AC-3 -> TC-<user story id>-E01
```

---

## Sample Output Structure — Explore Mode
Use this structure for `explore` output (`test-plan/explore-<slug>-test-plan.md`):

```md
# Explore Test Plan — <application name>

## 1. Application Reference
- Application Name: <from docs/projectassetlocation>
- Application URL: <from docs/projectassetlocation>
- Exploration Date: <date>

## 2. Discovered User Flows
1. <Flow name> — <brief description>
2. <Flow name> — <brief description>
3. ...

## 3. Observed Application Structure
- Landing page: <page title and key elements>
- Navigation: <main menu items, sidebar, tabs>
- Key pages/sections discovered: <list>

## 4. Assumptions
- Assumption A:
- Assumption B:

## 5. Preconditions
- User role/account:
- Environment:
- Data setup:

## 6. Test Cases
### Test Case: TC-EXP-<flow-slug>-P01
- Title: <positive test case title>
- Type: Positive
- Priority: 2
- Flow: <flow name>
- Test Data: test user account, <other non-credential input values>
- Publish Status: Not Published
- Automation Status: Not Automated
- Complexity: <Simple|Medium|Complex>

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open browser and navigate to <application name from docs/projectassetlocation> | Application loads; page title matches "<observed page title>" |
| 2 | Log in using the test user account | User is successfully authenticated and redirected to the application landing page |
| 3 | <observed action from MCP exploration> | <observed system response> |

### Test Case: TC-EXP-<flow-slug>-N01
- Title: <negative test case title>
- Type: Negative
- Priority: 2
- Flow: <flow name>
- Test Data: test user account, <invalid values>
- Publish Status: Not Published
- Automation Status: Not Automated
- Complexity: <Simple|Medium|Complex>

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open browser and navigate to <application name from docs/projectassetlocation> | Application loads; page title matches "<observed page title>" |
| 2 | Log in using the test user account | User is successfully authenticated and redirected to the application landing page |
| 3 | <invalid action observed via MCP> | <validation or error behavior observed> |

## 7. Environment Requirements
- Environment name:
- Browser/device notes:

## 8. Risks / Gaps / Questions
- Risks:
- Gaps:
- Open questions:

## Flow Coverage Matrix
- Flow 1 -> TC-EXP-<slug>-P01, TC-EXP-<slug>-N01
- Flow 2 -> TC-EXP-<slug>-P01
```
