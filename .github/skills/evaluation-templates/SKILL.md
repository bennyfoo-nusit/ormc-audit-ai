---
name: evaluation-templates
description: "Report output templates for the evaluation agent. Use when generating audit reports, scorecards, executive summaries, optimization plans, comparison reports, and other evaluation outputs."
---

# Evaluation Report Templates

Use the appropriate template below when generating evaluation output. Replace `{placeholders}` with actual values.

## Agent Definition Scorecard

```markdown
## Agent Definition Scorecard

| Agent | Completeness | Clarity | Tool Scoping | Boundaries | Discoverability | Error Handling | Feature Adoption | Consistency | Overall |
|-------|-------------|---------|-------------|-----------|----------------|---------------|-----------------|-------------|---------|
| @{name} | {N}% | {N}% | {N}% | {N}% | {N}% | {N}% | {N}% | {N}% | **{N}%** |

### Framework Average: {N}% — {Excellent / Good / Needs Improvement / Poor}

### Findings (Prioritized)

| # | Agent | Finding | Severity | Recommendation |
|---|-------|---------|----------|----------------|
| 1 | @{name} | {finding} | {severity} | {recommendation} |
```

## Copilot Feature Adoption Report

```markdown
## Copilot Feature Adoption Report

### Framework-Level Primitives
| Primitive | Status | Count | Recommendation |
|-----------|--------|-------|----------------|
| Custom Agents | ✅/❌ | {N} | {recommendation} |
| Skills | ✅/❌ | {N} | {recommendation} |
| Hooks | ✅/❌ | {N} | {recommendation} |
| File Instructions | ✅/❌ | {N} | {recommendation} |
| Prompt Templates | ✅/❌ | {N} | {recommendation} |
| Workspace Instructions | ✅/❌ | — | {recommendation} |

### Per-Agent Feature Adoption
| Agent | Sub-agents | Model Config | Handoffs | Arg Hint | Invocation Control | Tool Hygiene | Score |
|-------|-----------|-------------|---------|----------|-------------------|-------------|-------|
| @{name} | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | Default/Set | ✅/⚠️/❌ | {N}% |

### Recommended Primitives to Create
| Type | Name | Purpose | Used By |
|------|------|---------|---------|
| Skill | {name} | {purpose} | {agents} |
| Hook | {event} | {purpose} | {enforcement} |
| Instruction | {pattern} | {purpose} | {focus} |

### Overall Feature Adoption Score: {N}% — {rating}
```

## Token & Context Efficiency Report

```markdown
## Token & Context Efficiency Report

### Per-Agent Token Breakdown
| Agent | Body Tokens | Description Tokens | Tool Count | Tool Overhead | Total Overhead | Rating |
|-------|------------|-------------------|-----------|--------------|---------------|--------|
| @{name} | {N} | {N} | {N} | ~{N} | ~{N} | 🟢/🟡/🔴 |

### Framework-Level Token Analysis
| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| Total framework footprint | {N} tokens | < 50,000 | 🟢/🟡/🔴 |
| Largest agent | @{name} ({N} tokens) | < 2× average | 🟢/🟡/🔴 |
| Smallest agent | @{name} ({N} tokens) | > 500 tokens | 🟢/🟡/🔴 |
| Average agent size | {N} tokens | — | Baseline |
| Always-on overhead | {N} tokens | < 1,500 | 🟢/🟡/🔴 |

### Duplication Findings
| # | Content Pattern | Found In | Estimated Waste | Recommendation |
|---|----------------|----------|-----------------|----------------|

### Overall Token Efficiency Score: {N}% — {rating}
```

## Requirements Audit (IEEE 830 + INVEST)

```markdown
## Requirements Quality — IEEE 830 Compliance

| Criterion | Score | Details |
|-----------|-------|---------|
| Correctness | {0–100%} | {N}/{M} FRs verified against source |
| Unambiguity | {0–100%} | {N} ambiguous terms found |
| Completeness | {0–100%} | {N}/{M} FRs have full acceptance criteria |
| Consistency | {0–100%} | {N} contradictions detected |
| Verifiability | {0–100%} | {N}/{M} acceptance criteria are testable |
| Modifiability | {0–100%} | Structured format, unique IDs, cross-references |
| Traceability | {0–100%} | {N}/{M} FRs linked to source documents |
| Rankability | {0–100%} | {N}/{M} FRs have priority assigned |
| **Overall IEEE 830 Score** | **{avg}%** | **{Compliant / Partially / Non-Compliant}** |

## User Story Quality — INVEST Criteria

| Criterion | Score | Issues Found |
|-----------|-------|-------------|
| Independent | {0–100%} | {N} stories tightly coupled |
| Negotiable | {0–100%} | {N} stories over-specified |
| Valuable | {0–100%} | {N} stories missing business value |
| Estimable | {0–100%} | {N} stories too vague to estimate |
| Small | {0–100%} | {N} stories appear too large |
| Testable | {0–100%} | {N} stories missing testable acceptance criteria |
```

