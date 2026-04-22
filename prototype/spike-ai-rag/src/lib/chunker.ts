/**
 * Spike: Text Chunking for RAG
 *
 * Splits extracted document text into overlapping chunks suitable
 * for embedding and retrieval. Preserves page references for citations.
 */

export interface DocumentChunk {
  id: string
  documentId: string
  documentName: string
  text: string
  pageNumbers: number[]
  chunkIndex: number
  charCount: number
  tags?: string[]
}

export interface ChunkingOptions {
  /** Target characters per chunk (default: 1000) */
  chunkSize: number
  /** Overlap between consecutive chunks (default: 200) */
  overlapSize: number
}

const DEFAULT_OPTIONS: ChunkingOptions = {
  chunkSize: 1000,
  overlapSize: 200,
}

/**
 * Split document text into overlapping chunks, preserving page boundaries.
 *
 * Strategy: Sliding window with overlap. Chunk boundaries prefer sentence
 * endings (. ! ?) to avoid cutting mid-sentence. Each chunk records which
 * pages it spans for citation.
 */
export function chunkDocument(
  documentId: string,
  documentName: string,
  pages: { pageNumber: number; text: string }[],
  tags: string[] = [],
  options: Partial<ChunkingOptions> = {},
): DocumentChunk[] {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const chunks: DocumentChunk[] = []

  // Build a continuous text with page markers
  const pageBreaks: { offset: number; pageNumber: number }[] = []
  let fullText = ''

  for (const page of pages) {
    pageBreaks.push({ offset: fullText.length, pageNumber: page.pageNumber })
    fullText += page.text + ' '
  }

  if (fullText.trim().length === 0) return chunks

  let start = 0
  let chunkIndex = 0

  while (start < fullText.length) {
    let end = Math.min(start + opts.chunkSize, fullText.length)

    // Try to break at sentence boundary
    if (end < fullText.length) {
      const searchStart = Math.max(end - 100, start)
      const segment = fullText.slice(searchStart, end)
      const sentenceEnd = Math.max(
        segment.lastIndexOf('. '),
        segment.lastIndexOf('! '),
        segment.lastIndexOf('? '),
        segment.lastIndexOf('.\n'),
      )
      if (sentenceEnd > 0) {
        end = searchStart + sentenceEnd + 2 // include the period + space
      }
    }

    const chunkText = fullText.slice(start, end).trim()
    if (chunkText.length === 0) break

    // Determine which pages this chunk spans
    const chunkPages = new Set<number>()
    for (let i = 0; i < pageBreaks.length; i++) {
      const pbStart = pageBreaks[i].offset
      const pbEnd =
        i + 1 < pageBreaks.length ? pageBreaks[i + 1].offset : fullText.length
      // Check if chunk overlaps with this page's text range
      if (start < pbEnd && end > pbStart) {
        chunkPages.add(pageBreaks[i].pageNumber)
      }
    }

    chunks.push({
      id: `${documentId}-chunk-${chunkIndex}`,
      documentId,
      documentName,
      text: chunkText,
      pageNumbers: Array.from(chunkPages).sort((a, b) => a - b),
      chunkIndex,
      charCount: chunkText.length,
      tags,
    })

    chunkIndex++
    // Move start forward with overlap
    start = Math.max(start + 1, end - opts.overlapSize)

    // Safety: if we didn't advance, force it
    if (start <= chunks[chunks.length - 1]?.chunkIndex && end >= fullText.length)
      break
  }

  return chunks
}

/**
 * Get chunking stats for logging
 */
export function getChunkingStats(chunks: DocumentChunk[]) {
  if (chunks.length === 0)
    return { count: 0, avgSize: 0, minSize: 0, maxSize: 0, totalChars: 0 }

  const sizes = chunks.map((c) => c.charCount)
  return {
    count: chunks.length,
    avgSize: Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length),
    minSize: Math.min(...sizes),
    maxSize: Math.max(...sizes),
    totalChars: sizes.reduce((a, b) => a + b, 0),
  }
}
