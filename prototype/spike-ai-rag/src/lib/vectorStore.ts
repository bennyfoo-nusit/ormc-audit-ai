/**
 * Spike: Embedding Generation + In-Memory Vector Store
 *
 * Uses Azure OpenAI embeddings for vector generation and a simple
 * in-memory vector store with cosine similarity search.
 *
 * Production would use Azure AI Search or similar managed service.
 * This spike validates the embedding → search → retrieve flow.
 */

import type { DocumentChunk } from './chunker'

export interface EmbeddedChunk extends DocumentChunk {
  embedding: number[]
}

export interface SearchResult {
  chunk: DocumentChunk
  score: number
}

export interface VectorStoreStats {
  totalChunks: number
  totalDocuments: number
  documentNames: string[]
  dimensions: number
  indexedAt: string
}

/**
 * Generate embeddings via Azure OpenAI API
 *
 * Model: text-embedding-3-small (1536 dimensions, $0.02/1M tokens)
 * Alternative: text-embedding-3-large (3072 dimensions, higher accuracy)
 */
export async function generateEmbedding(
  text: string,
  apiKey: string,
  endpoint: string,
  deploymentName: string = 'text-embedding-3-small',
): Promise<number[]> {
  const url = `${endpoint}/openai/deployments/${deploymentName}/embeddings?api-version=2024-06-01`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      input: text,
      model: deploymentName,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Embedding API error ${response.status}: ${error}`)
  }

  const data = await response.json()
  return data.data[0].embedding
}

/**
 * Generate embeddings for multiple chunks with batching
 *
 * Azure OpenAI supports up to 16 inputs per batch for embedding models.
 */
export async function generateEmbeddings(
  chunks: DocumentChunk[],
  apiKey: string,
  endpoint: string,
  deploymentName: string = 'text-embedding-3-small',
  onProgress?: (completed: number, total: number) => void,
): Promise<EmbeddedChunk[]> {
  const batchSize = 16
  const results: EmbeddedChunk[] = []

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize)
    const url = `${endpoint}/openai/deployments/${deploymentName}/embeddings?api-version=2024-06-01`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        input: batch.map((c) => c.text),
        model: deploymentName,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Embedding batch error ${response.status}: ${error}`)
    }

    const data = await response.json()
    for (let j = 0; j < batch.length; j++) {
      results.push({
        ...batch[j],
        embedding: data.data[j].embedding,
      })
    }

    onProgress?.(Math.min(i + batchSize, chunks.length), chunks.length)
  }

  return results
}

/**
 * In-memory vector store with cosine similarity search.
 *
 * This is a throwaway spike implementation. Production should use:
 * - Azure AI Search (vector + hybrid search, managed, scalable)
 * - PostgreSQL + pgvector (self-hosted, good for moderate scale)
 * - Pinecone / Qdrant (specialized vector DBs)
 */
export class InMemoryVectorStore {
  private chunks: EmbeddedChunk[] = []

  get stats(): VectorStoreStats {
    const docNames = [...new Set(this.chunks.map((c) => c.documentName))]
    return {
      totalChunks: this.chunks.length,
      totalDocuments: docNames.length,
      documentNames: docNames,
      dimensions: this.chunks[0]?.embedding.length ?? 0,
      indexedAt: new Date().toISOString(),
    }
  }

  /** Add embedded chunks to the store */
  addChunks(chunks: EmbeddedChunk[]): void {
    this.chunks.push(...chunks)
  }

  /** Remove all chunks for a specific document */
  removeDocument(documentId: string): void {
    this.chunks = this.chunks.filter((c) => c.documentId !== documentId)
  }

  /** Clear all chunks */
  clear(): void {
    this.chunks = []
  }

