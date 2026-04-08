---
name: development-templates
description: "Output templates, reference tables, and report formats for the developer agent. Use when generating implementation plans, PR descriptions, coverage reports, commit messages, branch names, implementation summaries, or help reference."
---

# Development Output Templates

Use the appropriate template when generating development output. Replace `{placeholders}` with actual values.

## Pre-Flight Validation Report

```markdown
## Development — Pre-Flight Validation

### Environment
| Tool | Required | Status | Version |
|------|----------|--------|---------|
| {Language runtime} | ✅ | ✅/❌ | {version} |
| {Package manager} | ✅ | ✅/❌ | {version} |
| {Build tool} | ✅ | ✅/❌ | {version} |
| {Test framework} | ✅ | ✅/❌ | {version} |
| {Coverage tool} | ✅ | ✅/❌ | {version} |
| Git | ✅ | ✅/❌ | {version} |

### Integrations
| Integration | Status | Details |
|------------|--------|---------|
| GitHub | ✅/⚠️ | {repo} |
| Azure DevOps | ✅/⚠️ | {project} |

### Data Sources
| Source | Path | Status | Details |
|--------|------|--------|---------|
| Project Plan | `/docs/plan/project-plan.md` | ✅/❌ | {sprint/task context} |
| Functional Requirements | `/docs/requirements/functional/` | ✅/❌ | {N} FRs found |
| Non-Functional Requirements | `/docs/requirements/non-functional/` | ✅/❌ | {N} NFRs found |
| Business Rules | `/docs/requirements/business-rules.md` | ✅/❌ | {N} rules found |
| ADRs | `/docs/adr/` | ✅/❌ | {N} ADRs found |
| User Stories | `dev-ops/user-stories/` | ✅/❌ | {N} refined stories |
| Project Config | `/docs/projectassetlocation` | ✅/❌ | {repos configured} |

### Git Status
| Check | Status | Details |
|-------|--------|---------|
| Clean working tree | ✅/❌ | {uncommitted changes count} |
| Current branch | — | {branch name} |
| Remote sync | ✅/⚠️ | {ahead/behind count} |

### Test Infrastructure
| Check | Status | Details |
|-------|--------|---------|
| Test framework configured | ✅/❌ | {framework name} |
| Coverage plugin configured | ✅/❌ | {plugin name} |
| Test command works | ✅/❌ | {command} |
| Coverage report path | ✅/❌ | {path} |

### Blockers
- {critical issues preventing implementation}

**Overall: ✅ Ready | ⚠️ Partial | ❌ Blocked**
```

## Tech Stack Detection Indicators

| File | Indicates | Test Framework | Coverage Tool |
|------|-----------|---------------|---------------|
| `pom.xml` | Java / Maven | JUnit 5 / Surefire | JaCoCo |
| `build.gradle` / `build.gradle.kts` | Java / Gradle | JUnit 5 | JaCoCo |
| `package.json` + `tsconfig.json` | TypeScript / Node | Jest / Vitest | c8 / istanbul |
| `package.json` (no tsconfig) | JavaScript / Node | Jest / Vitest | c8 / istanbul |
| `requirements.txt` / `pyproject.toml` | Python | pytest | coverage.py / pytest-cov |
| `*.csproj` / `*.sln` | .NET / C# | xUnit / NUnit | coverlet |
| `go.mod` | Go | go test | go tool cover |
| `Cargo.toml` | Rust | cargo test | cargo-tarpaulin |
| `angular.json` | Angular | Karma / Jest | Istanbul |
| `next.config.*` | Next.js | Jest / Vitest | c8 / istanbul |
| `vite.config.*` | Vite (React/Vue) | Vitest | v8 / istanbul |

## Test & Coverage Commands by Stack

### Java / Maven
```bash
# Build
mvn compile
# Test with coverage
mvn test
# Coverage report location
target/site/jacoco/index.html
# Parse coverage
grep -o 'Total[^%]*%' target/site/jacoco/index.html
```

### TypeScript / Jest
```bash
# Build
npm run build
# Test with coverage
npx jest --coverage --coverageReporters=text-summary --coverageReporters=json-summary
# Coverage report
coverage/coverage-summary.json
# Parse: read JSON → total.lines.pct
```

