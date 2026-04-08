---
name: prototyping-templates
description: "Output templates, reference tables, and report formats for the prototyping agent. Use when generating validation reports, spike results, security reports, cost estimates, executive summaries, ADRs, or TDS documents."
---

# Prototyping Output Templates

Use the appropriate template when generating prototype output. Replace `{placeholders}` with actual values.

## Pre-Flight Validation Report

```markdown
## Pre-Flight Validation Report

### Environment
| Tool | Required | Status | Version |
|------|----------|--------|---------|
| Node.js | ✅ | ✅/❌ | {version} |
| npm | ✅ | ✅/❌ | {version} |
| Docker | Recommended | ✅/❌/⚠️ | {version} |
| Git | ✅ | ✅/❌ | {version} |
| Mermaid CLI | Optional | ✅/❌ | {version} |

### Integrations
| Integration | Status | Details |
|------------|--------|---------|
| Confluence | ✅/⚠️ | {space key or N/A} |
| GitHub | ✅/⚠️ | {repo or N/A} |
| Azure DevOps | ✅/⚠️ | {project or N/A} |

### Input Sources
| Source | Status | Details |
|--------|--------|---------|
| UI Reference | ✅/⚠️ | `/ui-reference/` {N} files |
| Confluence Page | ✅/⚠️ | {page URL or N/A} |

### Blockers
- {critical issues}

**Overall: ✅ Ready / ⚠️ Partial / ❌ Blocked**
```

## Detected Tech Stack

```markdown
## Detected Tech Stack

| Layer | Detected | Confidence | Evidence |
|-------|----------|------------|----------|
| Frontend | {framework} | High/Medium/Low | {evidence} |
| Backend | {framework} | High/Medium/Low | {evidence} |
| Database | {db} | High/Medium/Low | {evidence} |
| Infrastructure | {infra} | High/Medium/Low | {evidence} |
| Build Tool | {tool} | High/Medium/Low | {evidence} |
```

## Stack Detection Indicators

| File | Indicates |
|------|-----------|
| `package.json` | Node.js / JavaScript / TypeScript |
| `tsconfig.json` | TypeScript |
| `requirements.txt` / `pyproject.toml` | Python |
| `pom.xml` / `build.gradle` | Java |
| `*.csproj` / `*.sln` | .NET / C# |
| `go.mod` | Go |
| `Cargo.toml` | Rust |
| `Dockerfile` / `docker-compose.yml` | Containerized |
| `vite.config.*` / `next.config.*` / `angular.json` | Frontend framework |

## Prototype Status

```markdown
## Current Prototype Configuration

| Field | Value |
|-------|-------|
| Project Name | {name} |
| Description | {description} |
| Tech Stack | {frontend} + {backend} + {database} |
| Platform | {platform} |
| Capabilities | {list} |
| Constraints | {constraints} |
| Deployment | {target} |

## Progress
- UI Reference: ✅/⚠️/❌
- Scaffold: ✅/❌
- Spikes: {completed}/{total}
- Integration Check: ✅/❌
- Benchmarks: ✅/❌
- Security Check: ✅/❌
- Cost Estimate: ✅/❌
- Decision (ADR): ✅/❌
```

## Spike Results

```markdown
## Spike: {Capability Name}

**Status:** ✅ Pass | ❌ Fail | ⚠️ Partial
**Objective:** {what we were trying to prove}
**Approach:** {how we tested it}

**Results:**
- {what worked}
- {what didn't work}
- {workarounds applied}

**Blockers:** {unresolved issues}
**Evidence:** {code files, console output, benchmarks}
**Recommendation:** {continue / try alternative / blocker}
```

## Integration Feasibility Report

```markdown
## Integration Feasibility Report

| Integration | SDK Available | Version | Last Updated | Status | Notes |
|-------------|---------------|---------|--------------|--------|-------|
| {service} | Yes/No | {ver} | {date} | ✅/❌ | {notes} |
```

## Baseline Benchmarks

```markdown
## Baseline Benchmarks

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| API response (GET /health) | {ms} | <200ms | ✅/❌ |
| DB query (simple SELECT) | {ms} | <50ms | ✅/❌ |
| Frontend bundle size | {KB} | <500KB | ✅/❌ |
| Cold start time | {s} | <5s | ✅/❌ |
| Build time | {s} | <60s | ✅/❌ |
```

## Security & Compliance Report

```markdown
# Security & Compliance Report

## Vulnerability Scan
| Package | CVE | Severity | Fixed In | Status |
|---------|-----|----------|----------|--------|

## License Audit
| Package | License | Classification | Status |
|---------|---------|---------------|--------|

## OWASP Top 10 (2021)
| OWASP ID | Risk | Mitigation Available | How | Status |
|----------|------|---------------------|-----|--------|
| A01 | Broken Access Control | ✅/❌ | {feature} | {notes} |
| A02 | Cryptographic Failures | ✅/❌ | {feature} | {notes} |
| A03 | Injection | ✅/❌ | {feature} | {notes} |
| A04 | Insecure Design | ✅/❌ | {feature} | {notes} |
| A05 | Security Misconfiguration | ✅/❌ | {feature} | {notes} |
| A06 | Vulnerable Components | ✅/❌ | {feature} | {notes} |
| A07 | Auth Failures | ✅/❌ | {feature} | {notes} |
| A08 | Integrity Failures | ✅/❌ | {feature} | {notes} |
| A09 | Logging Failures | ✅/❌ | {feature} | {notes} |
| A10 | SSRF | ✅/❌ | {feature} | {notes} |

## Overall: ✅ Pass | ⚠️ Conditional | ❌ Fail
```

