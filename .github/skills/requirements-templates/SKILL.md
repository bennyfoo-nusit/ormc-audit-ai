---
name: requirements-templates
description: "Output templates, reference tables, and report formats for the requirements agent. Use when generating requirement documents, gap analysis, traceability matrices, audit reports, executive summaries, metrics dashboards, clarification dashboards, tracking tables, session agendas, impact analyses, readiness assessments, or help reference."
---

# Requirements Output Templates

Use the appropriate template when generating requirements output. Replace `{placeholders}` with actual values.

## Clarification Priority Classification

| Priority | Criteria |
|----------|---------|
| P0 Critical | Blocks development, affects architecture, legal/compliance |
| P1 High | Affects major features, multiple requirements, timeline-sensitive |
| P2 Medium | Affects implementation details, limited scope, has workarounds |
| P3 Low | Nice to know, has acceptable defaults, can be deferred |

## Clarification Stakeholder Assignment

| Question Type | Assign To |
|--------------|-----------|
| Business logic | Product Owner |
| Technical constraints | Tech Lead / Architect |
| UI/UX | Design Team |
| Compliance | Legal / Compliance Team |
| Integration | Partner teams / NUS ITS |

## Functional Requirement Document

```markdown
# Functional Requirements — {Project Name}

**Source:** {Confluence page URL}
**Extracted:** {date}
**Total Requirements:** {N}
**Status:** Draft | Reviewed | Approved

---

## {Module/Feature Name}

### FR-{NNN}: {Title}
**Priority:** High | Medium | Low
**Source:** [{Page Title}]({confluenceUrl})
**Status:** 📋 Draft | 👀 In Review | ✅ Approved | ⏸️ On Hold | ❌ Rejected | 🔄 Changed

**User Story:**
As a {persona}, I want to {action} so that {benefit}.

**Acceptance Criteria:**
- [ ] Given {context}, when {action}, then {expected result}
- [ ] Given {context}, when {action}, then {expected result}

**Business Rules:**
- {rule 1}
- {rule 2}

**Dependencies:** {FR-NNN, NFR-NNN, or None}
**Notes:** {additional context}
```

## Non-Functional Requirement Document

```markdown
# Non-Functional Requirements — {Project Name}

**Source:** {Confluence page URL}
**Extracted:** {date}

---

### NFR-{NNN}: {Title}
**Category:** Performance | Security | Availability | Scalability | Usability | Compliance | Maintainability | Reliability
**Priority:** High | Medium | Low
**Status:** 📋 Draft | ✅ Approved

**Requirement:**
{Measurable, testable statement}

**Measurement Criteria:**
- Metric: {what to measure}
- Target: {specific threshold}
- Method: {how to test}

**Rationale:** {why this NFR matters}
**Dependencies:** {related FRs or NFRs}
```

## Gap Analysis Report

```markdown
# Gap Analysis — {Project Name}

**Generated:** {date}
**Total Gaps:** {N}
**Critical:** {N} | **High:** {N} | **Medium:** {N} | **Low:** {N}

---

## Gap Summary

| ID | Category | Issue | Severity | Impact | Status |
|----|----------|-------|----------|--------|--------|
| GAP-{NNN} | {category} | {description} | Critical/High/Medium/Low | {impact} | Open/Addressed |

## Detailed Gaps

### GAP-{NNN}: {Title}
**Category:** Missing Requirement | Ambiguous | Incomplete | Conflicting | Untestable
**Severity:** Critical | High | Medium | Low
**Severity Score:** {1-10}
**Source Page:** [{title}]({url})

**Issue:**
{Detailed description of the gap}

**Impact:**
{What happens if not addressed}

**Recommendation:**
{Suggested resolution}

**Related Requirements:** {FR-NNN, NFR-NNN}
**Clarification Generated:** CLR-{NNN} / None
```

## Clarifications Document

