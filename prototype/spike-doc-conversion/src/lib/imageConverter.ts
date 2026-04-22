import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface ConversionResult {
  pdfBytes: Uint8Array;
  pageCount: number;
  warnings: string[];
  duration: number;
}

// A4 in points (72 DPI)
const A4_W = 595.28;
const A4_H = 841.89;
const MARGIN = 36; // 0.5 inch

/**
 * If the image would need to be scaled below this factor to fit on a single
 * page, tile it across multiple pages at a more readable scale instead.
 */
const MIN_SINGLE_PAGE_SCALE = 0.25;

/**
 * Convert an image file (PNG, JPEG, WebP, GIF, BMP, TIFF) to PDF.
 *
 * Small/normal images → single page, centred, aspect-ratio preserved.
 * Very large or extreme-aspect images → tiled across multiple pages at
 * a readable scale so no detail is lost.
 */
export async function convertImageToPdf(file: File): Promise<ConversionResult> {
  const start = performance.now();
  const warnings: string[] = [];

  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdfDoc = await PDFDocument.create();

  const { image, format } = await embedImage(pdfDoc, bytes, file.type, file.name);
  warnings.push(`Detected format: ${format}`);

  const imgW = image.width;
  const imgH = image.height;

  // Pick orientation that best fits the image
  const isLandscape = imgW > imgH * 1.2;
  const pageW = isLandscape ? A4_H : A4_W;
  const pageH = isLandscape ? A4_W : A4_H;
  const availW = pageW - 2 * MARGIN;
  const availH = pageH - 2 * MARGIN;

  if (isLandscape) {
    warnings.push('Landscape image — using landscape page orientation');
  }

  const fitScale = Math.min(availW / imgW, availH / imgH, 1);

  if (fitScale >= MIN_SINGLE_PAGE_SCALE) {
    // ---------- Normal: fits comfortably on one page ----------
    const drawW = imgW * fitScale;
    const drawH = imgH * fitScale;
    const page = pdfDoc.addPage([pageW, pageH]);
    page.drawImage(image, {
      x: (pageW - drawW) / 2,
      y: (pageH - drawH) / 2,
      width: drawW,
      height: drawH,
    });
  } else {
    // ---------- Tiling: spread across multiple pages ----------
    // Use a scale that keeps details readable (at least 50 % of original,
    // but never larger than 1:1)
    const tileScale = Math.min(1, Math.max(0.5, MIN_SINGLE_PAGE_SCALE * 2));
    const scaledW = imgW * tileScale;
    const scaledH = imgH * tileScale;

    const colCount = Math.ceil(scaledW / availW);
    const rowCount = Math.ceil(scaledH / availH);

    warnings.push(
      `Image tiled across ${colCount}×${rowCount} = ${colCount * rowCount} pages (scale ${Math.round(tileScale * 100)}%)`
    );

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    for (let row = 0; row < rowCount; row++) {
      for (let col = 0; col < colCount; col++) {
        const page = pdfDoc.addPage([pageW, pageH]);

        // The portion of the *scaled* image this tile covers
        const srcX = col * availW;
        const srcY = row * availH;
        const tileW = Math.min(availW, scaledW - srcX);
        const tileH = Math.min(availH, scaledH - srcY);

        // In pdf-lib, drawImage draws the *whole* image stretched into the
        // given rect.  To show only a tile we draw the full image at the
        // correct offset and rely on page clipping.  pdf-lib does not clip,
        // so instead we must draw the whole scaled image at a negative offset
        // and accept that parts fall outside the visible page.  Those parts
        // are invisible in any PDF viewer (content outside the media box is
        // not rendered).

        // Position the full scaled image so that the current tile aligns
        // with the MARGIN area.
        const drawX = MARGIN - srcX;
        // PDF y-axis is bottom-up; we want the tile's top-left at
        // (MARGIN, pageH - MARGIN).
        const drawY = (pageH - MARGIN) - scaledH + srcY;

        page.drawImage(image, {
          x: drawX,
          y: drawY,
          width: scaledW,
          height: scaledH,
        });

        // Tile label
        const label = `Tile ${row * colCount + col + 1} of ${rowCount * colCount}  (row ${row + 1}/${rowCount}, col ${col + 1}/${colCount})`;
        page.drawText(label, {
          x: MARGIN,
          y: MARGIN - 12,
          size: 7,
          font,
          color: rgb(0.5, 0.5, 0.5),
        });

        // Light border around the visible tile area for clarity
        page.drawRectangle({
          x: MARGIN,
          y: pageH - MARGIN - tileH,
          width: tileW,
          height: tileH,
          borderColor: rgb(0.8, 0.8, 0.8),
          borderWidth: 0.5,
        });
      }
    }
  }

  pdfDoc.setTitle(file.name);
  pdfDoc.setCreator('ORMC Audit AI - Document Converter');

  const pdfBytes = await pdfDoc.save();
  const duration = performance.now() - start;

  return {
    pdfBytes: new Uint8Array(pdfBytes),
    pageCount: pdfDoc.getPageCount(),
    warnings,
    duration,
  };
}

