# ADR-001: Merge Clarification Agent into Requirement Analyst

**Status:** Accepted  
**Date:** 2026-04-07  
**Decision Makers:** Framework maintainers  
**Supersedes:** N/A

## Context

The AI-assisted SDLC framework had two separate agents handling related concerns:

- **`@3-requirement-analyst`** — Extracted requirements from Confluence, transformed them into structured formats, generated gap analysis and clarification questions, and managed the requirements lifecycle.
- **`@clarification-agent`** — Tracked clarification questions, managed stakeholder sessions, recorded resolutions, and assessed development readiness.

These agents exhibited several problems:

1. **Tight coupling:** Both read and wrote the same data sources (`clarifications.md`, `gap-analysis.md`, FR/NFR documents). Clarification agent could not operate without requirements agent output, and resolutions flowed back into requirements.
2. **Duplicate capabilities:** Requirements agent already had "Clarification Generation" (capability 4) and `answer {CL-ID}` / `show clarifications` commands. Clarification agent duplicated impact analysis functionality.
3. **Inconsistent ID schemes:** Requirements agent used `CL-NNN` for clarification IDs while clarification agent used `CLR-NNN`, causing confusion.
4. **User friction:** Users had to context-switch between agents mid-workflow (`@3-requirement-analyst analyze` → `@clarification-agent init`) for what is conceptually one continuous process.
5. **Token overhead:** Two separate agent definitions + two separate skill files consumed unnecessary context window budget.

## Decision

Merge the clarification agent into the requirements agent as a "Clarification Management" command group, prefixed with `clr-`.

### Specifically:
- Absorb all clarification capabilities (tracking, stakeholder management, resolution, escalation, readiness assessment) into `3-requirement-analyst.agent.md`
- Merge `clarification-tracking/SKILL.md` templates into `requirements-templates/SKILL.md`
- Namespace clarification commands with `clr-` prefix (e.g., `clr-init`, `clr-resolve`, `clr-readiness`)
- Standardize on `CLR-NNN` as the unified clarification ID scheme
- Delete `clarification-agent.agent.md` and `clarification-tracking/` skill directory
- Update all downstream references across the framework

## Consequences

### Positive
- **Reduced agent count:** 9 → 8 agents, simpler mental model for users
- **Eliminated context-switching:** Single agent handles the full requirements-to-readiness flow
- **Unified ID scheme:** `CLR-NNN` used consistently everywhere
- **Lower token overhead:** One agent definition + one skill file instead of two each
- **Single data ownership:** No shared-write conflicts on clarification files
- **Simpler pipeline:** `run-all` can orchestrate both requirements extraction and clarification tracking

### Negative
- **Larger agent definition:** Requirements agent body grew (mitigated by subsequent optimization pass reducing 22 capabilities → 6 grouped capabilities)
- **Broader scope:** One agent now handles more responsibilities (mitigated by clear `clr-` command namespace separation)

### Neutral
- All downstream agents (`@4-project-planning`, `@5-product-owner`, `@screen-design-agent`) updated to reference `@3-requirement-analyst clr-*` commands
- Documentation files (README, QUICK_START, WORKFLOW_GUIDE, PROMPT_TEMPLATES) updated
- No behavioral changes — all commands and templates preserved with new naming

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| Keep separate agents, fix ID mismatch only | Does not address coupling, duplication, or user friction |
| Make clarification agent a sub-agent of requirements agent | VS Code Copilot sub-agent invocation adds latency and complexity; the agents share too much state for clean delegation |
| Merge into a new "requirements-lifecycle-agent" | Unnecessary rename — requirements agent already owned the broader scope |

## Files Changed

| File | Change |
|------|--------|
| `.github/agents/3-requirement-analyst.agent.md` | Absorbed clarification capabilities and commands |
| `.github/agents/clarification-agent.agent.md` | Deleted |
| `.github/skills/requirements-templates/SKILL.md` | Absorbed clarification tracking templates |
| `.github/skills/clarification-tracking/SKILL.md` | Deleted |
| `.github/copilot-instructions.md` | Removed clarification agent, updated count |
| `.github/agents/4-project-planning.agent.md` | Updated 2 references |
| `.github/agents/5-product-owner.agent.md` | Updated 2 references |
| `.github/agents/screen-design-agent.agent.md` | Updated 1 reference |
| `.github/WORKFLOW_GUIDE.md` | Updated Phase 6 + quick reference table |
| `.github/PROMPT_TEMPLATES.md` | Updated 3 clarification templates |
| `QUICK_START.md` | Updated 3 references |
| `README.md` | Updated agent table + project structure |

## References

- [Optimization Log](../evaluation/optimization-log.md) — Full change details with before/after metrics
- [Requirement Analyst](../../.github/agents/3-requirement-analyst.agent.md) — Merged agent definition
- [Requirements Templates Skill](../../.github/skills/requirements-templates/SKILL.md) — Merged skill with clarification templates