```markdown
# Clarifications — {Project Name}

**Generated:** {date}
**Total:** {N} | **Open:** {N} | **Resolved:** {N}

---

### CL-{NNN}: {Question}
**Related Requirement:** {FR-NNN or GAP-NNN}
**Priority:** P0 Critical | P1 High | P2 Medium | P3 Low
**Status:** Open | Answered | Deferred
**Source:** [{Page Title}]({confluenceUrl})

**Context:**
{Why this clarification is needed}

**Options (if applicable):**
- Option A: {description}
- Option B: {description}

**Answer:** {resolution when answered}
**Answered By:** {person}
**Answered Date:** {date}
**Impact on Requirement:** {how the answer changes FR-NNN}
```

## Requirements Summary

```markdown
# Requirements Summary — {Project Name}

**Generated:** {date}
**Source:** {Confluence space/pages}

## Overview
| Metric | Count |
|--------|-------|
| Functional Requirements | {N} |
| Non-Functional Requirements | {N} |
| Business Rules | {N} |
| User Personas | {N} |
| Total Gaps Identified | {N} |
| Total Clarifications | {N} |

## By Priority
| Priority | FRs | NFRs |
|----------|-----|------|
| High | {N} | {N} |
| Medium | {N} | {N} |
| Low | {N} | {N} |

## By Status
| Status | Count | % |
|--------|-------|---|
| Draft | {N} | {%} |
| In Review | {N} | {%} |
| Approved | {N} | {%} |
| On Hold | {N} | {%} |

## Key Risks
1. {risk}
2. {risk}

## Readiness Assessment
{✅ Ready | ⚠️ Partially Ready | ❌ Not Ready} — {rationale}
```

## Pre-Flight Validation Report

```markdown
## Requirement Analyst — Pre-Flight Validation

### Data Sources
| Source | Path | Status | Details |
|--------|------|--------|---------|
| Project Config | `/docs/projectassetlocation` | ✅/❌ | {details} |
| Confluence | {cloud ID} | ✅/❌ | {space key} |
| FR Documents | `/docs/requirements/functional/` | ✅/❌ | {count} files |
| NFR Documents | `/docs/requirements/non-functional/` | ✅/❌ | {count} files |
| Gap Analysis | `/docs/requirements/gap-analysis.md` | ✅/❌ | |
| Clarifications | `/docs/requirements/clarifications.md` | ✅/❌ | |

### MCP Tools
| Tool | Status |
|------|--------|
| Confluence Read | ✅/❌ |
| Confluence Write | ✅/❌ |
| GitHub | ✅/❌ |

**Overall: ✅ Ready | ⚠️ Partial | ❌ Blocked**
```

## Requirements Status Dashboard

```markdown
## Requirements Status Dashboard

**Last Updated:** {date}

### Health Overview
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Total Requirements | {N} | — | — |
| Approved (%) | {%} | >80% | {✅/⚠️/❌} |
| With Acceptance Criteria | {%} | 100% | {✅/⚠️/❌} |
| Gaps Identified | {N} | — | — |
| Gaps Addressed (%) | {%} | 100% | {✅/⚠️/❌} |
| Open Clarifications | {N} | 0 | {✅/⚠️/❌} |
| Quality Score | {N}/100 | >70 | {✅/⚠️/❌} |

### By Feature/Module
| Feature | FRs | Approved | Gaps | CLRs Open | Ready? |
|---------|-----|----------|------|-----------|--------|
| {feature} | {N} | {N} | {N} | {N} | {✅/⚠️/❌} |
```

## Requirements Quality Audit

