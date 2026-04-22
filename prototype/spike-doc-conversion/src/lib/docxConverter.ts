import mammoth from 'mammoth';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ConversionResult {
  pdfBytes: Uint8Array;
  pageCount: number;
  warnings: string[];
  duration: number;
}

// Layout constants
const CONTAINER_WIDTH_PX = 794; // A4 width at ~96 DPI
const CANVAS_SCALE = 2; // render at 2× for quality
const A4_W_MM = 210;
const A4_H_MM = 297;
const MARGIN_MM = 10;
const CONTENT_W_MM = A4_W_MM - 2 * MARGIN_MM; // 190 mm usable
const CONTENT_H_MM = A4_H_MM - 2 * MARGIN_MM; // 277 mm usable

// How many source-pixels correspond to one PDF page's content height.
// CONTAINER_WIDTH_PX maps to CONTENT_W_MM, so 1 px = CONTENT_W_MM / CONTAINER_WIDTH_PX mm.
// PAGE_HEIGHT_PX = CONTENT_H_MM / (CONTENT_W_MM / CONTAINER_WIDTH_PX)
const PAGE_HEIGHT_PX = Math.floor(
  CONTENT_H_MM * (CONTAINER_WIDTH_PX / CONTENT_W_MM)
); // ≈ 1157 px

/**
 * Convert DOCX file to PDF using mammoth (DOCX→HTML) + html2canvas + jsPDF.
 *
 * Renders content in page-sized chunks via a clipped wrapper element so that:
 * - No content is truncated, even for very long documents.
 * - Browser canvas-height limits (~16 384 px) are never hit.
 * - Each PDF page contains exactly one chunk of the rendered HTML.
 */
export async function convertDocxToPdf(file: File): Promise<ConversionResult> {
  const start = performance.now();
  const warnings: string[] = [];

  // 1. Parse DOCX → HTML
  const arrayBuffer = await file.arrayBuffer();
  const mammothResult = await mammoth.convertToHtml(
    { arrayBuffer },
    {
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
      ],
    }
  );

  const html = mammothResult.value;
  mammothResult.messages.forEach((msg) => {
    warnings.push(`[mammoth] ${msg.type}: ${msg.message}`);
  });

  // 2. Build the full-height content element
  const content = document.createElement('div');
  content.style.position = 'relative';
  content.style.width = `${CONTAINER_WIDTH_PX}px`;
  content.style.boxSizing = 'border-box';
  content.style.padding = '10px 40px';
  content.style.fontFamily = 'Arial, sans-serif';
  content.style.fontSize = '12px';
  content.style.lineHeight = '1.6';
  content.style.backgroundColor = '#fff';
  content.style.color = '#000';
  content.innerHTML = `
    <style>
      * { word-wrap: break-word; overflow-wrap: break-word; }
      h1 { font-size: 24px; margin: 16px 0 8px; }
      h2 { font-size: 20px; margin: 14px 0 6px; }
      h3 { font-size: 16px; margin: 12px 0 4px; }
      p  { margin: 6px 0; }
      table { border-collapse: collapse; width: 100%; margin: 8px 0;
              table-layout: fixed; }
      th, td { border: 1px solid #ccc; padding: 4px 8px; text-align: left; }
      img { max-width: 100%; height: auto; }
      ul, ol { margin: 6px 0; padding-left: 24px; }
      pre, code { white-space: pre-wrap; }
    </style>
    ${html}
  `;

  // 3. One-page-high clip wrapper (overflow: hidden)
  const wrapper = document.createElement('div');
  wrapper.style.position = 'absolute';
  wrapper.style.left = '-9999px';
  wrapper.style.top = '0';
  wrapper.style.width = `${CONTAINER_WIDTH_PX}px`;
  wrapper.style.height = `${PAGE_HEIGHT_PX}px`;
  wrapper.style.overflow = 'hidden';
  wrapper.style.backgroundColor = '#fff';

  wrapper.appendChild(content);
  document.body.appendChild(wrapper);

  try {
    // Measure full content height after browser layout
    await new Promise((r) => requestAnimationFrame(r));
    const contentHeight = content.scrollHeight;
    const totalPages = Math.max(1, Math.ceil(contentHeight / PAGE_HEIGHT_PX));

    if (totalPages > 50) {
      warnings.push(
        `Long document (${totalPages} pages) — rendering may take a moment.`
      );
    }

    const pdf = new jsPDF('p', 'mm', 'a4');

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) pdf.addPage();

      // Shift content so the current page's slice is visible inside the clip wrapper
      content.style.marginTop = `${-page * PAGE_HEIGHT_PX}px`;
      await new Promise((r) => requestAnimationFrame(r));

      const canvas = await html2canvas(wrapper, {
        scale: CANVAS_SCALE,
        useCORS: true,
        logging: false,
        width: CONTAINER_WIDTH_PX,
        windowWidth: CONTAINER_WIDTH_PX,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      // Always render the full page height; last page just has white-space at the bottom
      pdf.addImage(
        imgData,
        'JPEG',
        MARGIN_MM,
        MARGIN_MM,
        CONTENT_W_MM,
        CONTENT_H_MM
      );

      // Page footer
      pdf.setFontSize(8);
      pdf.setTextColor(150);
      pdf.text(
        `Page ${page + 1} of ${totalPages}`,
        A4_W_MM / 2,
        A4_H_MM - 5,
        { align: 'center' }
      );
      pdf.setTextColor(0);
    }

    const pdfBytes = pdf.output('arraybuffer');
    const duration = performance.now() - start;

    return {
      pdfBytes: new Uint8Array(pdfBytes),
      pageCount: totalPages,
      warnings,
      duration,
    };
  } finally {
    document.body.removeChild(wrapper);
  }
}

/**
 * Extract raw text from DOCX (useful for preview).
 */
export async function extractDocxText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

/**
 * Convert DOCX to HTML (useful for preview).
 */
export async function convertDocxToHtml(file: File): Promise<{ html: string; warnings: string[] }> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  return {
    html: result.value,
    warnings: result.messages.map((m) => `${m.type}: ${m.message}`),
  };
}
