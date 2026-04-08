---
name: evaluation-scoring
description: "Scoring criteria, industry standards, measurement thresholds, and audit dimensions for the evaluation agent. Use when performing any audit, scoring, or evaluation of agents, requirements, plans, or pipeline."
---

# Evaluation Scoring Criteria

## Industry Standards Reference

| Standard | Applies To | Key Criteria |
|----------|-----------|--------------|
| **ISO/IEC 25010** | Overall software quality | Functional suitability, reliability, usability, maintainability, security, performance efficiency, compatibility, portability |
| **IEEE 830** | Requirements documents | Correctness, unambiguity, completeness, consistency, verifiability, modifiability, traceability, rankability |
| **PMBOK / PMI** | Project plans | Scope definition, WBS, schedule, risk register, resource planning, milestones |
| **OWASP Top 10** | Code review & security | Injection, broken auth, sensitive data exposure, XXE, broken access control, misconfig, XSS, insecure deserialization, vulnerable components, insufficient logging |
| **ISO/IEC 27001** | Security requirements | Information security management, risk assessment, access control |
| **WCAG 2.1** | UI/UX requirements | Perceivable, operable, understandable, robust |
| **CMMI Level 3** | Process maturity | Defined processes, quantitative management, continuous improvement |
| **INVEST** | User stories | Independent, Negotiable, Valuable, Estimable, Small, Testable |

## 1. Agent Definition Audit

### Checks Per Agent
- Has a keyword-rich `description` field for discovery
- Has appropriate `tools` scoped to minimum necessary
- Clear Identity, Purpose, and Scope sections
- Explicit IN SCOPE / OUT OF SCOPE boundaries
- Well-defined input/output contracts
- Instructions with step-by-step workflows
- Error handling guidance
- No role overlap or conflict with other agents
- Uses Copilot features appropriate for its role

### Scoring Dimensions

| Dimension | Weight | Criteria |
|-----------|--------|----------|
| Completeness | 25% | All required sections present (Identity, Purpose, Scope, Instructions, Output Format) |
| Clarity | 20% | Unambiguous language, no vague terms, clear action verbs |
| Tool Scoping | 15% | Minimal tools granted, no unnecessary permissions |
| Boundary Definition | 15% | Clear IN/OUT of scope, explicit handoffs to other agents |
| Discoverability | 10% | Description contains relevant trigger keywords |
| Error Handling | 10% | Covers failure cases, fallback behaviors |
| Copilot Feature Adoption | 10% | Uses available Copilot primitives appropriate to its role (sub-agents, skills, hooks, model config, handoffs) |
| Consistency | 5% | Follows same patterns as other agents in the framework |

## 2. Output Quality Audit

### Requirements (IEEE 830 + INVEST)
- Each FR has: user story, acceptance criteria, priority, complexity, dependencies, source
- Acceptance criteria use Given/When/Then format
- User stories follow INVEST: Independent, Negotiable, Valuable, Estimable, Small, Testable
- NFRs have measurable, testable criteria with measurement methods
- Traceability to source documents
- No ambiguous terms without clarification flags

### Planning (PMBOK)
- WBS with clear task hierarchy
- Effort estimates with methodology
- Dependency mapping and critical path
- Risk register with probability and impact
- Milestones tied to deliverables
- Resource allocation

### Code Review (OWASP + Language Standards)
- Covers OWASP Top 10 categories
- Tech-stack-specific coding standards referenced
- Security findings with severity ratings
- Actionable fix recommendations

### Documentation (ISO/IEC 26514)
- Complete deployment procedures
- Troubleshooting guides
- API documentation with examples
- Audience-appropriate language

## 3. Pipeline Coverage Audit

### SDLC Phases

| Phase | Expected Agent |
|-------|---------------|
| Tech Stack Validation | `@2-technical-feasibility` |
| Integration Setup | `@connectivity-agent` |
| Requirements Gathering | `@3-requirement-analyst` |
| UI/UX Analysis | `@screen-design-agent` |
| Clarification Management | `@3-requirement-analyst` |
| Development Planning | `@4-project-planning` |
| Work Item Creation | `@5-product-owner` |
| Code Review | `@code-review-agent` |
| Documentation | `@docs-agent` |
| Quality Assurance | ❓ Gap |
| Deployment/DevOps | ❓ Gap |
| Monitoring/Observability | ❓ Gap |

### Handoff Chain
```
prototyping → connectivity → requirements → clarification → planning → scrum-master → code-review → docs
```

### Handoff Checks
- Output format of Agent A matches input expectations of Agent B
- File paths referenced downstream exist in upstream output specs
- No data lost between handoffs
- No circular dependencies

## 4. Copilot Feature Adoption Audit

### Copilot Primitives Inventory

| Primitive | Location | Purpose |
|-----------|----------|---------|
| Custom Agents | `/.github/agents/*.agent.md` | Role-based personas with scoped tools |
| Skills | `/.github/skills/<name>/SKILL.md` | On-demand workflows with bundled assets |
| Hooks | `/.github/hooks/*.json` | Deterministic lifecycle automation |
| File Instructions | `/.github/instructions/*.instructions.md` | On-demand or file-pattern-based guidance |
| Prompt Templates | `/.github/prompts/*.prompt.md` | Reusable single-task templates |
| Workspace Instructions | `/.github/copilot-instructions.md` | Always-on project-wide guidance |