### TypeScript / Vitest
```bash
# Build
npm run build  # or: npx tsc
# Test with coverage
npx vitest run --coverage
# Coverage report
coverage/coverage-summary.json
# Parse: read JSON → total.lines.pct
```

### Python / pytest
```bash
# Test with coverage
pytest --cov=src --cov-report=term-missing --cov-report=json
# Coverage report
coverage.json
# Parse: read JSON → totals.percent_covered
```

### .NET / coverlet
```bash
# Build
dotnet build
# Test with coverage
dotnet test --collect:"XPlat Code Coverage"
# Coverage report
TestResults/*/coverage.cobertura.xml
# Parse: xmllint to extract line-rate attribute
```

### Go
```bash
# Build
go build ./...
# Test with coverage
go test -coverprofile=coverage.out ./...
# Coverage summary
go tool cover -func=coverage.out | grep total
```

## Branch Naming Convention

```
{type}/AB#{id}-{short-description}
{type}/GH-{id}-{short-description}
```

**Types:** `feature`, `fix`, `refactor`, `test`, `chore`

**Examples:**
- `feature/AB#83561-login-page-ui`
- `fix/GH-42-auth-token-refresh`
- `refactor/AB#1234-extract-auth-service`

## Commit Message Convention

```
AB#{id}: {type}: {description}
GH-{id}: {type}: {description}
```

**Types:** `feat`, `fix`, `test`, `refactor`, `chore`, `docs`

**Examples:**
- `AB#83561: feat: add NUS-branded login page with MSAL integration`
- `AB#83561: test: add unit tests for AuthContext provider`
- `GH-42: fix: handle token refresh failure gracefully`

## Implementation Plan Template

```markdown
## Implementation Plan: {issue-id} — {title}

### Context
- **Issue:** {issue-id} — {title}
- **Sprint:** {sprint} | **Priority:** {priority} | **Estimate:** {estimate}
- **Parent Story:** {story-id}: {story-title}
- **Requirements:** {FR-ids}, {NFR-ids}

### Tech Stack
- **Language:** {language}
- **Framework:** {framework}
- **Test Framework:** {test-framework}
- **Coverage Tool:** {coverage-tool}

### Files
| Action | Path | Purpose |
|--------|------|---------|
| Create | `{path}` | {description} |
| Modify | `{path}` | {description} |

### Interface Contracts
```{language}
// {component} interface
{method signatures, API endpoints, DTOs}
\```

### Implementation Steps
1. {step with specific details}
2. {step}
3. {step}

### Test Plan
| Test File | Scenarios |
|-----------|-----------|
| `{path}` | {scenario list} |

### Security Checklist
- [ ] No PII in logs
- [ ] Parameterized queries (no SQL injection)
- [ ] Input validation at boundaries
- [ ] No hardcoded credentials
- [ ] OWASP Top 10 addressed

### Requirements Traceability
| Requirement | Acceptance Criteria | Verified By |
|-------------|-------------------|-------------|
| {FR-id} | {criteria} | {test file/method} |
```

## Coverage Report Summary Template

```markdown
## Coverage Report

| File | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| {file} | {pct}% | {pct}% | {pct}% | {pct}% |
| **All files** | **{pct}%** | **{pct}%** | **{pct}%** | **{pct}%** |

**Target:** {target}% | **Achieved:** {actual}% | **Status:** ✅ Met / ❌ Below target
**Tests:** {passed} passed, {failed} failed | **Iterations:** {count}
```

### Coverage Parsing Logic

```
FOR each source file in coverage report:
  IF line coverage < target:
    IDENTIFY uncovered line numbers
    READ source at those lines
    CLASSIFY:
      - Missing test for code path → WRITE TEST
      - Edge case not covered → WRITE TEST
      - Framework-generated code → SKIP (note as untestable)
      - Unreachable defensive code → SKIP (note with reason)
      - Main/entry point → SKIP (not unit-testable)
```

## PR Description Template

