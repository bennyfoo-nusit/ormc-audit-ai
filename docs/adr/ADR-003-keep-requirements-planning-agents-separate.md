# ADR-003: Keep Requirement Analyst and Project Planning Separate

**Status:** Accepted  
**Date:** 2026-04-07  
**Decision Makers:** Framework maintainers  
**Supersedes:** N/A  
**Related:** [ADR-001 — Merge Requirements + Clarification Agent](ADR-001-merge-requirements-clarification-agent.md), [ADR-002 — Keep Planning + Product Owner Separate](ADR-002-keep-planning-5-product-owners-separate.md)

## Context

Following the successful merge of `@clarification-agent` into `@3-requirement-analyst` (ADR-001), a feasibility analysis was conducted to evaluate whether `@3-requirement-analyst` and `@4-project-planning` should also be merged.

- **`@3-requirement-analyst`** — Extracts requirements from Confluence, transforms into structured formats, manages clarifications, performs gap analysis, quality auditing, traceability, and readiness assessment. Already the largest agent in the framework (185 lines, 49 commands) after absorbing clarification capabilities.
- **`@4-project-planning`** — Transforms validated requirements into project plans: timeline-driven planning, task decomposition, effort estimation, sprint planning, risk management, critical path analysis, burndown forecasting, and release strategy. 170 lines, 17 commands.

### Analysis Summary

| Criterion | Score | Evidence |
|-----------|-------|----------|
| Data Sharing | Low | One-directional — requirements writes `/docs/requirements/`, planning reads it. Only minor reverse read: requirements reads `project-plan.md` for CLR timeline impact. |
| Workflow Coupling | Low | Strict sequence: requirements finishes and passes quality gate before planning starts. Never concurrent. |
| Shared Mutable State | Minimal | No bidirectional writes to shared files. |
| Template Overlap | None | Completely different domains — FR/NFR/CLR templates vs. sprint/milestone/burndown templates. |
| Command Overlap | Some | 7 overlapping command names (`impact`, `what-if`, `executive-summary`, `status`, `validate`, `dependency-map`, `run-all`) with different semantics. |
| Tool Overlap | Low | Planning uses 5 basic tools. Requirements uses 28. No unique tools gained from merging. |
| User Friction | Low | Clean sequential handoff via `handoffs: [4-project-planning]` in frontmatter. |

**Overall Coupling Score: 2/5 (Loosely Coupled)**

### Comparison with Previous Decisions

| Criteria | Req + Clarification (merged) | Planning + Product Owner (kept separate) | **Req + Planning (this)** |
|----------|-----|-----|-----|
| Coupling Score | 5/5 | 1/5 | **2/5** |
| Shared Data Store | Yes | No | **No** |
| Template Overlap | 40%+ | 0% | **0%** |
| User Friction | High | Low | **Low** |
| Combined Size | ~180 lines | ~570+ lines | **~355 lines, 66 commands** |
| Bidirectional Data | Yes | No | **Minimal** |

## Decision

**Keep `@3-requirement-analyst` and `@4-project-planning` as separate agents.**

The agents represent two distinct SDLC phases ("what to build" vs. "when/how to build it") with different stakeholders, different data stores, and a clean sequential handoff. Merging would create a 355-line, 66-command mega-agent that exceeds practical limits.

## Rationale

### Why Merging Was Rejected

1. **Requirements agent is already at capacity:** At 185 lines and 49 commands (post-clarification merge), it is the largest agent in the framework. Adding 170 more lines and 17 more commands would push it well beyond practical context limits.

2. **Command name collisions:** Seven commands share names between agents (`impact`, `what-if`, `executive-summary`, `status`, `validate`, `dependency-map`, `run-all`) but have entirely different semantics. Merging would require prefixing (e.g., `plan-impact` vs `req-impact`), adding complexity without benefit.

3. **Dual skill file loading:** The merged agent would need to load both `requirements-templates` (~850 lines) and `planning-templates` (~400 lines) — over 1,250 lines of templates that risk exceeding context window limits during operation.

4. **Different stakeholders:** Business Analysts use requirements commands. Project Managers use planning commands. Merging would force both roles into one monolithic agent with 66 commands, increasing cognitive load.

5. **Quality gate is a feature, not a bug:** The explicit boundary between requirements and planning (quality gate: audit score >= 70%, P0 CLRs resolved, traceability matrix generated) enforces process discipline. Merging would internalize this gate, making it harder to enforce.

6. **No meaningful coupling:** Unlike requirements/clarification which shared the same data store with bidirectional writes, requirements and planning have separate data directories (`/docs/requirements/` vs `/docs/plan/`) with one-directional data flow.

7. **Handoff already formalized:** The 3-requirement-analyst frontmatter already declares `handoffs: [4-project-planning]`, providing seamless delegation without merging.

### Recommended Improvement Instead

No changes needed — the existing `handoffs: [4-project-planning]` mechanism already provides the integration point. If tighter workflow chaining is desired, a lightweight orchestration command (e.g., `@3-requirement-analyst handoff-to-planning`) could be added without merging the agents.

## Consequences

### Positive
- **Requirements agent stays manageable:** 185 lines and 49 commands — already near practical ceiling
- **No command collisions:** Each agent owns its command namespace cleanly
- **Preserved quality gate:** Explicit requirements-to-planning boundary enforces process
- **Separate skill files:** Each agent loads only the templates it needs
- **Role clarity:** BAs and PMs work with focused, purpose-built agents

### Negative
- **Sequential invocation required:** Users must invoke two agents in sequence (mitigated by well-documented workflow and `handoffs` mechanism)

### Neutral
- Agent count remains at 8
- No files modified — analysis only

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| Full merge into single "project-lifecycle-agent" | 355 lines, 66 commands, 7 command collisions, 2 large skill files — exceeds all practical limits |
| Merge planning into requirements | Planning is the downstream consumer — would invert the natural dependency and bloat requirements further |
| Merge requirements into planning | Requirements is the upstream producer — would contaminate planning with Confluence extraction, clarification management, and 49 commands |
| Add orchestration wrapper | Adds a third agent instead of simplifying — the existing `handoffs` mechanism already solves this |

## References

- [ADR-001 — Merge Requirements + Clarification Agent](ADR-001-merge-requirements-clarification-agent.md) — Prior successful merge for comparison
- [ADR-002 — Keep Planning + Product Owner Separate](ADR-002-keep-planning-5-product-owners-separate.md) — Related "keep separate" decision
- [Requirement Analyst](../../.github/agents/3-requirement-analyst.agent.md) — Agent definition (185 lines, 49 commands)
- [Project Planning](../../.github/agents/4-project-planning.agent.md) — Agent definition (170 lines, 17 commands)
- [Requirements Templates Skill](../../.github/skills/requirements-templates/SKILL.md) — ~850 lines of templates
- [Planning Templates Skill](../../.github/skills/planning-templates/SKILL.md) — ~400 lines of templates
