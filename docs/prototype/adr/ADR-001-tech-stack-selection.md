# ADR-001: Technology Stack Selection — ORMC AI Document Audit

## Status
**Accepted** — Go with conditions

## Date
2026-04-21

## Context
The Office of Risk Management and Compliance (ORMC) at the National University of Singapore (NUS) requires an AI-powered document audit platform enabling Principal Investigators (PIs) to review, annotate, and query large document sets with AI assistance. The application must support PDF viewing with annotations, document conversion from multiple formats, AI-powered search and chat over document content, and multi-user sharing with permission controls.

The team proposed a React + TypeScript frontend with Azure-based AI services and conducted a technical feasibility evaluation over three capability spikes, an integration check, and a requirements analysis before committing to a full SDLC cycle.

### Proposed Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite (SWC) |
| UI Framework | Radix UI + shadcn/ui + Tailwind CSS v4 |
| PDF Rendering | react-pdf 10.4.1 (pdfjs-dist 5.6.205) |
| PDF Modification | pdf-lib 1.17.1 |
| Doc Conversion | mammoth (DOCX), SheetJS (XLSX), pdf-lib (Image), LibreOffice (PPTX) |
| AI Chat | Azure OpenAI gpt-4o-mini via Vercel AI SDK |
| AI Embeddings | Azure OpenAI text-embedding-3-small (1536D) |
| Vector Search | Azure AI Search (production) / In-memory (spike) |
| Authentication | Azure Entra ID (OIDC + PKCE) via MSAL React 5.3.0 |
| Document Storage | Azure Blob Storage |
| Backend | Node.js + Express 5 (TypeScript) on Azure App Service / Container Apps |
| Database | Azure SQL Database (MSSQL) via mssql 12.3.1 + Prisma/TypeORM |

## Decision
**GO** — Proceed with the proposed technology stack, subject to the conditions listed below.

The stack is technically feasible. All three high-risk capability spikes passed. All required SDKs are available, actively maintained, and permissively licensed. Estimated AI operating costs are well within budget (~$20–30/month for 50 concurrent users). No critical or high-severity vulnerabilities were found in production dependencies.

### Conditions for Proceeding
1. ~~**Resolve CLR-001**~~ — ✅ Resolved: Azure Entra ID (OIDC + PKCE) confirmed. Use `@azure/msal-react` v5.3.0. Pending: NUS tenant ID + app registration.
2. ~~**Resolve CLR-004**~~ — ✅ Resolved: Node.js + Express 5 (TypeScript). Full-stack TS, all Azure SDKs npm-native, Express 5 validated in spike.
3. ~~**Resolve CLR-005**~~ — ✅ Resolved: Azure SQL Database (MSSQL). Team expertise + Azure alignment. Vector embeddings in Azure AI Search (hybrid architecture).
4. **Design EHS360 as adapter** — Use pluggable adapter pattern for EHS360 integration; develop without EHS360 API, add when CLR-009 resolves
5. **Target ai@6.x** — Production should use Vercel AI SDK v6 (spike validated on v4/v5 compat); migration is straightforward

## Evidence

### Scaffold
| Check | Result |
|-------|--------|
| Vite + React 19 + TypeScript project | ✅ Builds and runs (all 3 spikes) |
| Vite build time | ✅ 722ms–1,140ms across spikes |
| TypeScript strict mode | ✅ Clean — 0 errors |
| npm audit (production deps) | ✅ 0 critical/high vulnerabilities |
| Toolchain compatibility | ✅ Vite 6.4, SWC, React 19, Tailwind v4 all interoperable |

### Capability Spikes

| # | Capability | Status | Key Evidence |
|---|-----------|--------|-------------|
| 1 | PDF Rendering + Annotation | ✅ Pass | react-pdf v10.4.1 renders real PDFs with text selection, zoom, page nav. Custom SVG/HTML overlay layers for annotations and shapes. pdf-lib exports annotated PDFs. 6 capabilities validated. |
| 2 | Document Conversion to PDF | ✅ Pass | DOCX (mammoth), XLSX (SheetJS + smart sizing), Image (pdf-lib), PPTX (LibreOffice server-side). 4 format pipelines validated. Client-side for 3 of 4 formats. |
| 3 | AI RAG Pipeline (Chat + Search) | ✅ Pass | PDF text extraction → chunking (1000c/200 overlap) → embedding (text-embedding-3-small) → in-memory vector store (cosine + keyword + RRF hybrid) → RAG chat (gpt-4o-mini). 13 capabilities validated including tag-filtered retrieval, multi-agent prompts, web search, conversation history, AI document tagging. |

**Spike pass rate: 3/3 (100%)**

### Integration Feasibility

| Integration | Status | SDK | Notes |
|-------------|--------|-----|-------|
| Azure OpenAI (Chat) | ✅ Verified | @ai-sdk/azure 3.0.54 | gpt-4o-mini validated in spike |
| Azure OpenAI (Embeddings) | ✅ Verified | @ai-sdk/azure 3.0.54 | text-embedding-3-small validated |
| Azure AI Search | ⚠️ SDK available | @azure/search-documents 12.2.0 | Mature SDK, not yet spiked |
| Azure Blob Storage | ⚠️ SDK available | @azure/storage-blob 12.31.0 | Mature SDK (v12.31) |
| NUS SSO / Azure AD | ⚠️ SDK available | @azure/msal-react 5.3.0 | Standard for NUS; needs tenant config |
| Bing Web Search | ⚠️ SDK available | REST API | Minimal cost (~$3/1000 queries) |
| Confluence MCP | ✅ Verified | MCP native | Read/write pages confirmed |
| Azure DevOps MCP | ✅ Verified | MCP native | Work items accessible |
| GitHub MCP | ✅ Verified | MCP native | 2 repos accessible |
| LibreOffice | ✅ Verified | CLI (soffice) | PPTX→PDF server-side |
| EHS360 | ❓ Blocked | Unknown | No documentation, no SDK (CLR-009) |