## Plan Audit (PMBOK)

```markdown
## Project Plan Quality — PMBOK Compliance

| Knowledge Area | Score | Details |
|---------------|-------|---------|
| Scope Management | {0–100%} | WBS present, deliverables defined |
| Schedule Management | {0–100%} | Timeline, milestones, dependencies |
| Risk Management | {0–100%} | Risk register, probability/impact matrix |
| Resource Management | {0–100%} | Roles defined, allocation planned |
| Quality Management | {0–100%} | Quality gates, acceptance criteria |
| Communication Management | {0–100%} | Stakeholder communication plan |
| **Overall PMBOK Score** | **{avg}%** | **{Strong / Adequate / Weak}** |
```

## Pipeline Coverage Report

```markdown
## SDLC Pipeline Coverage

### Phase Coverage
| SDLC Phase | Agent | Status | Gap |
|-----------|-------|--------|-----|
| {phase} | @{agent} | ✅ Covered / ❌ Gap | {description or —} |

### Handoff Integrity
| From → To | Output Match | File Path Match | Data Loss Risk |
|-----------|-------------|----------------|----------------|
| {from} → {to} | ✅/⚠️/❌ | ✅/❌ | Low/Medium/High |

### Recommendations
1. **[{severity}]** {gap or weakness} — {recommendation}
```

## Consolidated Report (audit all)

```markdown
## Framework Evaluation Report

**Date:** {date}
**Evaluated By:** Evaluation Agent
**Framework Version:** AI-Assisted SDLC Framework

### Executive Summary
| Area | Score | Standard | Rating |
|------|-------|----------|--------|
| Agent Definitions | {N}% | Best Practices | {rating} |
| Copilot Feature Adoption | {N}% | VS Code Copilot Primitives | {rating} |
| Token Efficiency | {N}% | Context Window Optimization | {rating} |
| Requirements Quality | {N}% | IEEE 830 + INVEST | {rating} |
| Planning Quality | {N}% | PMBOK | {rating} |
| Pipeline Coverage | {N}% | SDLC Completeness | {rating} |
| Handoff Integrity | {N}% | Data Flow Analysis | {rating} |
| **Overall** | **{N}%** | **Composite** | **{rating}** |

### Framework Maturity Level
**Level {1–5}: {Name}** — {description}

### Top 5 Improvement Actions
| # | Action | Impact | Effort | Priority |
|---|--------|--------|--------|----------|
```

## Optimization Plan

```markdown
## Optimization Plan for @{agent-name}

### Proposed Changes
| # | Category | Current | Proposed | Reason |
|---|----------|---------|----------|--------|
| 1 | {category} | {current} | {proposed} | {reason} |

### Impact Summary
- **Token change:** {current} → {projected} tokens ({+/-N})
- **Estimated score improvement:** {current}% → {projected}%
- **Files modified:** {list}
- **Files created:** {list or "None"}

**Proceed with optimization? (yes/no)**
```

## Optimization Results

```markdown
## Optimization Applied — @{agent-name}

| Change | Status |
|--------|--------|
| {change} | ✅ Applied / ⏭️ Skipped |

### Before / After
| Metric | Before | After |
|--------|--------|-------|
| Token footprint | {N} | {N} |
| Tool count | {N} | {N} |
| Audit score | {N}% | {N}% |
| Feature adoption | {N}% | {N}% |
```

## Batch Optimization

```markdown
## Batch Optimization Plan

### Agents Ordered by Priority
| # | Agent | Current Score | Issues | Proposed Changes | Projected Score |
|---|-------|-------------|--------|-----------------|----------------|

**Proceed with all optimizations? (yes/no/select specific agents)**

---

## Batch Optimization Complete

| Agent | Before | After | Changes Applied |
|-------|--------|-------|----------------|

**Framework Average:** {before}% → {after}%
```

## Validation Report