```markdown
## Requirements Quality Audit

**Date:** {date}
**Scope:** {N} functional requirements, {N} non-functional requirements

### Scoring Dimensions
| Dimension | Weight | Score | Weighted | Details |
|-----------|--------|-------|----------|---------|
| Completeness | 20% | {0-100} | {N} | User story + AC + priority + dependencies |
| Clarity | 15% | {0-100} | {N} | Unambiguous, single interpretation |
| Testability | 15% | {0-100} | {N} | Measurable AC, objective criteria |
| Consistency | 10% | {0-100} | {N} | No contradictions, consistent terminology |
| Traceability | 10% | {0-100} | {N} | Source linked, downstream mapped |
| Feasibility | 10% | {0-100} | {N} | Technically achievable, realistic scope |
| Prioritization | 10% | {0-100} | {N} | All prioritized, rationale documented |
| Modularity | 10% | {0-100} | {N} | Single responsibility, proper granularity |
| **Overall** | **100%** | — | **{N}/100** | {Excellent/Good/Fair/Poor} |

### Rating Scale
| Score | Rating | Meaning |
|-------|--------|---------|
| 90-100 | Excellent | Production-ready |
| 70-89 | Good | Minor improvements needed |
| 50-69 | Fair | Significant gaps |
| 0-49 | Poor | Major rework needed |

### Top Issues
| # | Requirement | Issue | Severity | Recommendation |
|---|------------|-------|----------|----------------|
| 1 | {FR-NNN} | {issue} | {sev} | {fix} |
```

## Traceability Matrix

```markdown
## Requirements Traceability Matrix

| Req ID | Type | Title | Source Page | Gaps | CLRs | Dependencies | Sprint | Status |
|--------|------|-------|------------|------|------|-------------|--------|--------|
| FR-001 | FR | {title} | [{page}]({url}) | GAP-001 | CLR-001 | NFR-002 | S1 | ✅ |
| NFR-001 | NFR | {title} | [{page}]({url}) | — | — | FR-003 | S1 | ✅ |

### Coverage Summary
| Dimension | Coverage | Status |
|-----------|----------|--------|
| Source Traceability | {%} | {✅/⚠️/❌} |
| Gap Coverage | {%} | {✅/⚠️/❌} |
| Clarification Coverage | {%} | {✅/⚠️/❌} |
| Forward Traceability | {%} | {✅/⚠️/❌} |
```

## Dependency Map

```markdown
## Requirement Dependency Map

### Dependency Graph (Mermaid)
\`\`\`mermaid
graph LR
    FR-001 --> FR-002
    FR-001 --> NFR-001
    FR-003 --> FR-001
\`\`\`

### Dependency Table
| Requirement | Depends On | Depended By | Depth | Risk |
|------------|------------|-------------|-------|------|
| FR-001 | — | FR-002, FR-003 | 0 | 🔴 High (hub) |

### Risk Heatmap
| Risk Level | Count | Requirements |
|------------|-------|-------------|
| 🔴 High (hub) | {N} | {IDs} |
| 🟡 Medium | {N} | {IDs} |
| 🟢 Low | {N} | {IDs} |
```

## Impact Analysis

```markdown
## Scope Change Impact Analysis

**Change:** {description}
**Type:** Add | Remove | Modify
**Date:** {date}

### Directly Affected
| Requirement | Current State | Proposed Change | Impact |
|------------|--------------|-----------------|--------|
| FR-{NNN} | {current} | {proposed} | {impact} |

### Cascade Effects
| Level | Requirement | Impact Type | Description |
|-------|------------|-------------|-------------|
| Direct | FR-{NNN} | Modified | {description} |
| Indirect | FR-{NNN} | Dependency affected | {description} |

### Effort Impact
| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| Total FRs | {N} | {N} | {±N} |
| Total SP (est.) | {N} | {N} | {±N} |
| Timeline Impact | — | — | {±N weeks} |

### Recommendation
{Accept | Reject | Accept with conditions} — {rationale}
```

## What-If Scenario Analysis

```markdown
## What-If Scenario Analysis

**Scenario:** {description}
**Date:** {date}

### Option Comparison
| Dimension | Option A: {name} | Option B: {name} | Option C: {name} |
|-----------|------------------|------------------|------------------|
| Scope Change | {description} | {description} | {description} |
| FRs Affected | {N} | {N} | {N} |
| NFRs Affected | {N} | {N} | {N} |
| SP Delta | {±N} | {±N} | {±N} |
| Timeline Delta | {±N weeks} | {±N weeks} | {±N weeks} |
| Risk Level | {High/Med/Low} | {High/Med/Low} | {High/Med/Low} |
| Key Trade-off | {trade-off} | {trade-off} | {trade-off} |

### Recommendation
**Preferred:** Option {X} — {rationale}
```