## Cost Estimate

```markdown
# Cost Estimate — {Project Name}

## Monthly Cost Projection
| Category | Low | Medium | High |
|----------|-----|--------|------|
| Cloud Infrastructure | ${total} | ${total} | ${total} |
| Licensing | ${total} | ${total} | ${total} |
| Third-Party SaaS | ${total} | ${total} | ${total} |
| Dev Tooling (CI/CD) | ${total} | ${total} | ${total} |
| **Total Monthly** | **${total}** | **${total}** | **${total}** |
| **Total Annual** | **${total}** | **${total}** | **${total}** |
```

## Architecture Decision Record (ADR)

```markdown
# ADR-001: Technology Stack Selection

## Status
{Proposed | Accepted | Rejected | Superseded}

## Context
{Project name} requires {description}. The team proposed {tech stack}.

## Decision
{Go / No-Go} with {tech stack}.

## Evidence
### Scaffold
- Build: ✅/❌ | Run: ✅/❌ | Toolchain: ✅/❌

### Capability Spikes
| Capability | Status | Notes |
|------------|--------|-------|

### Integration Feasibility
| Integration | Status | Notes |
|-------------|--------|-------|

### Performance Baselines
| Metric | Value | Acceptable |
|--------|-------|------------|

### Security & Compliance
- Vulnerability scan: ✅/❌ ({N} critical, {N} high)
- License audit: ✅/❌ ({N} blocked)
- OWASP baseline: ✅/❌

### Cost Estimate
| Tier | Monthly | Annual |
|------|---------|--------|

## Consequences
- {positive / negative / risks}

## Alternatives Considered
| Stack | Reason Rejected |
|-------|-----------------|
```

## Executive Summary

```markdown
# Executive Summary — {Project Name}
**Date:** {date}
**Status:** ✅ Ready | ⚠️ In Progress | ❌ Blocked

## 1. What We Evaluated
**Stack:** {frontend} + {backend} + {database}
**Platform:** {platform} | **Deployment:** {target}

## 2. Readiness Scorecard
| Area | Status | Summary |
|------|--------|---------|
| Tech Stack | ✅/❌ | {summary} |
| Core Capabilities | {passed}/{total} | {summary} |
| Integrations | {verified}/{total} | {summary} |
| Performance | ✅/⚠️ | {summary} |
| Security | ✅/⚠️/❌ | {summary} |
| Cost | ${low}–${high}/mo | {budget status} |

## 3. Recommendation
**Decision:** ✅ GO / ❌ NO-GO / ⚠️ GO WITH CONDITIONS
{2-3 sentence recommendation}

## 4. Key Risks
| # | Risk | Impact | Mitigation |
|---|------|--------|------------|

## 5. What Happens Next
- If GO: Proceed to `@connectivity-agent`
- If NO-GO: {alternative}
- If CONDITIONAL: {conditions}
```

## UI Reference Analysis

```markdown
## UI Reference Analysis

**Source:** `/ui-reference/`
**Files Analyzed:** {count}
**Framework:** {React/Vue/Angular/Vanilla}
**UI Library:** {library or None}

### Screens Identified
| # | Screen | File | Key Components | Purpose |
|---|--------|------|----------------|---------|

### API Endpoints Referenced
| Method | Endpoint | Used In | Purpose |
|--------|----------|---------|---------|

### Data Models Inferred
| Entity | Fields | Source |
|--------|--------|--------|

### Design Patterns
- Layout: {description}
- Responsive: {yes/no}
- Theme: {palette/typography}
- Accessibility: {ARIA/semantic HTML}
```

## Help Reference

```markdown
## Technical Feasibility — Command Reference

| Command | Description |
|---------|-------------|
| `help` | Show this command reference |
| `validate` | Pre-flight checks |
| `init` | Initialize prototype workspace |
| `detect-stack` | Auto-detect tech stack from repo |
| `analyze-ui` | Analyze UI reference files |
| `modify {field}` | Change config without re-init |
| `status` | Show configuration and progress |
| `extend {type} {name}` | Add spikes, integrations, constraints, comparisons |
| `spike {capability}` | Run a capability spike |
| `check-integrations` | Verify external system connectivity |
| `benchmark` | Run performance benchmarks |
| `security-check` | CVE scan, license audit, compliance check |
| `estimate-cost` | Cloud, licensing, SaaS cost estimates |
| `decide` | Generate ADR with go/no-go |
| `summary` | Executive brief for stakeholders |
| `publish-tds` | Publish TDS to Confluence |
| `report` | Regenerate all docs from current state |
| `run-all` | Full pipeline end-to-end |
| `cleanup` | Archive or remove prototype |

### Workflow
validate → init → spike(s) → check-integrations → benchmark → security-check → estimate-cost → decide → summary → publish-tds
Or: `run-all`
```
