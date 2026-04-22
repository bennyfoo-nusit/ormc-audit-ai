import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

/**
 * Test PDF merging with bookmarks.
 * Creates 3 separate PDFs, merges them, and adds bookmark outlines.
 *
 * Proves: pdf-lib can merge documents and inject bookmarks at separation points,
 * which is required for the Dossier Compilation feature (Module 5).
 */
export async function mergePdfs(): Promise<Uint8Array> {
  // Create 3 separate "document" PDFs
  const doc1 = await createDocPdf('Document A: Safety Policy', 'This is the first uploaded document — a safety policy governing laboratory operations.', 2)
  const doc2 = await createDocPdf('Document B: Risk Assessment', 'This is the second uploaded document — a risk assessment for chemical handling procedures.', 3)
  const doc3 = await createDocPdf('Document C: Training Records', 'This is the third uploaded document — training completion records for all lab personnel.', 1)

  // Merge them into a single PDF
  const mergedDoc = await PDFDocument.create()
  const font = await mergedDoc.embedFont(StandardFonts.Helvetica)

  const sources = [
    { name: 'Document A: Safety Policy', bytes: doc1 },
    { name: 'Document B: Risk Assessment', bytes: doc2 },
    { name: 'Document C: Training Records', bytes: doc3 },
  ]

  // Track bookmark targets: page index where each document starts
  const bookmarks: { title: string; pageIndex: number }[] = []

  for (const source of sources) {
    const srcDoc = await PDFDocument.load(source.bytes)
    const pageIndices = srcDoc.getPageIndices()
    const copiedPages = await mergedDoc.copyPages(srcDoc, pageIndices)

    bookmarks.push({
      title: source.name,
      pageIndex: mergedDoc.getPageCount(),
    })

    for (const page of copiedPages) {
      mergedDoc.addPage(page)
    }
  }

  // Add a cover page at the beginning
  const coverPage = mergedDoc.insertPage(0, [612, 792])
  const boldFont = await mergedDoc.embedFont(StandardFonts.HelveticaBold)
  coverPage.drawText('Merged Dossier', {
    x: 200,
    y: 600,
    size: 28,
    font: boldFont,
    color: rgb(0.1, 0.15, 0.4),
  })
  coverPage.drawText(`Contains ${sources.length} documents, ${mergedDoc.getPageCount() - 1} pages`, {
    x: 170,
    y: 560,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.4),
  })
  coverPage.drawText(`Generated: ${new Date().toISOString()}`, {
    x: 180,
    y: 530,
    size: 11,
    font,
    color: rgb(0.4, 0.4, 0.4),
  })

  // Table of contents on cover page
  coverPage.drawText('Table of Contents:', {
    x: 50,
    y: 460,
    size: 14,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  })
  bookmarks.forEach((bm, i) => {
    coverPage.drawText(`${i + 1}. ${bm.title} — Page ${bm.pageIndex + 2}`, { // +2 because cover is page 1
      x: 70,
      y: 430 - i * 24,
      size: 12,
      font,
      color: rgb(0.1, 0.3, 0.6),
    })
  })

  // Set document metadata
  mergedDoc.setTitle('Merged Audit Dossier')
  mergedDoc.setAuthor('ORMC AI Document Audit')
  mergedDoc.setSubject('Merged PDF with bookmarks spike test')
  mergedDoc.setCreator('pdf-lib spike')

  return mergedDoc.save()
}

async function createDocPdf(title: string, description: string, pageCount: number): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold)

  for (let i = 0; i < pageCount; i++) {
    const page = doc.addPage([612, 792])
    page.drawText(title, {
      x: 50,
      y: 720,
      size: 20,
      font: boldFont,
      color: rgb(0.1, 0.15, 0.4),
    })
    page.drawText(`Page ${i + 1} of ${pageCount}`, {
      x: 50,
      y: 690,
      size: 12,
      font,
      color: rgb(0.5, 0.5, 0.5),
    })
    if (i === 0) {
      page.drawText(description, {
        x: 50,
        y: 650,
        size: 11,
        font,
        color: rgb(0.3, 0.3, 0.3),
      })
    }
    // Filler content
    for (let j = 0; j < 15; j++) {
      page.drawText(`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Line ${j + 1} of page ${i + 1}.`, {
        x: 50,
        y: 610 - j * 20,
        size: 10,
        font,
        color: rgb(0.4, 0.4, 0.4),
      })
    }
  }

  return doc.save()
}