## Executive Summary

```markdown
# Requirements Executive Summary — {Project Name}

**Date:** {date}
**Status:** {✅ Ready | ⚠️ In Progress | ❌ Blocked}

## 1. Overview
{1-2 sentence project description}

## 2. Requirements Scorecard
| Area | Count | Status | Summary |
|------|-------|--------|---------|
| Functional Requirements | {N} | {status} | {summary} |
| Non-Functional Requirements | {N} | {status} | {summary} |
| Business Rules | {N} | {status} | {summary} |
| Gaps Identified | {N} | {status} | {summary} |
| Open Clarifications | {N} | {status} | {summary} |
| Quality Score | {N}/100 | {status} | {rating} |

## 3. Readiness Assessment
{✅ YES | ⚠️ PARTIAL | ❌ NO} — {rationale}

## 4. Key Risks
| # | Risk | Impact | Mitigation |
|---|------|--------|------------|

## 5. Next Steps
1. {action}
2. {action}
```

## Requirements Metrics Dashboard

```markdown
## Requirements Metrics Dashboard

**Generated:** {date}

### Completeness Metrics
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| FRs with User Stories | {%} | 100% | {✅/⚠️/❌} |
| FRs with Acceptance Criteria | {%} | 100% | {✅/⚠️/❌} |
| NFRs with Measurable Criteria | {%} | 100% | {✅/⚠️/❌} |
| Requirements with Source Link | {%} | 100% | {✅/⚠️/❌} |
| Requirements with Priority | {%} | 100% | {✅/⚠️/❌} |

### Process Metrics
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Approval Rate | {%} | >80% | {✅/⚠️/❌} |
| Gap Resolution Rate | {%} | 100% | {✅/⚠️/❌} |
| Clarification Resolution Rate | {%} | >90% | {✅/⚠️/❌} |
| Avg Time to Approve | {N}d | <7d | {✅/⚠️/❌} |

### Quality Score Trend
| Audit Date | Score | Rating | Delta |
|------------|-------|--------|-------|
| {date} | {N}/100 | {rating} | — |
```

## Requirement Lifecycle Status Model

```markdown
### Status Values
| Status | Emoji | Description |
|--------|-------|-------------|
| Draft | 📋 | Initial extraction, not yet reviewed |
| In Review | 👀 | Under stakeholder review |
| Approved | ✅ | Signed off, ready for planning |
| On Hold | ⏸️ | Waiting for clarification / deferred |
| Rejected | ❌ | Not in scope / declined |
| Changed | 🔄 | Modified after approval (re-review needed) |

### Transitions
📋 Draft → 👀 In Review → ✅ Approved → 🔄 Changed → 👀 In Review
📋 Draft → ⏸️ On Hold → 📋 Draft
👀 In Review → ❌ Rejected
```

## Help Reference

