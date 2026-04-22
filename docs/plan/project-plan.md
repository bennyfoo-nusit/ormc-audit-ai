# Project Plan — ORMC AI Document Audit

**Created:** 2026-04-21
**Last Updated:** 2026-04-21
**Timeline:** 2026-05-05 → 2027-01-09 (18 sprints, 36 weeks)
**Team Size:** 1 Full-Stack Developer (TypeScript)
**Total Scope:** 239 story points across 14 feature groups
**Methodology:** Agile/Scrum with 2-week sprints
**Velocity Target:** 13–15 SP/sprint (consistent)

---

## 1. Project Overview

The ORMC AI Document Audit platform enables NUS Principal Investigators (PIs) to review, annotate, and query large document sets with AI assistance. The system supports PDF viewing with multi-layer annotations, document conversion from 5+ formats, AI-powered search and chat over document content (RAG pipeline), and multi-user sharing with permission controls.

This plan is based on **1 full-stack TypeScript developer** using Resource-First planning (Option B). The developer handles frontend (React 19), backend (Node.js + Express 5), database (Azure SQL), and AI integration (Azure OpenAI).

### Planning Parameters

| Parameter | Value |
|-----------|-------|
| Team Composition | 1 Full-Stack Developer (TypeScript) |
| Sprint Length | 2 weeks (10 working days) |
| Velocity Target | 13–15 SP/sprint |
| Average Velocity | 13.5 SP/sprint |
| Total Task SP | 239 SP |
| Buffer | ~13 SP (embedded in S18 as UAT contingency) |
| Total Sprints | 18 |
| Start Date | 2026-05-05 (Monday) |
| Projected End Date | 2027-01-09 (Friday) |

---

## 2. Feature Breakdown & Estimates

### Feature Group Summary

| # | Feature Group | FRs | SP | Priority | Sprints | Phase |
|---|--------------|-----|-----|----------|---------|-------|
| F0 | Infrastructure & Scaffold | — | 16 | Critical | S1–S2 | Foundation |
| F1 | Auth & Home | FR-001, FR-002, FR-025, FR-032 | 24 | Critical | S2–S3 | Foundation |
| F2 | File Management | FR-003, FR-005, FR-038 | 15 | Critical | S4–S5 | Core |
| F3 | Document Conversion | FR-006, FR-007 | 13 | High | S5 | Core |
| F4 | Dossier Compilation | FR-011, FR-012 | 13 | High | S6 | Core |
| F5 | PDF Viewer & Navigation | FR-013, FR-014, FR-015, FR-031 | 24 | Critical | S7–S9 | Core |
| F6 | Annotation | FR-017, FR-018, FR-019, FR-037 | 21 | High | S9–S10 | Core |
| F7 | Comments & Findings | FR-028 | 5 | High | S9, S11 | Core |
| F8 | Smart Search | FR-020, FR-021 | 8 | High | S11 | Enhanced |
| F9 | AI Chat & RAG | FR-008, FR-010, FR-022, FR-023, FR-024, FR-027 | 39 | Critical | S8, S12–S14 | Enhanced |
| F10 | Administration | FR-029, FR-030 | 8 | Medium | S11, S13 | Enhanced |
| F11 | Workflow & Polish | FR-004, FR-009, FR-016, FR-026, FR-033–FR-036 | 27 | Medium | S15–S16, S18 | Polish |
| F12 | NFR Hardening & Testing | NFR-001–NFR-015 | 16 | High | S16–S17 | Hardening |
| F13 | Deployment & Release | — | 10 | Critical | S18 | Release |
| | **TOTAL** | **38 FRs** | **239 SP** | | **18 sprints** |

### Detailed Task Breakdown

#### F0: Infrastructure & Scaffold (16 SP)