```markdown
## Evaluation Pre-Flight Validation

| Check | Status | Details |
|-------|--------|---------|
| Agent definitions | ✅/❌ | {N} agents in `/.github/agents/` |
| Workspace instructions | ✅/❌ | copilot-instructions.md {found/missing} |
| Requirements artifacts | ✅/❌ | {N} files in `/docs/requirements/` |
| Planning artifacts | ✅/❌ | {N} files in `/docs/plan/` |
| Design artifacts | ✅/❌ | {N} files in `/docs/design/` |
| Skills directory | ✅/⚠️ | {N} skills found (optional) |
| Hooks directory | ✅/⚠️ | {N} hooks found (optional) |
| Instructions directory | ✅/⚠️ | {N} instruction files (optional) |
| Prompts directory | ✅/⚠️ | {N} prompts found (optional) |

**Overall: ✅ Ready / ⚠️ Partial data / ❌ Missing critical data**
```

## Status Dashboard

```markdown
## Evaluation Status Dashboard

**Last Full Audit:** {date or "Never"}
**Reports Generated:** {N} of 9

### Current Scores
| Area | Score | Rating | Last Audited |
|------|-------|--------|-------------|
| {area} | {N}% | {rating} | {date} |

### Pending Actions
| # | Action | Priority | From Audit | Status |
|---|--------|----------|-----------|--------|

### Optimization History
| Date | Agent | Changes | Score Impact |
|------|-------|---------|-------------|

### Recommended Next Step
{suggestion based on stale or never-audited areas}
```

## Quality Scorecard

```markdown
## SDLC Framework Quality Scorecard

**Date:** {date}
**Overall Health:** 🟢 Healthy / 🟡 Needs Attention / 🔴 At Risk

| Dimension | Score | Trend | Standard |
|-----------|-------|-------|----------|
| Agent Quality | {N}% | ↑↓→ | Best Practices |
| Copilot Features | {N}% | ↑↓→ | VS Code Copilot Primitives |
| Token Efficiency | {N}% | ↑↓→ | Context Window Optimization |
| Requirements | {N}% | ↑↓→ | IEEE 830 |
| Planning | {N}% | ↑↓→ | PMBOK |
| Pipeline Coverage | {N}% | ↑↓→ | SDLC |
| Handoff Integrity | {N}% | ↑↓→ | Data Flow |
| Maturity Level | {1–5} | ↑↓→ | CMMI |

**Top Action Item:** {action}
```

## Executive Summary

```markdown
## SDLC Framework — Executive Quality Summary

**Date:** {date}
**Prepared By:** Evaluation Agent
**Overall Health:** 🟢/🟡/🔴
**Framework Score:** {N}% ({rating})
**Maturity Level:** {1–5} — {name}

### Key Metrics
| Metric | Value |
|--------|-------|
| Total agents | {N} |
| Agents meeting quality bar (≥ 80%) | {N}/{M} |
| SDLC phase coverage | {N}/12 phases |
| Open critical/high issues | {N} |
| Optimizations applied to date | {N} |

### Top 3 Strengths
1. {strength with evidence}
2. {strength with evidence}
3. {strength with evidence}

### Top 3 Risks
1. 🔴 {risk} — **Impact:** {impact} — **Mitigation:** {mitigation}
2. 🟡 {risk} — **Impact:** {impact} — **Mitigation:** {mitigation}
3. 🟡 {risk} — **Impact:** {impact} — **Mitigation:** {mitigation}

### Recommended Actions (Next Sprint)
| Priority | Action | Owner | Effort |
|----------|--------|-------|--------|

### Progress Since Last Review
{1–2 sentence summary}
```

## Metrics Dashboard

```markdown
## Evaluation Metrics Dashboard

### Key Performance Indicators
| KPI | Value | Target | Status |
|-----|-------|--------|--------|
| Framework overall score | {N}% | ≥ 80% | 🟢/🟡/🔴 |
| Agents scoring ≥ 80% | {N}/{M} | 100% | 🟢/🟡/🔴 |
| Agents with empty tools | {N} | 0 | 🟢/🟡/🔴 |
| Open critical findings | {N} | 0 | 🟢/🟡/🔴 |
| SDLC phases covered | {N}/12 | 12/12 | 🟢/🟡/🔴 |
| Maturity level | {1–5} | ≥ 3 | 🟢/🟡/🔴 |
| Total framework tokens | {N} | < 50,000 | 🟢/🟡/🔴 |
| Avg agent token size | {N} | < 2,000 | 🟢/🟡/🔴 |

### Score Distribution
| Rating | Count | Agents |
|--------|-------|--------|
| Excellent (90–100%) | {N} | {list} |
| Good (75–89%) | {N} | {list} |
| Needs Improvement (60–74%) | {N} | {list} |
| Poor (40–59%) | {N} | {list} |
| Critical (0–39%) | {N} | {list} |

### Trend Analysis
| Dimension | Previous | Current | Trend | Delta |
|-----------|----------|---------|-------|-------|

### Optimization ROI
| Metric | Value |
|--------|-------|
| Total optimizations applied | {N} |
| Agents optimized | {N}/{M} |
| Avg score improvement | +{N}% |
| Total tokens saved | ~{N} |
```

