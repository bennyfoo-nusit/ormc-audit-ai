# Spike: Document Conversion to PDF

**Status:** ✅ Pass
**Objective:** Validate that the proposed tech stack can convert DOCX, XLSX, PPTX, and image files to PDF — including smart sizing for large/wide spreadsheets — using a combination of client-side and server-side approaches.
**Approach:** Built a React + Vite prototype with four conversion pipelines (DOCX, XLSX, Image, PPTX), tested build/run, validated smart sizing, documented library choices and trade-offs.

## Results

### DOCX → PDF (Client-Side) ✅
- **Libraries:** `mammoth` v1.12.0 (DOCX → HTML) + `html2canvas` v1.4.1 + `jsPDF` v2.5.2
- **What worked:** mammoth reliably parses .docx files including headings, lists, tables, and images, producing clean semantic HTML. html2canvas renders the HTML and jsPDF creates multi-page PDFs with page overflow handling.
- **Limitations:** Output is image-based (rasterized HTML) — text in the PDF is not selectable. Formatting fidelity depends on browser rendering, not original Word styles. No support for .doc (legacy binary format) via mammoth alone.
- **License:** mammoth (BSD-2-Clause ✅), jsPDF (MIT ✅), html2canvas (MIT ✅)
- **Recommendation:** ✅ Continue — suitable for audit workflow where fidelity to original formatting is less critical than content accuracy.

### XLSX → PDF (Client-Side) ✅
- **Libraries:** `xlsx` (SheetJS) v0.18.5 + `jspdf-autotable` v3.8.4
- **What worked:** SheetJS reads all spreadsheet formats (xlsx, xls, csv, ods). jspdf-autotable generates well-formatted PDF tables with smart column sizing, page breaks, and headers.
- **Smart sizing implemented:**
  - Auto-detect column count → switch to landscape for >6 columns
  - Auto-switch to A3 page size for >12 columns
  - Dynamic font size reduction (10pt → 6pt) based on column density
  - Per-column width optimization (sample first 100 rows, cap at 40mm for very wide columns)
  - Multi-sheet support with sheet name headers and metadata
  - Page footer with sheet name and page number
- **Large file handling:** Tested with 2000-row × 8-column spreadsheets. jspdf-autotable handles pagination automatically. Warning emitted for >1000 rows.
- **License:** xlsx (Apache-2.0 ✅), jspdf-autotable (MIT ✅)
- **Recommendation:** ✅ Continue — robust client-side solution with good smart sizing.

### Image → PDF (Client-Side) ✅
- **Libraries:** `pdf-lib` v1.17.1 (already in the stack from spike 1)
- **What worked:** PNG and JPEG embedded directly. WebP, GIF, BMP, TIFF converted to PNG via Canvas API before embedding. Smart orientation detection (landscape image → landscape page). Preserves aspect ratio with A4 margins.
- **Multi-image support:** Batch convert multiple images into a single PDF (one image per page).
- **License:** pdf-lib (MIT ✅)
- **Recommendation:** ✅ Continue — trivial and reliable.

### PPTX → PDF (Server-Side) ⚠️
- **Libraries:** `libreoffice-convert` v1.8.1 (wraps LibreOffice headless)
- **What worked:** Express server with multer for file upload, libreoffice-convert handles PPTX → PDF conversion. Also serves as a universal fallback for any format LibreOffice can handle.
- **Limitations:** Requires LibreOffice installed on the server (or in Docker container). Not suitable for purely client-side deployment. Adds infrastructure dependency.
- **License:** libreoffice-convert (MIT ✅), LibreOffice (MPL-2.0 ✅)
- **Recommendation:** ⚠️ Partial — PPTX conversion is viable but requires server infrastructure. For the ORMC audit use case, PPTX is unlikely to be a primary format. Consider making this an optional/degraded feature.

## Architecture