| Task ID | Task | SP | Sprint | Dependencies | DoD |
|---------|------|-----|--------|-------------|-----|
| T-001 | Monorepo setup (Vite + Express + shared types) | 3 | S1 | None | Build passes, dev servers run |
| T-002 | Azure SQL schema + Prisma ORM setup | 5 | S1 | None | Migrations run, seed data loads |
| T-003 | Express 5 API scaffold + middleware (CORS, error handling, logging) | 3 | S1 | T-001 | Health endpoint responds |
| T-004 | Azure Blob Storage integration (upload/download utilities) | 3 | S2 | T-001 | File upload/download works via API |
| T-005 | CI/CD pipeline (GitHub Actions: lint, test, build) | 2 | S2 | T-001 | Pipeline green on push |

#### F1: Auth & Home (24 SP)

| Task ID | Task | SP | Sprint | Dependencies | DoD |
|---------|------|-----|--------|-------------|-----|
| T-006 | MSAL React setup + Azure Entra ID login flow | 5 | S2 | T-001 | Login/logout works, token acquired |
| T-007 | Auth middleware (msal-node token validation, user context) | 3 | S2 | T-003, T-006 | API rejects unauthenticated requests |
| T-008 | Dossier CRUD API (create, read, update, delete) | 3 | S2 | T-002, T-007 | API endpoints return correct data |
| T-009 | Dossiers Home UI (card grid, search, empty state, create dialog) | 5 | S3 | T-006, T-008 | Home page renders with CRUD operations |
| T-010 | "My Projects" vs "Shared with Me" sections | 2 | S3 | T-009 | Sections display correctly |
| T-011 | Sharing permissions API + ShareProjectDialog UI | 3 | S3 | T-008 | Share/revoke works with View/Edit |
| T-012 | App navigation header (routing, NUS branding) | 3 | S3 | T-006 | All views navigable |

#### F2: File Management (15 SP)

| Task ID | Task | SP | Sprint | Dependencies | DoD |
|---------|------|-----|--------|-------------|-----|
| T-013 | Document upload API (Blob Storage + metadata in SQL) | 5 | S4 | T-004, T-008 | Single + bulk upload works |
| T-014 | ZIP file extraction + smart handling | 3 | S4 | T-013 | ZIP uploads extracted, files stored |
| T-015 | Document Management UI (table, upload dialog, metadata) | 3 | S4 | T-013 | Upload, view, delete documents |
| T-016 | Folder organization (create, move, drag-drop) | 3 | S4 | T-015 | Documents organized in folders |
| T-017 | Document search in management view | 1 | S5 | T-015 | Real-time name filtering works |

#### F3: Document Conversion (13 SP)

| Task ID | Task | SP | Sprint | Dependencies | DoD |
|---------|------|-----|--------|-------------|-----|
| T-018 | DOCX → PDF pipeline (mammoth + html2canvas + jsPDF) | 3 | S5 | T-013 | DOCX files converted, PDF stored |
| T-019 | XLSX → PDF pipeline (SheetJS + jspdf-autotable + smart sizing) | 3 | S5 | T-013 | XLSX converted with landscape/A3/font |
| T-020 | Image → PDF pipeline (pdf-lib, auto orientation) | 2 | S5 | T-013 | PNG/JPG/JPEG → PDF works |
| T-021 | PPTX → PDF server-side (LibreOffice in Docker) | 3 | S5 | T-003 | PPTX conversion via API endpoint |
| T-022 | Conversion orchestrator (auto-detect format, run pipeline) | 2 | S5 | T-018–T-021 | Upload triggers auto-conversion |

#### F4: Dossier Compilation (13 SP)

| Task ID | Task | SP | Sprint | Dependencies | DoD |
|---------|------|-----|--------|-------------|-----|
| T-023 | PDF merge API (pdf-lib copyPages + bookmark generation) | 5 | S6 | T-013, T-022 | Multiple PDFs merged with bookmarks |
| T-024 | Merge trigger on document add/reorder | 3 | S6 | T-023 | Auto-recompile on change |
| T-025 | Document insertion at specific position | 3 | S6 | T-023 | Insert without disrupting bookmarks |
| T-026 | Bookmark preservation across recompile | 2 | S6 | T-023 | Existing bookmarks survive merge |

#### F5: PDF Viewer & Navigation (24 SP)