## Comparison Report

```markdown
## Evaluation Comparison Report

**Comparing:** {previous date} → {current date}

### Score Changes
| Area | Previous | Current | Delta | Trend |
|------|----------|---------|-------|-------|

### Per-Agent Changes
| Agent | Previous | Current | Delta | Notable Change |
|-------|----------|---------|-------|---------------|

### Findings Resolved
| # | Agent | Finding | Severity | Resolution |
|---|-------|---------|----------|-----------|

### New Findings
| # | Agent | Finding | Severity | Recommendation |
|---|-------|---------|----------|----------------|

### Regressions
| Agent | Area | Previous | Current | Likely Cause |
|-------|------|----------|---------|-------------|
```

## Maturity Assessment

```markdown
## Framework Maturity Assessment

### Current Level: {1–5} — {Name}

| Level | Name | Status | Evidence |
|-------|------|--------|----------|
| 1 | Initial | ✅/❌ | {evidence} |
| 2 | Managed | ✅/❌ | {evidence} |
| 3 | Defined | ✅/❌ | {evidence} |
| 4 | Quantitative | ✅/❌ | {evidence} |
| 5 | Optimizing | ✅/❌ | {evidence} |

### To Reach Next Level
{specific actions needed}
```

## Run-All Pipeline Results

```markdown
## Full Evaluation Pipeline Complete

| Step | Status | Key Result |
|------|--------|-----------|
| Validate | ✅ | {N} data sources verified |
| Audit All | ✅ | Overall: {N}% ({rating}) |
| Report | ✅ | {N} reports generated |
| Scorecard | ✅ | Health: 🟢/🟡/🔴 |
| Executive Summary | ✅ | Saved to `/docs/evaluation/` |
| Metrics | ✅ | KPIs updated |

### Quick View
| Dimension | Score |
|-----------|-------|
| Agent Quality | {N}% |
| Copilot Features | {N}% |
| Token Efficiency | {N}% |
| Requirements | {N}% |
| Planning | {N}% |
| Pipeline | {N}% |
| Maturity | Level {1–5} |
| **Overall** | **{N}%** |

**Top Action:** {action}
**All reports:** `/docs/evaluation/`
```

## Help Reference

```markdown
## Evaluation Agent — Command Reference

| Command | Description |
|---------|-------------|
| `help` | Show this command reference |
| `validate` | Pre-flight checks |
| `status` | Evaluation dashboard |
| `audit agents` | Agent definitions quality |
| `audit features` | Copilot feature adoption |
| `audit tokens` | Token usage efficiency |
| `audit requirements` | IEEE 830 + INVEST compliance |
| `audit plan` | PMBOK compliance |
| `audit pipeline` | SDLC coverage + handoffs |
| `audit all` | All audits consolidated |
| `optimize <agent>` | Optimize specific agent |
| `optimize all` | Optimize all agents |
| `optimize tokens` | Token efficiency optimization |
| `optimize features` | Feature adoption optimization |
| `maturity` | CMMI-inspired assessment |
| `scorecard` | Quality scorecard |
| `metrics` | KPIs + trends |
| `compare` | Diff vs previous audit |
| `executive-summary` | Stakeholder brief |
| `report` | Regenerate all reports |
| `publish` | Publish to Confluence |
| `export` | Export standalone markdown |
| `run-all` | Full pipeline end-to-end |

### Common Scenarios
| Scenario | Command |
|----------|---------|
| First-time health check | `audit all` |
| After adding a new agent | `audit agents` |
| Check Copilot feature usage | `audit features` |
| Check token bloat | `audit tokens` |
| Fix a specific agent | `optimize <agent>` |
| Fix all agents | `optimize all` |
| Reduce token usage | `optimize tokens` |
| Add missing features | `optimize features` |
| Before handing off requirements | `audit requirements` |
| Stakeholder report | `scorecard` or `executive-summary` |
| Track improvement over time | `compare` or `metrics` |
```