```markdown
## Requirement Analyst — Command Reference

| Command | Description |
|---------|-------------|
| `help` | Show this command reference |
| `validate` | Pre-flight checks — verify data sources and MCP tools |
| `status` | Show requirements health dashboard |
| `analyze {url}` | Analyze Confluence page and extract all requirements |
| `extract-nfr {url}` | Extract non-functional requirements |
| `summarize` | Generate requirements summary with readiness assessment |
| `show requirements` | Show all functional requirements |
| `show clarifications` | Show all clarifications |
| `show all` | Show both requirements and clarifications |
| `show {filter}` | Filter by priority, status, feature, etc. |
| `show {ID}` | View full details of a specific requirement or clarification |
| `add requirement` | Add a new requirement (guided or quick) |
| `add clarification for {ID}` | Add a clarification question |
| `update {ID}` | Update a requirement |
| `answer {CL-ID} {answer}` | Answer a clarification |
| `save` | Save changes and create a review request (PR) |
| `discard` | Cancel changes after an update |
| `gap-analysis` | Generate structured gap analysis with severity scoring |
| `traceability-matrix` | Generate full RTM |
| `dependency-map` | Visualize dependencies and risk heatmap |
| `impact {change}` | Analyze scope change impact |
| `what-if {scenario}` | Compare alternative scope options |
| `review` | Quality audit — score across 8 dimensions |
| `metrics` | Key metrics, completeness rates, readiness scores |
| `executive-summary` | 1-page leadership brief |
| `publish` | Publish to Confluence |
| `export` | Export for email/distribution |
| `report` | Regenerate all documentation |
| `run-all {url}` | Full pipeline end-to-end |

### Workflow
analyze {url} → extract-nfr → add requirements → gap-analysis →
review → traceability-matrix → summarize → executive-summary → publish
Or: `run-all {url}`

### Clarification Commands
| Command | Description |
|---------|-------------|
| `clr-init` | Initialize clarification tracking from all requirement sources |
| `clr-status` | Show clarification dashboard |
| `clr-resolve {CLR-ID} {answer}` | Record resolution for a clarification |
| `clr-bulk-resolve` | Resolve multiple CLRs from session notes |
| `clr-add {question}` | Add a new clarification manually |
| `clr-update {CLR-ID}` | Update status, priority, or stakeholder |
| `clr-escalate {CLR-ID}` | Escalate a stalled clarification |
| `clr-schedule` | Generate a session agenda |
| `clr-session-notes` | Record session outcomes |
| `clr-report` | Full clarification status report |
| `clr-impact {CLR-ID}` | Scope/timeline impact analysis |
| `clr-readiness` | Development readiness assessment |
| `clr-stakeholder-report` | Per-stakeholder accountability |
| `clr-aging` | Aging analysis of open items |
| `clr-metrics` | Quantitative health dashboard |
| `clr-sync-gaps` | Re-scan for new clarifications |
| `clr-export {format}` | Export as JSON or CSV |
| `clr-publish` | Publish tracker to Confluence |
| `clr-traceability` | Full CLR → GAP → FR/NFR chain |
| `clr-run-all` | Full pipeline: init → sync → report → readiness |

### Common Clarification Scenarios
| Scenario | Command |
|----------|---------|
| First time setup | `clr-init` |
| Before sprint planning | `clr-readiness` |
| Preparing for stakeholder meeting | `clr-schedule` |
| After stakeholder meeting | `clr-session-notes` then `clr-bulk-resolve` |
| Stakeholder not responding | `clr-escalate {CLR-ID}` |
| New requirements added | `clr-sync-gaps` |
| Project status review | `clr-report` |
| Which CLRs are stale? | `clr-aging` |
| How healthy is our CLR process? | `clr-metrics` |
```

---

# Clarification Tracking Templates

Use the appropriate template below when generating clarification output. Replace `{placeholders}` with actual values.

## Clarification Dashboard (clr-status)

```markdown
## Clarification Dashboard

**Last Updated:** {date}

### By Status
| Status | Count | % |
|--------|-------|---|
| 🔴 Open | {N} | {%} |
| 🟡 In Progress | {N} | {%} |
| 🟢 Resolved | {N} | {%} |
| ⚫ Blocked | {N} | {%} |
| ⏸️ Deferred | {N} | {%} |
| **Total** | **{N}** | **100%** |

### By Priority
| Priority | Total | Open | Resolved | % Resolved |
|----------|-------|------|----------|------------|
| P0 Critical | {N} | {N} | {N} | {%} |
| P1 High | {N} | {N} | {N} | {%} |
| P2 Medium | {N} | {N} | {N} | {%} |
| P3 Low | {N} | {N} | {N} | {%} |

### Blocking Development
{List of P0/P1 items still Open/In Progress}

### Stale Items (>7 days with no update)
{List with aging}

### Development Readiness
{✅ Ready / ⚠️ Partially ready / ❌ Not ready — with rationale}
```

## Resolution Record (clr-resolve)