| Task ID | Task | SP | Sprint | Dependencies | DoD |
|---------|------|-----|--------|-------------|-----|
| T-027 | PDF Viewer component (react-pdf, zoom, scroll, page nav) | 5 | S7 | T-023 | PDF renders with zoom 50-200%, page nav |
| T-028 | Text layer (selectable, searchable text) | 3 | S7 | T-027 | Text selectable, copy works |
| T-029 | ResizablePanelGroup workspace layout (4 panels) | 5 | S7 | T-027 | Panels resize, toggle visibility |
| T-030 | Bookmark tree component (recursive, expand/collapse, animation) | 5 | S8 | T-027, T-023 | Click bookmark → PDF navigates |
| T-031 | Bookmark CRUD (insert, rename, relocate, drag-drop nesting) | 3 | S8 | T-030 | Manual bookmark management works |
| T-032 | Tag filter in document tree (AND logic, highlight) | 3 | S9 | T-030 | Tag selection filters tree nodes |

#### F6: Annotation (21 SP)

| Task ID | Task | SP | Sprint | Dependencies | DoD |
|---------|------|-----|--------|-------------|-----|
| T-033 | Text annotation (select text → highlight → comment → tags) | 8 | S9 | T-028 | Full annotation flow works |
| T-034 | Shape annotation (SVG overlay: box, circle, arrow, triangle) | 5 | S10 | T-027 | Draw, move, resize, delete shapes |
| T-035 | Stamp annotation (image library, placement, custom stamps) | 5 | S10 | T-027 | Place stamp on PDF page |
| T-036 | Area highlight (rectangular region with opacity) | 3 | S10 | T-034 | Click-drag highlight region |

#### F7: Comments & Findings (5 SP)

| Task ID | Task | SP | Sprint | Dependencies | DoD |
|---------|------|-----|--------|-------------|-----|
| T-037 | Comments panel (annotation list, sort by page) | 3 | S9 | T-033 | All annotations listed with metadata |
| T-038 | Tag filtering in comments (FIND/CLAR/COMM counts + filter) | 2 | S11 | T-037 | Filter by tag type, counts shown |

#### F8: Smart Search (8 SP)

| Task ID | Task | SP | Sprint | Dependencies | DoD |
|---------|------|-----|--------|-------------|-----|
| T-039 | Keyword search (full-text across dossier, highlight on bookmarks) | 5 | S11 | T-030, T-028 | Search results navigate to page |
| T-040 | Tag-based search (combine with keyword, AND logic) | 3 | S11 | T-039, T-032 | Tag+keyword combo filtering works |

#### F9: AI Chat & RAG (39 SP)

| Task ID | Task | SP | Sprint | Dependencies | DoD |
|---------|------|-----|--------|-------------|-----|
| T-041 | Azure AI Search index setup (schema, embeddings, hybrid config) | 5 | S8 | T-002 | Index created, test doc indexed |
| T-042 | PDF text extraction + chunking pipeline (server-side) | 5 | S12 | T-013, T-041 | Upload triggers extract → chunk → embed |
| T-043 | Embedding pipeline (text-embedding-3-small, batch ingest) | 3 | S12 | T-041 | Chunks embedded and indexed |
| T-044 | AI document tagging on upload (gpt-4o-mini, 3-5 tags) | 5 | S12 | T-043 | Upload → auto-tags generated |
| T-045 | RAG chat API (retrieve → augment → generate with citations) | 8 | S13 | T-043 | Chat returns cited answers from docs |
| T-046 | AI Chat Panel UI (messages, markdown, copy, streaming) | 5 | S14 | T-045 | Chat UI with streaming responses |
| T-047 | Document context attachment (multi-select → AI scope) | 3 | S14 | T-046, T-030 | Select docs → AI searches only those |
| T-048 | Web search integration (Bing API toggle) | 3 | S14 | T-046 | Toggle web search, results shown |
| T-049 | Multi-agent window (@-mention picker, system prompts) | 2 | S14 | T-046 | Switch agents, prompt applied |

#### F10: Administration (8 SP)

| Task ID | Task | SP | Sprint | Dependencies | DoD |
|---------|------|-----|--------|-------------|-----|
| T-050 | Custom AI Agent CRUD (Admin UI + API) | 5 | S11 | T-007 | Create/edit/delete agents, available in chat |
| T-051 | Document Tagging Prompt CRUD (Admin UI + API) | 3 | S13 | T-007 | Create/edit/delete prompts, used in tagging |