```markdown
## {type}: {description}

**Issue:** {issue-link} | **ADO:** AB#{id}
**Sprint:** {sprint} | **Story Points:** {sp}

### Summary
{1-2 sentence description of what this PR does}

### Changes
| File | Change |
|------|--------|
| `{path}` | {what changed and why} |

### Requirements Traceability
| Requirement | Status |
|-------------|--------|
| {FR/NFR-id}: {name} | ✅ Implemented |

### Test Coverage
{coverage report summary from template above}

### Security Checklist
- [x] No PII in logs or error messages
- [x] Input validation at all boundaries
- [x] No hardcoded credentials or secrets
- [x] Parameterized queries (no SQL injection)
- [x] OWASP Top 10 reviewed

### Self-Review
- Critical: {count} (all fixed)
- Warnings: {count}
- Suggestions: {count}
```

## Implementation Summary Template

```markdown
## Implementation Summary: {issue-id}

### Files
| Action | Path |
|--------|------|
| Created | `{path}` |
| Modified | `{path}` |

### Tests
- **Test files:** {count}
- **Tests passed:** {passed}/{total}
- **Coverage:** {pct}% (target: {target}%)

### Git
- **Branch:** `{branch-name}`
- **Commits:** {count}
- **PR:** #{pr-number} ({pr-url})

### Work Item
- **ADO State:** {prev-state} → {new-state}
- **PR Link:** Added as artifact

### Next Steps
- [ ] Code review via `@code-review-agent review #{pr-number}`
- [ ] Merge after approval
```

## Help Command Template

```markdown
## @6-developer — Command Reference

### Core Commands
| Command | Description |
|---------|-------------|
| `implement {issue-id}` | Full pipeline: explore → plan → implement → test → PR |
| `plan {issue-id}` | Generate implementation plan without coding |
| `scaffold {feature}` | Generate project skeleton / boilerplate for a feature |
| `fix {issue-id}` | Bug fix: diagnose → fix → verify → PR |
| `test {scope}` | Generate unit tests for existing code |
| `refactor {scope}` | Refactor with safety: tests must pass before and after |

### Workflow Commands
| Command | Description |
|---------|-------------|
| `validate` | Pre-flight: check tooling, branch, MCP, data sources |
| `status` | Show active implementations, branches, pending PRs |
| `resume` | Continue last implementation session |
| `run-all --sprint {n}` | Implement all issues for a sprint |

### Options
| Flag | Description | Default |
|------|-------------|---------|
| `--auto-approve` | Skip plan confirmation | false |
| `--coverage-target {pct}` | Set minimum coverage percentage | 90 |
| `--max-iterations {n}` | Max test-fix loop iterations | 5 |
| `--skip-pr` | Implement without creating PR | false |
| `--skip-ado-update` | Skip Azure DevOps state update | false |
| `--dry-run` | Generate plan only, no code changes | false |
| `--no-branch` | Work on current branch (skip branch creation) | false |

### Workflow
\```
validate → implement (explore → plan → code+test → coverage loop → PR)
Or: plan (explore → plan only)
Or: run-all --sprint {n}
\```

### Skills Loaded
- **coding** — General coding standards (always)
- **development-templates** — Output templates (always)
- **java** — Java/Spring conventions (when Java detected)
- **nus-logging** — NUS logging taxonomy (for backend code)

### Delegation
| Need | Command |
|------|---------|
| Code review | `@code-review-agent review {pr-number}` |
| Missing requirements | `@3-requirement-analyst` |
| Story grooming | `@5-product-owner groom-story {id}` |
| Architecture validation | `@2-technical-feasibility validate` |
| Update plan | `@4-project-planning update-plan` |
| Documentation | `@docs-agent` |
```

## Coverage Loop Configuration

### Default Parameters
| Parameter | Value | Override Flag |
|-----------|-------|--------------|
| Coverage target | 90% | `--coverage-target {pct}` |
| Max iterations | 5 | `--max-iterations {n}` |
| Stagnation limit | 2 consecutive no-improvement iterations | — |
| Build retry limit | 3 attempts | — |

### Stagnation Detection
```
IF current_coverage == previous_coverage FOR 2 consecutive iterations:
  STOP loop
  REPORT uncovered lines with classification:
    - Framework-generated code (Spring Boot main, React index, etc.)
    - Entry points (main methods, CLI handlers)
    - External integration points (DB calls, HTTP clients)
    - Defensive branches (catch blocks for impossible states)
```