```markdown
## CLR-{ID}: {Title}
**Status:** ✅ Resolved
**Resolved Date:** {date}
**Resolved By:** {stakeholder}
**Answer:** {decision}
**Decision Rationale:** {why this decision}
**Impacts:**
- Updated {FR-X} with {change description}
- Updated {NFR-Y} with {change description}
- Unblocked {N} tasks ({N} SP) in project plan
```

## Bulk Resolution Summary

```markdown
## Bulk Resolution Summary

| CLR ID | Title | Answer Summary | Requirements Updated |
|--------|-------|---------------|---------------------|
| CLR-{N} | {title} | {1-line answer} | {FR-N, NFR-N} |

**Total resolved:** {N}
**Story points unblocked:** {N} SP
**Next steps:** Run `@4-project-planning update-plan` to rebalance sprints
```

## Escalation Report

```markdown
## Escalation: CLR-{ID}

**Title:** {question}
**Open Since:** {date} ({N} days)
**Assigned To:** {stakeholder}
**Attempts:** {N} follow-ups sent

### Impact if Unresolved
- Blocks: {FR-X, FR-Y}
- Story Points blocked: {N} SP
- Sprints affected: Sprint {N} – Sprint {M}
- Schedule risk: {days of potential delay}

### Recommended Actions
1. {Action 1}
2. {Action 2}
3. {Action 3}

### Fallback: Proceed with Assumption
If not resolved by {deadline date}:
- Assume: {reasonable default}
- Technical debt: {what needs to be changed if assumption is wrong}
- Flag for review in Sprint {N}
```

## Session Agenda (clr-schedule)

```markdown
## Clarification Session Agenda

**Date:** {suggested date}
**Duration:** {estimated total time}

### Session 1: {Stakeholder Group} ({duration})
**Attendees:** {names/roles}

| # | CLR ID | Question | Priority | Est. Time |
|---|--------|----------|----------|-----------|
| 1 | CLR-{N} | {question summary} | P0 | {N} min |

**Background materials:**
- {Links to relevant FRs}
- {Links to gap analysis}
```

## Session Notes

```markdown
## Session Notes — {date}

**Attendees:** {names}
**Duration:** {time}

### Resolved ({N})
| CLR ID | Answer Summary | Decision By |
|--------|---------------|-------------|

### Partially Resolved ({N})
| CLR ID | Status | Follow-Up Action | Due |
|--------|--------|-----------------|-----|

### New Clarifications ({N})
| New CLR ID | Question | Priority | Stakeholder |
|------------|----------|----------|-------------|

### Deferred ({N})
| CLR ID | Reason | Next Review |
|--------|--------|-------------|
```

## Clarification Impact Analysis

```markdown
## Impact Analysis: CLR-{ID}

**Question:** {question text}
**Status:** {status}
**Open Since:** {date} ({N} days)

### Affected Requirements
| Requirement | Type | Impact | Current Status |
|------------|------|--------|----------------|

### Story Points Blocked
| Feature | Tasks Blocked | SP Blocked |
|---------|--------------|------------|

### Sprint Impact
- Earliest affected sprint: Sprint {N}
- Latest safe resolution date: {date}
- If resolved now: No schedule impact
- If resolved after {date}: {N}-week delay

### Possible Answers & Their Impact
| Scenario | Impact on Scope | Impact on Timeline | SP Delta |
|----------|----------------|-------------------|----------|

### Recommendation
{recommendation}
```

## Readiness Assessment

```markdown
## Development Readiness Assessment

**Date:** {date}

### Readiness Scorecard
| Dimension | Score | Status | Details |
|-----------|-------|--------|---------|
| P0 Clarifications Resolved | {N}/{M} | {✅/⚠️/❌} | {detail} |
| P1 Clarifications Resolved | {N}/{M} | {✅/⚠️/❌} | {detail} |
| Requirements Updated | {N}/{M} | {✅/⚠️/❌} | {detail} |
| External Dependencies Clear | {N}/{M} | {✅/⚠️/❌} | {detail} |
| Architecture Decisions Resolved | {N}/{M} | {✅/⚠️/❌} | {detail} |
| **Overall Readiness** | **{%}** | **{status}** | |

### Sprint-by-Sprint Readiness
| Sprint | Required CLRs | Resolved | Ready? |
|--------|--------------|----------|--------|

### Can We Start Development?
{✅ YES / ⚠️ PARTIAL / ❌ NO — with rationale}
```

