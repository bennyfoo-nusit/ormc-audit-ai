# Prototype Configuration — AI Document Audit

## Current Prototype Configuration

| Field | Value |
|-------|-------|
| Project Name | ORMC AI Document Audit |
| Description | AI-powered document audit platform for Principal Investigators to review, annotate, and query large document sets with AI assistance |
| Domain | Risk Management and Compliance |
| Business Owner | ORMC (Office of Risk Management and Compliance), NUS |
| Tech Stack (Mockup) | React 19 + TypeScript + Vite + Tailwind CSS v4 + Radix UI/shadcn |
| Platform | Web Application |
| Deployment | TBD (Cloud — likely Azure given NUS context) |

## Input Sources

| Source | Status | Details |
|--------|--------|---------|
| Confluence Discovery | ✅ Fetched | Page 1578860576 — "Discovery: AI Document Audit" |
| UI Reference (Design) | ✅ Analyzed | `/design/ormc-ai-audit-homepa/` — 11 screens, 18 components |
| PRD | ✅ Analyzed | `/design/ormc-ai-audit-homepa/PRD.md` — full product requirements |

## Functional Modules (from Discovery)

| # | Module | Sub-capabilities | Complexity |
|---|--------|-----------------|------------|
| 1 | User Authentication & Sharing | Login, permission-based sharing (View/Edit/Download) | Medium |
| 2 | File Management | Bulk upload, download/export with findings, zip handling | High |
| 3 | Document Conversion | Smart sizing (large xlsx), convert all to PDF | High |
| 4 | Document Tagging | AI auto-tagging, admin-set prompts, manual tags, tag-based search | High |
| 5 | Dossier Compilation | PDF merging with bookmarks, document insertion | Medium |
| 6 | Display & Navigation | PDF viewing, bookmark nav, tag filtering, notebook capture | Medium |
| 7 | Annotation | Text annotation, shape annotation, stamp annotation | High |
| 8 | Smart Search | Keyword search, tag/element search with bookmark highlights | Medium |
| 9 | AI Chat & Query | Web search, document chat with filters, multi-agent window | High |

## Top Risk Capabilities (Spike Candidates)

| # | Capability | Risk Level | Why |
|---|-----------|------------|-----|
| 1 | PDF Rendering + Annotation on Web | **Critical** | Core UX — must support viewing, annotation, shapes, stamps on real PDFs; mockup is simulated |
| 2 | Document Conversion to PDF | **High** | Must handle xlsx, docx, and other formats; large file smart sizing is non-trivial |
| 3 | AI RAG Pipeline (Chat + Search) | **High** | Needs Azure OpenAI + vector search over uploaded documents; multi-agent architecture |
| 4 | PDF Export with Annotations | **High** | Must embed annotations/shapes back into PDF for download — not trivial |
| 5 | Document Merging with Bookmarks | **Medium** | Merging PDFs while preserving/generating bookmarks at separation points |

## Constraints

- Data isolation: users can only see their own documents by default
- NUS SSO integration required (assumed SAML/OIDC)
- Human-in-the-loop: AI assists but humans remain in control
- Admin-configurable AI prompts for audit activities
- Source documents come from EHS360 (external system)

## Progress

- Confluence Discovery: ✅
- UI Reference Analysis: ✅
- Tech Stack Detection: ✅
- Scaffold: ❌
- Spikes: 2/5 (PDF Rendering ✅, Document Conversion ✅)
- Integration Check: ❌
- Benchmarks: ❌
- Security Check: ❌
- Cost Estimate: ❌
- Decision (ADR): ❌
