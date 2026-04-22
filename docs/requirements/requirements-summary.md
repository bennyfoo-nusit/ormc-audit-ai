# Requirements Summary — ORMC AI Document Audit

**Generated:** 2026-04-21
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit) + Design Prototype + Spike Reports

## Overview
| Metric | Count |
|--------|-------|
| Functional Requirements | 38 |
| Non-Functional Requirements | 15 |
| Business Rules | 27 |
| User Personas | 4 |
| Total Gaps Identified | 18 |
| Total Clarifications | 15 |

## By Priority
| Priority | FRs | NFRs |
|----------|-----|------|
| High | 22 | 9 |
| Medium | 13 | 6 |
| Low | 3 | 0 |

## By Status
| Status | Count | % |
|--------|-------|---|
| 📋 Draft | 53 | 100% |
| 👀 In Review | 0 | 0% |
| ✅ Approved | 0 | 0% |
| ⏸️ On Hold | 0 | 0% |

## Feature Coverage
| Module | Confluence Ref | FRs | Status |
|--------|---------------|-----|--------|
| 1. User Authentication & Sharing | 1.1, 1.2 | FR-001, FR-002 | ✅ Covered |
| 2. File Management | 2.1, 2.2 | FR-003, FR-004, FR-005 | ✅ Covered |
| 3. Document Conversion | 3.1, 3.2 | FR-006, FR-007 | ✅ Covered |
| 4. Document Tagging | 4.1, 4.2 | FR-008, FR-009, FR-010 | ✅ Covered |
| 5. Dossier Compilation | 5.1, 5.2 | FR-011, FR-012 | ✅ Covered |
| 6. Display & Navigation | 6.1–6.4 | FR-013, FR-014, FR-015, FR-016 | ✅ Covered |
| 7. Annotation | 7.1–7.3 | FR-017, FR-018, FR-019, FR-037 | ✅ Covered |
| 8. Smart Search | 8.1, 8.2 | FR-020, FR-021 | ✅ Covered |
| 9. AI Chat & Query | 9.1–9.3 | FR-022, FR-023, FR-024, FR-027 | ✅ Covered |
| — Dossier Management (Home) | Design | FR-025, FR-026 | ✅ Covered |
| — Comments/Findings View | Design | FR-028 | ✅ Covered |
| — Administration | Design | FR-029, FR-030 | ✅ Covered |
| — Workspace Layout | Design | FR-031 | ✅ Covered |
| — Navigation | Design | FR-032 | ✅ Covered |
| — Business Process Flow | Confluence | FR-033, FR-034, FR-035 | ✅ Covered |
| — Multi-Select & Context | Design | FR-036 | ✅ Covered |
| — Document Search | Design | FR-038 | ✅ Covered |

## Gap Severity Distribution
| Severity | Count | IDs |
|----------|-------|-----|
| Critical | 3 | GAP-001 (Auth), GAP-004 (Backend), GAP-005 (Database) |
| High | 6 | GAP-002, GAP-003, GAP-006, GAP-007, GAP-013, GAP-017 |
| Medium | 7 | GAP-008, GAP-009, GAP-010, GAP-011, GAP-012, GAP-014, GAP-015 |
| Low | 2 | GAP-016, GAP-018 |

## Clarification Priority Distribution
| Priority | Count | IDs |
|----------|-------|-----|
| P0 Critical | 3 | CLR-001 (Auth), CLR-004 (Backend), CLR-005 (Database) |
| P1 High | 4 | CLR-002 (Permissions), CLR-003 (Upload limits), CLR-007 (AI/RAG), CLR-012 (Admin roles), CLR-015 (Hosting) |
| P2 Medium | 8 | CLR-006, CLR-008, CLR-009, CLR-010, CLR-011, CLR-013, CLR-014 |

## Key Risks
1. **3 Critical gaps unresolved** — Auth provider, backend tech, and database are undecided. These block development start.
2. **AI architecture undefined** — RAG strategy, LLM provider, and embedding approach affect core product value.
3. **DOCX text selectability** — Client-side conversion produces non-selectable text, conflicting with search/annotation needs.
4. **Notebook feature underspecified** — Screenshot capture and export format unclear.
5. **No hosting decision** — Affects all infrastructure, security, and cost estimates.

## Readiness Assessment
⚠️ **Partially Ready** — All 9 Confluence functional modules are covered with 38 FRs in user story format with acceptance criteria. However, 3 P0 Critical clarifications (authentication, backend, database) must be resolved before development planning can begin. Non-functional requirements need stakeholder review and approval. Gap analysis identifies 18 issues requiring attention.

### Before Planning Can Begin
- [ ] Resolve P0 CLRs: CLR-001 (Auth), CLR-004 (Backend), CLR-005 (Database)
- [ ] Resolve P1 CLRs: CLR-007 (AI/RAG), CLR-015 (Hosting)
- [ ] Move FRs to 👀 In Review
- [ ] Stakeholder review of NFRs and business rules

## Output Files
| File | Description |
|------|-------------|
| [functional/fr-all.md](functional/fr-all.md) | 38 functional requirements organized by module |
| [non-functional/nfr-all.md](non-functional/nfr-all.md) | 15 non-functional requirements |
| [business-rules.md](business-rules.md) | 27 business rules |
| [personas.md](personas.md) | 4 user personas |
| [gap-analysis.md](gap-analysis.md) | 18 gaps with severity scoring |
| [clarifications.md](clarifications.md) | 15 clarifications with priority |
| [requirements-summary.md](requirements-summary.md) | This summary |