/**
 * Convert multiple images into a single PDF (one image per page).
 */
export async function convertMultipleImagesToPdf(
  files: File[]
): Promise<ConversionResult> {
  const start = performance.now();
  const warnings: string[] = [];
  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { image } = await embedImage(pdfDoc, bytes, file.type, file.name);

      const imgW = image.width;
      const imgH = image.height;
      const isLandscape = imgW > imgH * 1.2;
      const pageW = isLandscape ? A4_H : A4_W;
      const pageH = isLandscape ? A4_W : A4_H;
      const availW = pageW - 2 * MARGIN;
      const availH = pageH - 2 * MARGIN;
      const scale = Math.min(availW / imgW, availH / imgH, 1);

      const page = pdfDoc.addPage([pageW, pageH]);
      page.drawImage(image, {
        x: (pageW - imgW * scale) / 2,
        y: (pageH - imgH * scale) / 2,
        width: imgW * scale,
        height: imgH * scale,
      });
    } catch (err) {
      warnings.push(`Failed to process ${file.name}: ${err}`);
    }
  }

  pdfDoc.setCreator('ORMC Audit AI - Document Converter');

  const pdfBytes = await pdfDoc.save();
  const duration = performance.now() - start;

  return {
    pdfBytes: new Uint8Array(pdfBytes),
    pageCount: pdfDoc.getPageCount(),
    warnings,
    duration,
  };
}

async function embedImage(
  pdfDoc: PDFDocument,
  bytes: Uint8Array,
  mimeType: string,
  fileName: string
) {
  // Try to detect format from content or MIME type
  if (mimeType === 'image/png' || fileName.toLowerCase().endsWith('.png')) {
    return { image: await pdfDoc.embedPng(bytes), format: 'PNG' };
  }

  if (
    mimeType === 'image/jpeg' ||
    mimeType === 'image/jpg' ||
    fileName.toLowerCase().endsWith('.jpg') ||
    fileName.toLowerCase().endsWith('.jpeg')
  ) {
    return { image: await pdfDoc.embedJpg(bytes), format: 'JPEG' };
  }

  // For other formats (WebP, GIF, BMP, TIFF), convert via Canvas first
  const converted = await convertViaCanvas(bytes, mimeType);
  return { image: await pdfDoc.embedPng(converted), format: `${mimeType} (converted via Canvas)` };
}

/**
 * Convert unsupported image formats to PNG using Canvas API.
 */
async function convertViaCanvas(bytes: Uint8Array, mimeType: string): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([bytes], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Could not get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) {
            reject(new Error('Canvas toBlob failed'));
            return;
          }
          blob.arrayBuffer().then((ab) => resolve(new Uint8Array(ab)));
        },
        'image/png'
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image as ${mimeType}`));
    };
    img.src = url;
  });
}