  /**
   * Search for similar chunks using cosine similarity.
   *
   * Supports optional tag filtering (AND logic) — matches the
   * requirement from FR-010 (AI uses tags to filter search).
   */
  search(
    queryEmbedding: number[],
    topK: number = 5,
    options?: {
      /** Only return chunks from these documents */
      documentIds?: string[]
      /** Only return chunks with ALL of these tags */
      tags?: string[]
      /** Minimum similarity score (0-1, default: 0.3) */
      minScore?: number
    },
  ): SearchResult[] {
    let candidates = this.chunks

    // Filter by document IDs
    if (options?.documentIds?.length) {
      candidates = candidates.filter((c) =>
        options.documentIds!.includes(c.documentId),
      )
    }

    // Filter by tags (AND logic per FR-015 / BR-024)
    if (options?.tags?.length) {
      candidates = candidates.filter((c) =>
        options.tags!.every((tag) => c.tags?.includes(tag)),
      )
    }

    const minScore = options?.minScore ?? 0.3

    // Compute cosine similarity for all candidates
    const scored: SearchResult[] = candidates
      .map((chunk) => ({
        chunk,
        score: cosineSimilarity(queryEmbedding, chunk.embedding),
      }))
      .filter((r) => r.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)

    return scored
  }

  /**
   * Keyword search (BM25-style) for hybrid retrieval.
   * Simple TF-based scoring — production would use Elasticsearch/Azure AI Search.
   */
  keywordSearch(
    query: string,
    topK: number = 5,
    options?: {
      documentIds?: string[]
      tags?: string[]
    },
  ): SearchResult[] {
    const queryTokens = tokenize(query)
    if (queryTokens.length === 0) return []

    let candidates = this.chunks as DocumentChunk[]

    if (options?.documentIds?.length) {
      candidates = candidates.filter((c) =>
        options.documentIds!.includes(c.documentId),
      )
    }

    if (options?.tags?.length) {
      candidates = candidates.filter((c) =>
        options.tags!.every((tag) => c.tags?.includes(tag)),
      )
    }

    const scored: SearchResult[] = candidates
      .map((chunk) => {
        const chunkTokens = tokenize(chunk.text)
        let matches = 0
        for (const qt of queryTokens) {
          for (const ct of chunkTokens) {
            if (ct.includes(qt) || qt.includes(ct)) {
              matches++
              break
            }
          }
        }
        return {
          chunk,
          score: matches / queryTokens.length, // simple recall-based score
        }
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)

    return scored
  }

  /**
   * Hybrid search: combine semantic + keyword results using Reciprocal Rank Fusion.
   *
   * RRF is the standard approach used by Azure AI Search for hybrid queries.
   * Score_RRF = Σ 1/(k + rank_i) where k is a constant (default 60).
   */
  hybridSearch(
    queryEmbedding: number[],
    queryText: string,
    topK: number = 5,
    options?: {
      documentIds?: string[]
      tags?: string[]
      /** RRF constant k (default: 60) */
      rrfK?: number
    },
  ): SearchResult[] {
    const k = options?.rrfK ?? 60
    const semanticResults = this.search(queryEmbedding, topK * 2, options)
    const keywordResults = this.keywordSearch(queryText, topK * 2, options)

    // Build RRF scores
    const rrfScores = new Map<string, { chunk: DocumentChunk; score: number }>()

    semanticResults.forEach((r, rank) => {
      const key = r.chunk.id
      const existing = rrfScores.get(key) ?? { chunk: r.chunk, score: 0 }
      existing.score += 1 / (k + rank + 1)
      rrfScores.set(key, existing)
    })

    keywordResults.forEach((r, rank) => {
      const key = r.chunk.id
      const existing = rrfScores.get(key) ?? { chunk: r.chunk, score: 0 }
      existing.score += 1 / (k + rank + 1)
      rrfScores.set(key, existing)
    })

    return Array.from(rrfScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
  }
}

// --- Utility functions ---

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0
  let dotProduct = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB)
  return denominator === 0 ? 0 : dotProduct / denominator
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2)
}