#### F11: Workflow & Polish (27 SP)

| Task ID | Task | SP | Sprint | Dependencies | DoD |
|---------|------|-----|--------|-------------|-----|
| T-052 | Document download/export API (dossier archive with findings) | 5 | S15 | T-023, T-033 | Download ZIP with annotated PDFs |
| T-053 | PDF export with embedded annotations + shapes | 5 | S15 | T-033, T-034 | Exported PDF contains all annotations |
| T-054 | Manual tag editing (add, remove, save) | 2 | S13 | T-044 | Tag editor works alongside AI tags |
| T-055 | Notebook (capture AI chat + notes + screenshot export) | 5 | S15 | T-046 | One-click capture, downloadable |
| T-056 | Session reset (confirmation + clear annotations/chat) | 2 | S16 | T-033, T-046 | Reset clears session data |
| T-057 | Document multi-select in tree (Ctrl+Click) | 2 | S18 | T-030 | Multi-select with count indicator |
| T-058 | Preparation phase workflow (upload → convert → tag → merge) | 3 | S16 | T-022, T-044, T-024 | Pipeline executes automatically |
| T-059 | Review + post-review phase workflow | 3 | S16 | T-058 | Phase transitions work |

#### F12: NFR Hardening & Testing (16 SP)

| Task ID | Task | SP | Sprint | Dependencies | DoD |
|---------|------|-----|--------|-------------|-----|
| T-060 | Performance optimization (lazy loading, caching, bundle) | 5 | S16 | All features | Bundle <500KB, page render <2s |
| T-061 | Error handling + loading states (global error boundary) | 3 | S17 | All features | No unhandled errors in UI |
| T-062 | Security hardening (CSRF, rate limiting, input validation) | 3 | S17 | T-007 | OWASP Top 10 mitigated |
| T-063 | E2E test suite (critical paths: login, upload, annotate, chat) | 5 | S17 | All features | Critical paths covered |

#### F13: Deployment & Release (10 SP)

| Task ID | Task | SP | Sprint | Dependencies | DoD |
|---------|------|-----|--------|-------------|-----|
| T-064 | Docker image (Node.js + LibreOffice + Vite build) | 3 | S17 | All features | Image builds, runs locally |
| T-065 | Azure App Service / Container Apps deployment | 3 | S18 | T-064 | App accessible on Azure |
| T-066 | Azure SQL + Blob + AI Search provisioning (IaC) | 2 | S18 | T-065 | All Azure services connected |
| T-067 | UAT + bug fixes + production go-live | 2 | S18 | T-065 | Stakeholder sign-off |

---

## 3. Sprint Plan

### Phase 1: Foundation (S1–S3) — Weeks 1–6

#### Sprint 1: Project Scaffold (2026-05-05 → 2026-05-16)
**Velocity:** 14 SP | **Focus:** Infrastructure + database
| Task | SP | Status |
|------|-----|--------|
| T-001: Monorepo setup | 3 | ⏳ |
| T-002: Azure SQL + Prisma schema | 5 | ⏳ |
| T-003: Express 5 API scaffold | 3 | ⏳ |
| T-004: Azure Blob Storage integration | 3 | ⏳ |

#### Sprint 2: Auth + Dossier API (2026-05-19 → 2026-05-30)
**Velocity:** 13 SP | **Focus:** Auth + CRUD
| Task | SP | Status |
|------|-----|--------|
| T-005: CI/CD pipeline | 2 | ⏳ |
| T-006: MSAL React login flow | 5 | ⏳ |
| T-007: Auth middleware (token validation) | 3 | ⏳ |
| T-008: Dossier CRUD API | 3 | ⏳ |

#### Sprint 3: Home Page + Sharing (2026-06-01 → 2026-06-12)
**Velocity:** 13 SP | **Focus:** Dossier UI + sharing
| Task | SP | Status |
|------|-----|--------|
| T-009: Dossiers Home UI | 5 | ⏳ |
| T-010: My Projects / Shared with Me | 2 | ⏳ |
| T-011: Sharing permissions | 3 | ⏳ |
| T-012: App navigation header | 3 | ⏳ |