**Verified: 6/11 | SDK Available: 4/11 | Blocked: 1/11**

### Security & Compliance

| Area | Status | Details |
|------|--------|---------|
| Vulnerability scan (npm audit) | ✅ Pass | 0 critical/high in production deps. 5 low in ai@4.x transitive deps (jsondiffpatch XSS) — fixed in ai@6.x |
| License audit | ✅ Pass | All MIT/Apache-2.0/BSD-2-Clause. 0 copyleft (GPL/AGPL/SSPL). LibreOffice MPL-2.0 (server tool, not bundled) |
| OWASP Top 10 coverage | ⚠️ Partial | Stack supports all OWASP mitigations (MSAL for auth, Azure managed services for infra). Full assessment deferred to production architecture |
| Data residency | ✅ | Azure Southeast Asia region available for all services |

### Cost Estimate (Azure AI Services Only)

| Component | Monthly Cost |
|-----------|-------------|
| Azure OpenAI — Chat (gpt-4o-mini, 22K queries) | ~$17–25 |
| Azure OpenAI — Embeddings (500 docs/month) | ~$0.10 |
| Azure AI Search (Basic tier) | ~$75 |
| Azure Blob Storage (100 GB) | ~$2 |
| Bing Search API (1000 queries) | ~$3 |
| **Total AI+Storage** | **~$97–105/month** |

> Full infrastructure cost estimate (App Service, database, networking) deferred to `estimate-cost` step after backend technology is confirmed.

### Requirements Coverage

| Metric | Count |
|--------|-------|
| Functional Requirements | 38 (across 19 feature areas) |
| Non-Functional Requirements | 15 |
| Business Rules | 27 |
| User Personas | 4 |
| Gaps Identified | 18 (3 Critical, 6 High, 7 Medium, 2 Low) |
| Clarifications Pending | 15 (3 P0, 4 P1, 8 P2+) |
| Readiness | ⚠️ Partially Ready — 3 Critical gaps block architecture decisions |

## Consequences

### Positive
- **Proven feasibility** — All 3 high-risk capabilities validated with working code
- **Zero commercial licensing** — Entire stack uses open-source libraries (MIT/Apache-2.0)
- **Low AI cost** — Azure OpenAI gpt-4o-mini + text-embedding-3-small = ~$20–30/month at expected load
- **Mature SDK ecosystem** — All Azure SDKs at v5–v12, actively maintained by Microsoft
- **UI validated** — Design mockup (11 screens, 40 UI primitives) provides clear implementation target
- **NUS alignment** — Azure-first stack aligns with NUS IT cloud strategy
- **Data residency** — Azure Southeast Asia region satisfies data residency requirements

### Negative / Risks
| Risk | Severity | Mitigation |
|------|----------|------------|
| 3 Critical gaps unresolved (Auth, Backend, Database) | High | Block sprint 1 planning until CLR-001, CLR-004, CLR-005 are resolved |
| EHS360 API unknown | Medium | Adapter pattern — develop without, integrate when available |
| pdf-lib last published 4 years ago | Low | API is stable, feature-complete, widely used (3.2M weekly downloads). Fork if critical bug found |
| DOCX→PDF produces image-based PDFs | Low | Acceptable for audit workflow (GAP-012). LibreOffice fallback for text-selectable output |
| PPTX conversion requires server-side LibreOffice | Low | PPTX is rare in audit workflows; Docker container with LibreOffice pre-installed |

## Alternatives Considered

| Alternative Stack | Reason Not Selected |
|-------------------|---------------------|
| Angular + .NET backend | Team expertise is React + TypeScript. Angular adds learning curve without clear benefit for this use case |
| Vue.js + FastAPI (Python) | Python backend stronger for ML/NLP, but Azure OpenAI SDK support is equal for Node.js. Vue.js is viable but React ecosystem is larger for PDF/doc libraries |
| Commercial PDF (PSPDFKit/Apryse) | $$$$ per-server licensing. Open-source stack proven sufficient in spike. Can upgrade later if needs expand |
| LangChain.js for RAG | Heavy dependency (LangChain ecosystem). Vercel AI SDK + custom chunker/store is simpler, lighter, and sufficient |
| PostgreSQL + pgvector | Viable lower-cost alternative to Azure AI Search. Recommended as fallback if Azure AI Search budget is constrained |

## Related Documents
- [Spike: PDF Rendering + Annotation](../prototype/spike-pdf-rendering.md)
- [Spike: Document Conversion](../prototype/spike-doc-conversion.md)
- [Spike: AI RAG Pipeline](../prototype/spike-ai-rag.md)
- [Integration Feasibility Report](../prototype/integration-check.md)
- [UI Reference Analysis](../prototype/ui-reference-analysis.md)
- [Detected Tech Stack](../prototype/detected-stack.md)
- [Requirements Summary](../requirements/requirements-summary.md)
- [Gap Analysis](../requirements/gap-analysis.md)
