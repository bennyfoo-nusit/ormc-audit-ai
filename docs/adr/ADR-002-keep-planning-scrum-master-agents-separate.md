# ADR-002: Keep Project Planning and Product Owner Separate

**Status:** Accepted  
**Date:** 2026-04-07  
**Decision Makers:** Framework maintainers  
**Supersedes:** N/A  
**Related:** [ADR-001 — Merge Requirements + Clarification Agent](ADR-001-merge-requirements-clarification-agent.md)

## Context

Following the successful merge of `@clarification-agent` into `@3-requirement-analyst` (ADR-001), a feasibility analysis was conducted to evaluate whether `@4-project-planning` and `@5-product-owner` should also be merged.

- **`@4-project-planning`** — Creates and maintains comprehensive project plans: timeline-driven planning, task decomposition, effort estimation, sprint planning, risk management, critical path analysis, burndown forecasting, and what-if scenario analysis. Produces `/docs/plan/project-plan.md`.
- **`@5-product-owner`** — Creates Azure DevOps work items, GitHub Issues, configures iterations, manages story grooming, publishes refined stories to ADO Wiki, performs bidirectional sync from Azure DevOps, and audits backlog health. Operates on external systems (Azure DevOps, GitHub).

### Analysis Summary

| Criterion | Score | Evidence |
|-----------|-------|----------|
| Data Sharing | Low | One-directional — planning writes `project-plan.md`, scrum-master reads it. No bidirectional data flow. |
| Workflow Coupling | Low | Strict sequence: planning finishes before scrum-master starts. Never run concurrently on same data. |
| Shared Mutable State | None | No shared data store. Scrum-master only reads the plan as input. |
| Template Overlap | None | Completely separate domains — calculation formulas vs. HTML story templates and ADO field mappings. |
| Command Overlap | Minimal | Both have `status` and `impact` commands with entirely different semantics (plan health vs. backlog health). |
| Tool Overlap | Minimal | Share basic `[read, edit, search]`. Scrum-master has 20+ exclusive Azure DevOps MCP and GitHub API tools. |
| User Friction | Low | Clean sequential handoff: `@4-project-planning create-plan` → `@5-product-owner create-stories`. |

**Overall Coupling Score: 1/5 (Loosely Coupled)**

### Comparison with ADR-001 Merge

| Merge Criteria | Req + Clarification (merged — ADR-001) | Planning + Product Owner (this ADR) |
|---------------|-----|-----|
| Coupling Score | 5/5 (Tight) | 1/5 (Loose) |
| Shared Data Store | Yes — same `/docs/requirements/` | No — one-directional read |
| Template Overlap | 40%+ | 0% |
| Tool Overlap | 90%+ | ~20% |
| User Friction | High — constant context-switching | Low — clean sequential handoff |
| Combined Size Risk | Manageable (~180 lines) | Problematic (~570+ lines) |
| External API Complexity | None | High — 20+ MCP tools exclusive to scrum-master |

## Decision

**Keep `@4-project-planning` and `@5-product-owner` as separate agents.**

The agents have a clean **producer/consumer** relationship — planning produces the plan, scrum-master consumes it to create work items. This is fundamentally different from the tight bidirectional coupling that justified ADR-001.

## Rationale

### Why Merging Was Rejected

1. **No meaningful coupling:** Unlike requirements/clarification which shared the same data store with bidirectional writes, planning and scrum-master have a one-directional data flow. The plan is written once and read by scrum-master — no contention, no sync issues.

2. **Incompatible tool profiles:** Planning agent uses only basic file tools (`read, edit, search, agent, todo`). Scrum-master agent requires 20+ Azure DevOps MCP tools (`mcp_microsoft_azu_wit_*`, `mcp_microsoft_azu_work_*`, `mcp_microsoft_azu_wiki_*`) and GitHub API tools (`mcp_io_github_git_*`). Merging would inject a large, irrelevant tool surface into planning contexts, increasing the risk of tool misrouting.

3. **Token budget concerns:** The combined agent definition would be ~570+ lines — the largest agent in the framework by far. Adding both skill files (`planning-templates` + `scrum-master-templates`) would strain context window limits during operation.

4. **Separation of concerns:** "What to build and when" (planning) vs. "Create the work items in external systems" (scrum-master) are fundamentally different domains with different failure modes. ADO API failures should not disrupt planning workflows.

5. **Clean handoff already exists:** The current delegation pattern (`@4-project-planning` → `@5-product-owner create-stories`) is explicit, well-documented, and mirrors how real Scrum teams operate — the planning phase completes before work item creation begins.

6. **Low user friction:** Users do not context-switch between these agents during a single task. Each agent is invoked at a distinct phase of the SDLC workflow.

### Recommended Improvement Instead

Add `handoffs: [5-product-owner]` to the 4-project-planning frontmatter to formalize the delegation path without merging.

## Consequences

### Positive
- **Preserved modularity:** Each agent maintains a focused, testable responsibility boundary
- **Manageable context size:** Neither agent exceeds practical token limits
- **Isolated failure domains:** Azure DevOps API issues remain contained to 5-product-owner
- **Clear mental model:** Users think of "planning" and "work item creation" as distinct activities — the architecture matches this

### Negative
- **Sequential invocation required:** Users must invoke two agents in sequence (mitigated by well-documented workflow and `run-all` pipelines)

### Neutral
- Agent count remains at 8
- No files modified — analysis only

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| Full merge into single "project-agent" | Token bloat (~570+ lines), tool confusion (20+ irrelevant MCP tools in planning context), violates separation of concerns |
| Merge planning into scrum-master | Planning is the upstream producer — would invert the natural dependency direction |
| Merge scrum-master into planning | Contaminates analytical planning agent with external API complexity and failure modes |
| Create wrapper agent that orchestrates both | Adds a third agent instead of reducing count — increases complexity without benefit |

## References

- [ADR-001 — Merge Requirements + Clarification Agent](ADR-001-merge-requirements-clarification-agent.md) — Prior successful merge for comparison
- [Project Planning](../../.github/agents/4-project-planning.agent.md) — Agent definition
- [Product Owner](../../.github/agents/5-product-owner.agent.md) — Agent definition
- [Planning Templates Skill](../../.github/skills/planning-templates/SKILL.md) — Planning output templates
- [Product Owner Templates Skill](../../.github/skills/scrum-master-templates/SKILL.md) — Work item output templates