### Phase 2: Core Features (S4–S10) — Weeks 7–20

#### Sprint 4: File Management (2026-06-15 → 2026-06-26)
**Velocity:** 14 SP | **Focus:** Upload + file org
| Task | SP | Status |
|------|-----|--------|
| T-013: Document upload API | 5 | ⏳ |
| T-014: ZIP extraction | 3 | ⏳ |
| T-015: Document Management UI | 3 | ⏳ |
| T-016: Folder organization | 3 | ⏳ |

#### Sprint 5: Document Conversion (2026-06-29 → 2026-07-10)
**Velocity:** 14 SP | **Focus:** All format pipelines
| Task | SP | Status |
|------|-----|--------|
| T-017: Document search in mgmt | 1 | ⏳ |
| T-018: DOCX → PDF pipeline | 3 | ⏳ |
| T-019: XLSX → PDF pipeline | 3 | ⏳ |
| T-020: Image → PDF pipeline | 2 | ⏳ |
| T-021: PPTX → PDF (LibreOffice) | 3 | ⏳ |
| T-022: Conversion orchestrator | 2 | ⏳ |

#### Sprint 6: Dossier Compilation (2026-07-13 → 2026-07-24)
**Velocity:** 13 SP | **Focus:** PDF merge + bookmarks
| Task | SP | Status |
|------|-----|--------|
| T-023: PDF merge API | 5 | ⏳ |
| T-024: Auto-recompile on change | 3 | ⏳ |
| T-025: Document insertion | 3 | ⏳ |
| T-026: Bookmark preservation | 2 | ⏳ |

#### Sprint 7: PDF Viewer + Workspace (2026-07-27 → 2026-08-07)
**Velocity:** 13 SP | **Focus:** Viewer + layout
| Task | SP | Status |
|------|-----|--------|
| T-027: PDF Viewer component | 5 | ⏳ |
| T-028: Text layer (select, search) | 3 | ⏳ |
| T-029: Resizable panel workspace | 5 | ⏳ |

**🏁 MILESTONE: Alpha (end of S7)** — Core document pipeline works: upload → convert → merge → view

#### Sprint 8: Bookmark Tree + AI Search Setup (2026-08-10 → 2026-08-21)
**Velocity:** 13 SP | **Focus:** Navigation + AI index
| Task | SP | Status |
|------|-----|--------|
| T-030: Bookmark tree component | 5 | ⏳ |
| T-031: Bookmark CRUD | 3 | ⏳ |
| T-041: Azure AI Search index setup | 5 | ⏳ |

#### Sprint 9: Annotation (2026-08-24 → 2026-09-04)
**Velocity:** 14 SP | **Focus:** Text annotation + comments
| Task | SP | Status |
|------|-----|--------|
| T-032: Tag filter in tree | 3 | ⏳ |
| T-033: Text annotation | 8 | ⏳ |
| T-037: Comments panel | 3 | ⏳ |

#### Sprint 10: Shapes + Stamps (2026-09-07 → 2026-09-18)
**Velocity:** 13 SP | **Focus:** Visual annotations
| Task | SP | Status |
|------|-----|--------|
| T-034: Shape annotation (SVG overlay) | 5 | ⏳ |
| T-035: Stamp annotation | 5 | ⏳ |
| T-036: Area highlight | 3 | ⏳ |

### Phase 3: Enhanced Features (S11–S15) — Weeks 21–30

#### Sprint 11: Search + Admin (2026-09-21 → 2026-10-02)
**Velocity:** 15 SP | **Focus:** Search + comments filter + admin
| Task | SP | Status |
|------|-----|--------|
| T-038: Tag filtering in comments | 2 | ⏳ |
| T-039: Keyword search | 5 | ⏳ |
| T-040: Tag-based search | 3 | ⏳ |
| T-050: Custom AI Agent CRUD | 5 | ⏳ |

**🏁 MILESTONE: Beta (end of S11)** — Full document workflow + annotation + search complete.

