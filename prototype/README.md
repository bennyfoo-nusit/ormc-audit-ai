# Prototype — ORMC AI Document Audit

## Status: Initialized

**Last updated:** 2026-04-08

## Overview

AI-powered document audit platform for NUS Principal Investigators (PIs) to review, annotate, and query large document sets with AI assistance. Governed by ORMC (Office of Risk Management and Compliance).

## Input Sources

| Source | Location | Status |
|--------|----------|--------|
| Confluence Discovery | [Page 1578860576](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit) | ✅ Fetched |
| UI Mockup (Design) | `/design/ormc-ai-audit-homepa/` | ✅ Analyzed |

## Generated Artifacts

| Artifact | Path |
|----------|------|
| Prototype Config | `/docs/prototype/prototype-config.md` |
| Detected Tech Stack | `/docs/prototype/detected-stack.md` |
| UI Reference Analysis | `/docs/prototype/ui-reference-analysis.md` |
| Confluence Sources | `/docs/prototype/confluence-sources.md` |
| Spike: PDF Rendering | `/docs/prototype/spike-pdf-rendering.md` |
| Spike: Document Conversion | `/docs/prototype/spike-doc-conversion.md` |

## Spikes

| # | Spike | Status | Recommendation |
|---|-------|--------|----------------|
| 1 | PDF Rendering + Annotation | ✅ Build verified | **Continue** — `react-pdf` + `pdf-lib` covers viewing, annotation, shapes, export, merge |
| 2 | Document Conversion to PDF | ✅ Build verified | **Continue** — mammoth + SheetJS + jsPDF client-side; LibreOffice server for PPTX |
| 3 | AI RAG Pipeline | ❌ Not started | |
| 4 | PDF Export with Annotations | ✅ Covered in Spike 1 | `pdf-lib` embeds annotations/shapes back into PDF |
| 5 | Document Merging with Bookmarks | ✅ Covered in Spike 1 | `pdf-lib` `copyPages()` + cover page + ToC |

## Next Steps

Run the following commands to continue the feasibility assessment:

1. ~~`spike pdf-rendering`~~ — ✅ Done (react-pdf + pdf-lib)
2. ~~`spike document-conversion`~~ — ✅ Done (mammoth + SheetJS + pdf-lib + LibreOffice)
3. `spike ai-rag-pipeline` — Validate Azure OpenAI + vector search for document Q&A
4. `check-integrations` — Verify NUS SSO, Azure services, EHS360 connectivity
5. `benchmark` — Baseline performance for PDF rendering and AI response times
6. `security-check` — CVE scan, license audit, OWASP assessment
7. `estimate-cost` — Cloud infrastructure and licensing costs
8. `decide` — Go/no-go ADR