```
┌──────────────────────────────────────────────────┐
│                   Browser (React)                 │
│                                                   │
│  ┌─────────┐  ┌──────────┐  ┌─────────────────┐ │
│  │ mammoth  │  │  SheetJS  │  │    pdf-lib      │ │
│  │ DOCX→HTML│  │ XLSX→Data │  │  Image→PDF      │ │
│  └────┬─────┘  └─────┬─────┘  └────────┬────────┘ │
│       │              │                  │          │
│  ┌────▼─────┐  ┌─────▼──────┐          │          │
│  │html2canvas│  │jspdf-auto  │          │          │
│  │+ jsPDF   │  │  table     │          │          │
│  └────┬─────┘  └─────┬──────┘          │          │
│       │              │                  │          │
│       └──────────────┼──────────────────┘          │
│                      ▼                             │
│              PDF Preview / Download                │
└──────────────────────────────────────────────────┘
                       │
          (PPTX / unknown formats only)
                       ▼
┌──────────────────────────────────────────────────┐
│           Server (Express + LibreOffice)           │
│  POST /api/convert → libreoffice-convert → PDF     │
└──────────────────────────────────────────────────┘
```

## Files

| File | Purpose |
|------|---------|
| `prototype/spike-doc-conversion/src/App.tsx` | Main UI: file upload, format detection, conversion log, PDF preview |
| `prototype/spike-doc-conversion/src/lib/docxConverter.ts` | DOCX → PDF (mammoth + html2canvas + jsPDF) |
| `prototype/spike-doc-conversion/src/lib/xlsxConverter.ts` | XLSX → PDF (SheetJS + jspdf-autotable) with smart sizing |
| `prototype/spike-doc-conversion/src/lib/imageConverter.ts` | Image → PDF (pdf-lib + Canvas API) |
| `prototype/spike-doc-conversion/src/lib/sampleFiles.ts` | Test data generators (sample XLSX files) |
| `prototype/spike-doc-conversion/server/index.ts` | Express server for LibreOffice-based PPTX conversion |

## Dependencies

| Package | Version | License | Purpose | Client/Server |
|---------|---------|---------|---------|---------------|
| mammoth | 1.12.0 | BSD-2-Clause | DOCX → HTML | Client |
| xlsx (SheetJS) | 0.18.5 | Apache-2.0 | Spreadsheet parsing | Client |
| jspdf | 2.5.2 | MIT | PDF generation | Client |
| jspdf-autotable | 3.8.4 | MIT | Table layout in PDF | Client |
| html2canvas | 1.4.1 | MIT | HTML → Canvas rendering | Client |
| pdf-lib | 1.17.1 | MIT | Image → PDF, PDF manipulation | Client |
| libreoffice-convert | 1.8.1 | MIT | Universal conversion (PPTX) | Server |
| express | 5.1.0 | MIT | API server | Server |

## Blockers
- **PPTX client-side:** No viable client-side JavaScript library exists for PPTX → PDF conversion. Server-side LibreOffice is the only reliable option.
- **DOCX text selectability:** html2canvas produces image-based PDFs. For text-selectable DOCX→PDF, would need either LibreOffice server-side or a more sophisticated layout engine.
- **.doc legacy format:** mammoth only supports .docx (Office Open XML). The older .doc binary format requires LibreOffice or a commercial library.

## Build Metrics

| Metric | Value |
|--------|-------|
| npm install | ~7s, 274 packages |
| TypeScript check | Clean (0 errors) |
| Vite build | ~2s |
| Bundle size | 2,185 KB (gzip: 701 KB) |
| Dev server start | ~112ms |

## Recommendation

**✅ Go — Client-side document conversion is feasible for the core audit formats.**

- DOCX and XLSX conversion are fully client-side with good library support
- Image conversion is trivial via pdf-lib (already in the stack)
- Smart sizing for large spreadsheets works well with auto-orientation and font scaling
- PPTX requires server-side LibreOffice — acceptable as an optional feature
- All licenses are permissive (MIT, BSD-2-Clause, Apache-2.0)
- For production, consider: (1) code-splitting to reduce bundle size, (2) Web Workers for large file conversion to avoid UI blocking, (3) server-side LibreOffice in Docker for universal format support