#### Sprint 12: RAG Ingestion (2026-10-05 → 2026-10-16)
**Velocity:** 13 SP | **Focus:** AI ingestion pipeline
| Task | SP | Status |
|------|-----|--------|
| T-042: PDF extraction + chunking | 5 | ⏳ |
| T-043: Embedding pipeline | 3 | ⏳ |
| T-044: AI document tagging | 5 | ⏳ |

#### Sprint 13: RAG Chat + Tags (2026-10-19 → 2026-10-30)
**Velocity:** 13 SP | **Focus:** Chat API + tag mgmt
| Task | SP | Status |
|------|-----|--------|
| T-045: RAG chat API | 8 | ⏳ |
| T-051: Tagging Prompt CRUD | 3 | ⏳ |
| T-054: Manual tag editing | 2 | ⏳ |

#### Sprint 14: Chat UI + Enhancements (2026-11-02 → 2026-11-13)
**Velocity:** 13 SP | **Focus:** Chat panel + web search + agents
| Task | SP | Status |
|------|-----|--------|
| T-046: AI Chat Panel UI | 5 | ⏳ |
| T-047: Document context attachment | 3 | ⏳ |
| T-048: Web search integration | 3 | ⏳ |
| T-049: Multi-agent window | 2 | ⏳ |

#### Sprint 15: Export + Notebook (2026-11-16 → 2026-11-27)
**Velocity:** 15 SP | **Focus:** Export + notebook
| Task | SP | Status |
|------|-----|--------|
| T-052: Document download/export | 5 | ⏳ |
| T-053: PDF export with annotations | 5 | ⏳ |
| T-055: Notebook (capture + export) | 5 | ⏳ |

### Phase 4: Polish & Hardening (S16–S17) — Weeks 31–34

#### Sprint 16: Workflow + Performance (2026-11-30 → 2026-12-11)
**Velocity:** 13 SP | **Focus:** Workflow + perf
| Task | SP | Status |
|------|-----|--------|
| T-056: Session reset | 2 | ⏳ |
| T-058: Preparation phase workflow | 3 | ⏳ |
| T-059: Review + post-review workflow | 3 | ⏳ |
| T-060: Performance optimization | 5 | ⏳ |

**🏁 MILESTONE: Feature Complete (end of S16)** — All 38 FRs implemented.

#### Sprint 17: Hardening + Deployment Prep (2026-12-14 → 2026-12-25)
**Velocity:** 14 SP | **Focus:** Security, testing, Docker
| Task | SP | Status |
|------|-----|--------|
| T-061: Error handling + loading states | 3 | ⏳ |
| T-062: Security hardening | 3 | ⏳ |
| T-063: E2E test suite | 5 | ⏳ |
| T-064: Docker image | 3 | ⏳ |

> ⚠️ Note: Sprint 17 includes 2026-12-25 (Christmas). Adjust if holiday.

**🏁 MILESTONE: Release Candidate (end of S17)** — All features tested, NFRs met.

### Phase 5: Deployment & Release (S18) — Weeks 35–36

#### Sprint 18: Deploy + UAT + Go-Live (2026-12-29 → 2027-01-09)
**Velocity:** 13 SP | **Focus:** Azure deployment + UAT
| Task | SP | Status |
|------|-----|--------|
| T-057: Document multi-select | 2 | ⏳ |
| T-065: Azure App Service deployment | 3 | ⏳ |
| T-066: Azure services provisioning (IaC) | 2 | ⏳ |
| T-067: UAT + bug fixes + go-live | 2 | ⏳ |
| Buffer: contingency | 4 | ⏳ |

**🏁 MILESTONE: GA (General Availability)** — Production launch.

---

## 4. Timeline & Milestones

