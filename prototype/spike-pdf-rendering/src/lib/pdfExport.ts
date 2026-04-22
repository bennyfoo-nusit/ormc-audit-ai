import { PDFDocument, PDFName, PDFString, PDFArray, PDFNumber, PDFDict, StandardFonts, rgb } from 'pdf-lib'
import type { Annotation } from '../components/AnnotationOverlay'
import type { Shape } from '../components/ShapeOverlay'

/**
 * Export a PDF with annotations and shapes embedded directly into the document.
 * Proves pdf-lib can modify existing PDFs to embed user annotations.
 *
 * Approach: Load original PDF → draw highlight rects + comment text + shapes → save
 */
export async function exportPdfWithAnnotations(
  originalPdf: Uint8Array,
  annotations: Annotation[],
  shapes: Shape[],
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(originalPdf)
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const pages = pdfDoc.getPages()

  // Draw annotations: tag badge on left margin, comment text on right margin, at the annotation's Y position
  for (const ann of annotations) {
    const pageIndex = ann.page - 1
    if (pageIndex < 0 || pageIndex >= pages.length) continue
    const page = pages[pageIndex]
    const { width, height } = page.getSize()

    // Use first rect position if available, otherwise fallback
    const firstRect = ann.rects?.[0]
    // PDF y-axis is bottom-up; rects are stored top-down from screen
    const pdfY = firstRect
      ? height - firstRect.y - firstRect.height
      : height - 60

    const tagStr = ann.tags.length > 0 ? `[${ann.tags.join(',')}]` : '[COMM]'
    const commentStr = ann.comment || ann.text.slice(0, 50)

    // -- Left margin: tag badge --
    const tagWidth = boldFont.widthOfTextAtSize(tagStr, 7) + 8
    page.drawRectangle({
      x: 4,
      y: pdfY - 2,
      width: tagWidth,
      height: 12,
      color: rgb(1, 0.92, 0.8),
      opacity: 0.9,
      borderColor: rgb(0.9, 0.7, 0.3),
      borderWidth: 0.5,
    })
    page.drawText(tagStr, {
      x: 8,
      y: pdfY,
      size: 7,
      font: boldFont,
      color: rgb(0.6, 0.2, 0),
    })

    // -- Right margin: native PDF popup annotation (sticky note) --
    const popupContent = `${tagStr} ${commentStr}\n\nSelected text: "${ann.text.slice(0, 200)}"`
    const iconX = width - 24
    const iconY = pdfY - 2

    // Create the Text annotation dict (sticky note icon + popup on click)
    const annotDict = pdfDoc.context.obj({
      Type: 'Annot',
      Subtype: 'Text',
      Rect: [iconX, iconY, iconX + 18, iconY + 18],
      Contents: PDFString.of(popupContent),
      T: PDFString.of(tagStr),             // author / title
      Name: 'Comment',                      // icon type: Comment, Note, Help, etc.
      C: [1, 0.85, 0],                      // icon color (yellow)
      CA: 1,                                 // opacity
      F: 4,                                  // Print flag
      Open: false,                           // popup closed by default
    })

    // Append annotation to the page's /Annots array
    const pageRef = page.ref
    const pageDict = pdfDoc.context.lookup(pageRef) as PDFDict
    let annots = pageDict.get(PDFName.of('Annots'))
    if (annots instanceof PDFArray) {
      annots.push(pdfDoc.context.register(annotDict))
    } else {
      const newAnnots = pdfDoc.context.obj([pdfDoc.context.register(annotDict)])
      pageDict.set(PDFName.of('Annots'), newAnnots)
    }

    // -- Highlight rects over the text --
    if (ann.rects) {
      for (const r of ann.rects) {
        page.drawRectangle({
          x: r.x,
          y: height - r.y - r.height,
          width: r.width,
          height: r.height,
          color: rgb(1, 0.88, 0.2),
          opacity: 0.25,
        })
      }
    }
  }

  // Draw shapes (rectangles and circles)
  for (const shape of shapes) {
    const pageIndex = shape.page - 1
    if (pageIndex < 0 || pageIndex >= pages.length) continue
    const page = pages[pageIndex]
    const { height } = page.getSize()

    if (shape.type === 'rect') {
      page.drawRectangle({
        x: shape.x,
        y: height - shape.y - shape.height,
        width: shape.width,
        height: shape.height,
        borderColor: rgb(1, 0, 0),
        borderWidth: 2,
        color: rgb(1, 0, 0),
        opacity: 0.1,
      })
    } else if (shape.type === 'circle') {
      page.drawEllipse({
        x: shape.x + shape.width / 2,
        y: height - shape.y - shape.height / 2,
        xScale: shape.width / 2,
        yScale: shape.height / 2,
        borderColor: rgb(0, 0.4, 1),
        borderWidth: 2,
        color: rgb(0, 0.4, 1),
        opacity: 0.1,
      })
    }
  }

  // Add a footer note on first page
  if (pages.length > 0) {
    pages[0].drawText(
      `Exported with ${annotations.length} annotations and ${shapes.length} shapes — ${new Date().toISOString()}`,
      { x: 30, y: 20, size: 8, font, color: rgb(0.5, 0.5, 0.5) },
    )
  }

  return pdfDoc.save()
}
