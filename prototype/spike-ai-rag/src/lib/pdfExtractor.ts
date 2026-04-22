/**
 * Spike: PDF Text Extraction using pdf.js
 *
 * Extracts text from PDF files page by page, producing structured
 * output with page numbers for citation references.
 */
import * as pdfjsLib from 'pdfjs-dist'

// Configure pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export interface ExtractedPage {
  pageNumber: number
  text: string
  charCount: number
}

export interface ExtractedDocument {
  fileName: string
  totalPages: number
  pages: ExtractedPage[]
  totalChars: number
  extractionTimeMs: number
}

/**
 * Extract text from a PDF file using pdf.js
 */
export async function extractTextFromPdf(
  file: File,
): Promise<ExtractedDocument> {
  const start = performance.now()
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  const pages: ExtractedPage[] = []
  let totalChars = 0

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()

    pages.push({
      pageNumber: i,
      text,
      charCount: text.length,
    })
    totalChars += text.length
  }

  return {
    fileName: file.name,
    totalPages: pdf.numPages,
    pages,
    totalChars,
    extractionTimeMs: performance.now() - start,
  }
}