| Milestone | Target Date | Sprint | Entry Criteria | Exit Criteria | Status |
|-----------|------------|--------|----------------|---------------|--------|
| Project Kickoff | 2026-05-05 | S1 | Team assigned, Azure resources provisioned | Scaffold builds, CI green | ⏳ |
| Alpha | 2026-08-07 | S7 | Upload → convert → merge → view pipeline | Core doc pipeline E2E working | ⏳ |
| Beta | 2026-10-02 | S11 | Annotation + search complete, AI index ready | Full doc workflow + annotations + search | ⏳ |
| Feature Complete | 2026-12-11 | S16 | All 38 FRs implemented | All features demo-able | ⏳ |
| Release Candidate | 2026-12-25 | S17 | NFR hardening + E2E tests + Docker | Security audit pass, tests green | ⏳ |
| GA | 2027-01-09 | S18 | UAT complete, deployment verified | Production live, stakeholder sign-off | ⏳ |

---

## 5. Architecture & Technical Approach

See [TDS: Technical Design Specification](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1644593229) for full architecture.

**Summary:**
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4 + Radix UI
- **Backend:** Node.js + Express 5 + TypeScript (shared types with frontend)
- **Database:** Azure SQL Database (Prisma ORM)
- **AI:** Azure OpenAI (gpt-4o-mini + text-embedding-3-small) via Vercel AI SDK
- **Search:** Azure AI Search (hybrid: semantic + BM25 + RRF)
- **Storage:** Azure Blob Storage (documents)
- **Auth:** Azure Entra ID (OIDC + PKCE) via MSAL React
- **Hosting:** Azure App Service / Container Apps (Docker)

---

## 6. Risk Register

| ID | Risk | Probability | Impact | Score | Mitigation | Owner | Status |
|----|------|-------------|--------|-------|------------|-------|--------|
| R-001 | Solo dev unavailable (illness, leave) | Medium | High | 6 | Buffer sprints absorb delays. Cross-train backup dev if available. | PM | ⏳ |
| R-002 | NUS Entra ID app registration delayed | Medium | High | 6 | Mock auth in dev. MSAL config is env-variable only. | NUS ITS | ⏳ |
| R-003 | Azure AI Search cost exceeds budget | Low | Medium | 3 | Fallback: PostgreSQL + full-text search for v1. | Dev | ⏳ |
| R-004 | EHS360 API never becomes available | Medium | Low | 3 | Manual upload workflow (already designed). | ORMC | ⏳ |
| R-005 | Scope creep from remaining 12 CLRs | Medium | Medium | 4 | Buffer absorbs ≤15% growth. Formal change process for larger. | PM | ⏳ |
| R-006 | pdf-lib critical bug discovered | Low | Medium | 2 | Fork or switch to pdfjs-based export. | Dev | ⏳ |
| R-007 | Performance issues with large PDFs (>100 pages) | Medium | Medium | 4 | Lazy page rendering, web worker extraction. Validated in spike. | Dev | ⏳ |

---

## 7. Resource Allocation

| Role | Count | Sprint Velocity | Allocation | Notes |
|------|-------|----------------|------------|-------|
| Full-Stack Developer (TS) | 1 | 13–15 SP/sprint | 100% | Frontend + Backend + AI + DevOps |

### Velocity Profile (Solo Dev)

| Phase | Sprints | Avg Velocity | Notes |
|-------|---------|-------------|-------|
| Foundation (S1–S3) | 3 | 13.3 SP | Scaffold + auth (high productivity) |
| Core (S4–S10) | 7 | 13.4 SP | File mgmt, conversion, viewer, annotation |
| Enhanced (S11–S15) | 5 | 13.8 SP | Search, AI/RAG, chat, export |
| Polish + Hardening (S16–S17) | 2 | 13.5 SP | Workflow, perf, security, testing |
| Deployment (S18) | 1 | 13 SP | Azure deploy + UAT + go-live |

---

## 8. Dependencies

### Internal Dependencies (Feature-to-Feature)

```
F0: Scaffold ──→ F1: Auth ──→ F2: Files ──→ F3: Conversion ──→ F4: Merge
                                                                    │
                                                                    ▼
                                               F5: PDF Viewer ──→ F6: Annotation
                                                    │                    │
                                                    ▼                    ▼
                                               F8: Search          F7: Comments
                                                    │
                                                    ▼
                                               F9: AI Chat ──→ F10: Admin
                                                    │
                                                    ▼
                                               F11: Workflow / Polish
                                                    │
                                                    ▼
                                               F12: Hardening ──→ F13: Deploy
```