### Per-Agent Feature Checks

| Feature | Key | Check |
|---------|-----|-------|
| Sub-agent delegation | `agents:` or `agent` tool | Does agent delegate to sub-agents? |
| Model selection | `model:` | Model specified with fallback array? |
| Handoff transitions | `handoffs:` | Explicit handoffs to downstream agents? |
| Invocation control | `user-invocable:`, `disable-model-invocation:` | Internal agents hidden? User-facing visible? |
| Argument hints | `argument-hint:` | Input guidance provided to users? |
| Skill references | Body references to skills | Leverages skills for repeatable workflows? |
| Tool alias usage | `tools:` style | Aliases vs verbose granular IDs? |

### Framework-Level Feature Checks

| Check | Severity When Missing |
|-------|-----------------------|
| Skills directory with SKILL.md files | Medium |
| Hooks directory with lifecycle hooks | Medium |
| File instructions (.instructions.md) | Low |
| Prompt templates (.prompt.md) | Low |
| Consistent tool strategy (aliases vs granular IDs) | Low |
| Agents with `tools: []` that need tool access | **High** |
| Over-provisioned tools beyond stated scope | Medium |

### Feature Adoption Scoring

| Dimension | Weight | Criteria |
|-----------|--------|----------|
| Sub-agent usage | 20% | Agents that would benefit from delegation have `agents:` or `agent` tool configured |
| Skill adoption | 20% | Repeatable multi-step workflows are packaged as skills |
| Hook adoption | 15% | Quality gates use hooks instead of relying on instructions alone |
| Frontmatter completeness | 15% | `model:`, `handoffs:`, `argument-hint:`, invocation control set where appropriate |
| Instruction files | 15% | Domain-specific guidance exists as `.instructions.md` for relevant file types |
| Prompt templates | 10% | Common one-off tasks have reusable `.prompt.md` templates |
| Tool hygiene | 5% | No empty `tools: []` on agents that need tools; no over-provisioned tools; consistent alias usage |

## 5. Token & Context Efficiency Audit

### Measurement Method (1 token ≈ 4 characters)

| Component | Target |
|-----------|--------|
| Agent body (excl. frontmatter) | < 2,000 ideal, < 4,000 acceptable, > 4,000 heavy |
| Description field | < 200 tokens (max 1,024 chars) |
| Tools list | < 10 focused, 10–20 moderate, > 20 bloated |
| Referenced skills | < 500 lines per skill |
| Always-on instructions | < 1,000 tokens combined |

### Per-Agent Token Budget

| Category | Tokens | Notes |
|----------|--------|-------|
| Agent definition body | ~2,000 | Body instructions, constraints, output format |
| Description | ~100 | Keyword-rich but concise |
| Tool overhead | ~50/tool | Each tool adds schema tokens to context |
| Workspace instructions | ~500 | Shared across all agents |
| Skills (on-demand) | ~1,000 | Loaded only when triggered |
| **Estimated overhead** | **~3,000–5,000** | Before any user prompt or file content |

### Efficiency Checks

| Check | Flag | Severity |
|-------|------|----------|
| Oversized definition | Body > 4,000 tokens | High |
| Redundant instructions | Duplicated between agent body and copilot-instructions.md | Medium |
| Verbose output templates | > 500 tokens of template in body | Medium |
| Tool sprawl | > 20 tools, many unused | Medium |
| Description bloat | > 200 tokens | Low |
| Repeated boilerplate | Same sections copy-pasted across agents | Low |
| Deep nesting | Skills referencing sub-files referencing more files | Low |

### Framework-Level Token Analysis

| Metric | Threshold |
|--------|-----------|
| Total framework footprint | < 50,000 tokens |
| Largest agent | < 2× average |
| Smallest agent | > 500 tokens (may indicate incomplete) |
| Always-on overhead | < 1,500 tokens |

### Token Efficiency Scoring

| Dimension | Weight | Criteria |
|-----------|--------|----------|
| Agent body size | 30% | All agents under 4,000 tokens, ideally under 2,000 |
| Description conciseness | 15% | Under 200 tokens with high keyword density |
| Tool count efficiency | 20% | Minimal tools per agent, no unused tools |
| Duplication avoidance | 15% | No content duplicated between agents or between agents and instructions |
| Progressive loading | 10% | Large reference content in skills/assets, not in agent body |
| Always-on overhead | 10% | Workspace instructions lean and focused |

## 6. Maturity Assessment (CMMI-Inspired)

| Level | Name | Criteria |
|-------|------|----------|
| 1 — Initial | Ad-hoc | Agents exist but no consistent structure or handoffs |
| 2 — Managed | Structured | Agents follow consistent patterns, clear scope boundaries |
| 3 — Defined | Standardized | All SDLC phases covered, handoffs validated, quality gates in place |
| 4 — Quantitative | Measured | Metrics tracked, quality scores maintained, trends visible |
| 5 — Optimizing | Continuous Improvement | Feedback loops, evaluation cycles, automated quality gates |

## Scoring Guidelines

| Score Range | Rating | Meaning |
|------------|--------|---------|
| 90–100% | Excellent | Meets or exceeds industry standards |
| 75–89% | Good | Minor improvements needed |
| 60–74% | Needs Improvement | Significant gaps that should be addressed |
| 40–59% | Poor | Major gaps affecting quality and reliability |
| 0–39% | Critical | Fundamental issues requiring immediate attention |