## Stakeholder Report

```markdown
## Stakeholder Clarification Report

**Generated:** {date}

| Stakeholder | Assigned | Resolved | Pending | Avg Response Time | Oldest Open |
|------------|----------|----------|---------|-------------------|-------------|

### Pending by Stakeholder
#### {Stakeholder Name} ({N} pending)
| CLR ID | Question | Priority | Age | Impact |
|--------|----------|----------|-----|--------|
```

## Aging Analysis

```markdown
## Clarification Aging Analysis

**Date:** {date}

### Aging Buckets
| Age | Count | CLR IDs | Risk |
|-----|-------|---------|------|
| 0–3 days (Fresh) | {N} | {IDs} | 🟢 Normal |
| 4–7 days | {N} | {IDs} | 🟡 Monitor |
| 8–14 days | {N} | {IDs} | 🟠 Follow up |
| 15–30 days | {N} | {IDs} | 🔴 Escalate |
| 30+ days (Stale) | {N} | {IDs} | ⚫ Critical |
```

## Clarification Metrics Dashboard

```markdown
## Clarification Metrics Dashboard

**Generated:** {date}

### Key Metrics
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Total CLRs | {N} | — | — |
| Resolution Rate | {%} | > 80% | {✅/⚠️/❌} |
| P0 Resolution Rate | {%} | 100% | {✅/⚠️/❌} |
| Avg Time to Resolve (P0) | {N}d | < 5d | {✅/⚠️/❌} |
| Open > 14 days | {N} | 0 | {✅/⚠️/❌} |
| Story Points Blocked | {N} SP | 0 SP | {✅/⚠️/❌} |

### Process Health Score
| Dimension | Weight | Score | Weighted |
|-----------|--------|-------|----------|
| Resolution Rate | 25% | {0–100} | {N} |
| P0/P1 Timeliness | 30% | {0–100} | {N} |
| No Stale Items | 20% | {0–100} | {N} |
| Requirement Updates Done | 15% | {0–100} | {N} |
| Stakeholder Responsiveness | 10% | {0–100} | {N} |
| **Overall Health** | **100%** | — | **{N}/100** |
```

## Gap Sync Report

```markdown
## Gap-to-Clarification Sync Report

### New Gaps Without CLRs ({N} found)
| Gap ID | Issue | Suggested CLR Priority | Suggested Stakeholder |
|--------|-------|----------------------|----------------------|

### Resolved CLRs Not Reflected in Requirements ({N} found)
| CLR ID | Resolved Date | Requirements to Update |
|--------|--------------|----------------------|

### Orphaned CLRs (No linked GAP) ({N} found)
| CLR ID | Title | Status | Notes |
|--------|-------|--------|-------|

Proceed with actions? (yes/no)
```

## Clarification Traceability Matrix

```markdown
## Clarification Traceability Matrix

| CLR ID | GAP ID | Requirements | Features | Tasks | SP | Sprint | Status |
|--------|--------|-------------|----------|-------|-----|--------|--------|
```

## Clarification Run-All Summary

```markdown
## Clarification Pipeline Complete ✅

| Step | Status | Output |
|------|--------|--------|
| Init | ✅ Complete | {N} CLRs tracked |
| Sync Gaps | ✅ Complete | {N} new, {N} orphaned |
| Report | ✅ Generated | {N}% resolved |
| Readiness | ✅/{⚠️}/{❌} | {assessment} |

### Next Steps
1. Schedule sessions: `@3-requirement-analyst clr-schedule`
2. Resolve items: `@3-requirement-analyst clr-resolve {CLR-ID}`
3. Check impact: `@3-requirement-analyst clr-impact {CLR-ID}`
4. View bottlenecks: `@3-requirement-analyst clr-stakeholder-report`
```
