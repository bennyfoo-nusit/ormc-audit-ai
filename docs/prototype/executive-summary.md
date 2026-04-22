# Executive Summary — ORMC AI Document Audit
**Date:** 2026-04-21
**Status:** ✅ Ready to Proceed

---

## 1. What We Evaluated

**Project:** AI-powered document audit platform for NUS Principal Investigators (PIs) to review, annotate, and query large document sets with AI assistance.

**Stack:** React 19 + TypeScript (Frontend) | Node.js + Express 5 (Backend) | Azure SQL Database (Data) | Azure OpenAI (AI)

**Platform:** Web Application | **Deployment:** Azure (App Service or Container Apps)

**Business Owner:** Office of Risk Management and Compliance (ORMC), NUS

---

## 2. Readiness Scorecard

| Area | Status | Summary |
|------|--------|---------|
| Tech Stack | ✅ Validated | React 19 + Vite + Tailwind + Radix UI. All builds clean, 0 TypeScript errors |
| Core Capabilities | ✅ 3/3 passed | PDF rendering + annotation, document conversion (4 formats), AI RAG pipeline (13 capabilities) |
| Integrations | ⚠️ 6/11 verified | Azure OpenAI, Confluence, ADO, GitHub, LibreOffice verified. 4 SDK-ready. 1 blocked (EHS360) |
| Security | ✅ Pass | 0 critical/high CVEs. All licenses permissive (MIT/Apache-2.0). 0 copyleft |
| Cost (AI Services) | ✅ ~$97–105/mo | Azure OpenAI ~$20–30/mo, AI Search ~$75/mo, Blob ~$2/mo, Bing ~$3/mo |
| Requirements | ✅ Analyzed | 38 FRs, 15 NFRs, 27 business rules. All 3 P0 architecture blockers resolved |

---

## 3. Recommendation

**Decision: ✅ GO**

All three high-risk capability spikes passed with working code. The proposed technology stack is technically feasible, uses only open-source permissively-licensed libraries, and has an estimated AI operating cost of ~$100/month. All critical architectural decisions (authentication, backend, database) are now confirmed. Development planning can proceed immediately.

---

## 4. What Was Proven

| Spike | What We Tested | Result |
|-------|---------------|--------|
| **PDF Rendering** | View real PDFs, text selection, annotations, shapes, export, merge | ✅ 6 capabilities validated |
| **Document Conversion** | DOCX → PDF, XLSX → PDF (smart sizing), Image → PDF, PPTX → PDF | ✅ 4 format pipelines validated |
| **AI RAG Pipeline** | PDF extraction → chunking → embedding → vector search → chat with citations | ✅ 13 capabilities validated |

---

## 5. Architecture Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Identity Provider | Azure Entra ID (OIDC) | NUS Azure alignment, MSAL React v5.3.0 |
| Backend | Node.js + Express 5 (TypeScript) | Full-stack TS, all Azure SDKs npm-native, already validated in spike |
| Database | Azure SQL Database | Team MS SQL expertise, Azure-first stack |
| AI Chat Model | Azure OpenAI gpt-4o-mini | $0.15/1M input tokens, 128K context, strong reasoning |
| AI Embeddings | text-embedding-3-small (1536D) | $0.02/1M tokens, good retrieval quality |
| Vector Search | Azure AI Search | Managed hybrid search (semantic + BM25 + RRF) |
| PDF Rendering | react-pdf + pdfjs-dist | MIT/Apache-2.0, 2.5M+ weekly downloads, React 19 support |
| PDF Modification | pdf-lib | MIT, 3.2M weekly downloads, merge/annotate/export |
| Document Storage | Azure Blob Storage | Native Azure integration, scalable, low cost |

---

## 6. Key Risks

| # | Risk | Impact | Mitigation |
|---|------|--------|------------|
| 1 | EHS360 API undocumented | Cannot auto-import source documents | Adapter pattern — develop without, integrate when API available |
| 2 | NUS tenant app registration pending | Auth not testable until provisioned | MSAL SDK validated; config-only change once tenant available |
| 3 | Azure AI Search not yet spiked | Production vector search untested | SDK is mature (v12.2.0); in-memory spike proved the search pattern |
| 4 | pdf-lib last published 4 years ago | Maintenance risk | Stable API, 3.2M downloads/week. Fork if critical bug found |

---

## 7. Cost Summary (Monthly)

| Component | Estimate |
|-----------|----------|
| Azure OpenAI (chat + embeddings, 50 PIs) | ~$20–30 |
| Azure AI Search (Basic tier) | ~$75 |
| Azure Blob Storage (100 GB) | ~$2 |
| Bing Search API | ~$3 |
| **AI + Storage Subtotal** | **~$100/month** |
| Azure App Service / SQL (TBD with infra sizing) | Estimated separately |

---

## 8. What Happens Next

| Step | Agent | Action |
|------|-------|--------|
| 1 | `@connectivity-agent` | Configure GitHub repo, Azure DevOps boards, Confluence spaces |
| 2 | `@3-requirement-analyst` | Finalize remaining 12 open CLRs, approve requirements |
| 3 | `@4-project-planning` | Sprint planning with effort estimates from spike learnings |
| 4 | `@5-product-owner` | Create Azure DevOps user stories from 38 FRs |
| 5 | `@6-developer` | Begin implementation (auth + core scaffold first) |

---

## 9. Artifacts Produced

| Artifact | Location |
|----------|----------|
| ADR: Tech Stack Selection | `/docs/prototype/adr/ADR-001-tech-stack-selection.md` |
| Spike: PDF Rendering | `/docs/prototype/spike-pdf-rendering.md` |
| Spike: Document Conversion | `/docs/prototype/spike-doc-conversion.md` |
| Spike: AI RAG Pipeline | `/docs/prototype/spike-ai-rag.md` |
| Integration Feasibility Report | `/docs/prototype/integration-check.md` |
| UI Reference Analysis | `/docs/prototype/ui-reference-analysis.md` |
| Detected Tech Stack | `/docs/prototype/detected-stack.md` |
| Requirements (38 FRs) | `/docs/requirements/functional/fr-all.md` |
| Non-Functional Reqs (15 NFRs) | `/docs/requirements/non-functional/nfr-all.md` |
| Gap Analysis (18 gaps) | `/docs/requirements/gap-analysis.md` |
| Clarifications (15 CLRs) | `/docs/requirements/clarifications.md` |
| Executive Summary | `/docs/prototype/executive-summary.md` |