### Critical Path
**F0 → F1 → F2 → F3 → F4 → F5 → F6 → F9 → F11 → F12 → F13**

Length: 18 sprints (no parallelism possible with 1 developer — critical path equals total plan).

### External Dependencies

| Dependency | Owner | Due Date | Status | Impact if Delayed |
|-----------|-------|----------|--------|------------------|
| NUS Azure Entra ID tenant + app registration | NUS ITS | Before S2 (2026-05-19) | ⏳ Pending | Mock auth, add real config later (low impact) |
| Azure subscription provisioning | NUS ITS / ORMC | Before S1 (2026-05-05) | ⏳ Pending | Blocks cloud resources (high impact) |
| EHS360 API documentation | ORMC | Before S16 (2026-12-11) | ❓ Blocked | Manual upload only (low impact) |
| Stamp image assets | ORMC / Design | Before S10 (2026-09-18) | ⏳ Pending | Use placeholder stamps (low impact) |

---

## 9. SDLC Phase Plan

| Phase | Sprint Range | Weeks | Activities | Exit Criteria |
|-------|-------------|-------|------------|---------------|
| Foundation | S1–S3 | 1–6 | Scaffold, auth, CI/CD, home page, sharing | Login works, dossier CRUD works |
| Core Development | S4–S10 | 7–20 | File mgmt, conversion, merge, viewer, annotation | Alpha: full doc pipeline E2E |
| Enhanced Features | S11–S15 | 21–30 | Search, AI RAG, chat, admin, export | Beta: all features implemented |
| Polish + Hardening | S16–S17 | 31–34 | Workflow, perf, security, E2E tests, Docker | RC: all tests pass |
| Deployment | S18 | 35–36 | Azure deploy, UAT, go-live | GA: production live |

---

## 10. Open Clarifications Impact

| CLR | Priority | Impact on Plan | Assumption if Unresolved |
|-----|----------|---------------|--------------------------|
| CLR-002 | P1 | Permission model (View/Edit/Download) | Assume 2 levels: View + Edit (Download = Edit) |
| CLR-003 | P1 | File upload limits | Assume 50MB/file, 500MB/dossier |
| CLR-007 | P1 | AI/RAG architecture | Assume Azure AI Search (as planned) |
| CLR-009 | P2 | EHS360 integration | Manual upload only |
| CLR-012 | P1 | Admin roles | Assume single admin role via config |
| CLR-006 | P2 | Notebook scope | Assume chat capture + manual notes + export |
| CLR-008 | P2 | Stamp defaults | Assume 5 generic stamps (Approved, Reviewed, etc.) |
| CLR-010 | P2 | EHS360 scope | Manual download/upload |
| CLR-011 | P2 | Error handling | Standard error boundaries + toast notifications |
| CLR-013 | P2 | User roles (RBAC) | Assume Owner + Shared (View/Edit) + Admin |
| CLR-014 | P2 | Audit logging | Assume basic activity log (who did what, when) |
| CLR-015 | P2 | Data retention | Assume indefinite retention, manual delete by owner |

**Planning assumption:** All P1 CLRs have reasonable defaults documented above. If stakeholder answers differ significantly, use `impact` command to assess schedule change.

---

## 11. Quality Gate

| Criteria | Status |
|----------|--------|
| ✅ All 38 approved FRs covered by tasks | 38/38 mapped |
| ✅ Sprint balance within ±20% velocity deviation | All sprints 13–15 SP (±7.4% max deviation) |
| ✅ All high risks have mitigations | 7/7 risks have mitigations |
| ✅ All milestones have entry/exit criteria | 6/6 milestones defined |
| ✅ Dependencies mapped, no circular references | DAG verified |
| ⚠️ 12 CLRs open but assumptions documented | Proceeding with defaults |
| Plan health score | **75%** (Needs Attention — CLR resolution would improve to 85%+) |

---

*Generated by Project Planning Agent — 2026-04-21*
*Next: `@5-product-owner create-stories` to export tasks as Azure DevOps work items*
