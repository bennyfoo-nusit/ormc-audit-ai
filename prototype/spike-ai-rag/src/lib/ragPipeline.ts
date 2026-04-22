/**
 * Spike: RAG Chat Pipeline
 *
 * Implements the full Retrieve → Augment → Generate flow:
 * 1. User asks a question
 * 2. Question is embedded
 * 3. Similar chunks retrieved from vector store (with optional tag/doc filters)
 * 4. Retrieved context is assembled into a prompt
 * 5. LLM generates an answer with citations
 *
 * Also supports:
 * - Multi-agent prompt switching (FR-024)
 * - Web search augmentation (FR-022)
 * - Tag-filtered retrieval (FR-010)
 * - Conversation history (FR-023)
 */

import type { SearchResult } from './vectorStore'
import { InMemoryVectorStore, generateEmbedding } from './vectorStore'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  citations?: Citation[]
  agentName?: string
  usedWebSearch?: boolean
  webResults?: WebSearchResult[]
}

export interface Citation {
  documentName: string
  pageNumbers: number[]
  score: number
  snippet: string
}

export interface WebSearchResult {
  title: string
  snippet: string
  url: string
}

export interface AgentConfig {
  name: string
  systemPrompt: string
}

export interface ChatPipelineConfig {
  apiKey: string
  endpoint: string
  embeddingDeployment: string
  chatDeployment: string
  vectorStore: InMemoryVectorStore
}

/** Default document review agent */
const DEFAULT_AGENT: AgentConfig = {
  name: 'Document Agent',
  systemPrompt: `You are an AI audit assistant for the NUS Office of Risk Management and Compliance (ORMC). 
Your role is to help Principal Investigators (PIs) review safety and compliance documents.

RULES:
1. Answer ONLY based on the provided document context. If the answer is not in the context, say so.
2. Always cite your sources with [Document Name, Page X].
3. Be precise and factual — this is for compliance auditing.
4. If a question is ambiguous, ask for clarification.
5. Summarize concisely but do not omit important details.
6. Highlight any potential compliance concerns or gaps you notice.`,
}

/**
 * Execute the RAG pipeline for a single query.
 *
 * Steps:
 * 1. Embed the user query
 * 2. Retrieve top-K relevant chunks (hybrid search)
 * 3. Build the augmented prompt with context
 * 4. Call the LLM to generate an answer
 * 5. Return the response with citations
 */
export async function ragQuery(
  query: string,
  config: ChatPipelineConfig,
  options?: {
    agent?: AgentConfig
    conversationHistory?: ChatMessage[]
    documentIds?: string[]
    tags?: string[]
    topK?: number
    enableWebSearch?: boolean
  },
): Promise<ChatMessage> {
  const agent = options?.agent ?? DEFAULT_AGENT
  const topK = options?.topK ?? 5

  // Step 1: Embed the query
  const queryEmbedding = await generateEmbedding(
    query,
    config.apiKey,
    config.endpoint,
    config.embeddingDeployment,
  )

  // Step 2: Hybrid search (semantic + keyword)
  const results = config.vectorStore.hybridSearch(
    queryEmbedding,
    query,
    topK,
    {
      documentIds: options?.documentIds,
      tags: options?.tags,
    },
  )

  // Step 3: Build context from retrieved chunks
  const context = buildContext(results)
  const citations = buildCitations(results)

  // Step 4: Optionally fetch web results
  let webResults: WebSearchResult[] | undefined
  if (options?.enableWebSearch) {
    webResults = await simulateWebSearch(query, config)
  }

  // Step 5: Build the full prompt
  const systemMessage = buildSystemMessage(agent, context, webResults)
  const messages = buildMessages(
    systemMessage,
    options?.conversationHistory ?? [],
    query,
  )

  // Step 6: Call LLM
  const response = await callChatCompletion(
    messages,
    config.apiKey,
    config.endpoint,
    config.chatDeployment,
  )

  return {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: response,
    timestamp: new Date(),
    citations,
    agentName: agent.name,
    usedWebSearch: options?.enableWebSearch,
    webResults,
  }
}

// --- Internal helpers ---

function buildContext(results: SearchResult[]): string {
  if (results.length === 0) {
    return 'No relevant document context was found for this query.'
  }

  return results
    .map((r, i) => {
      const pages = r.chunk.pageNumbers.join(', ')
      return `[Source ${i + 1}: ${r.chunk.documentName}, Page ${pages}]\n${r.chunk.text}`
    })
    .join('\n\n---\n\n')
}

function buildCitations(results: SearchResult[]): Citation[] {
  return results.map((r) => ({
    documentName: r.chunk.documentName,
    pageNumbers: r.chunk.pageNumbers,
    score: Math.round(r.score * 100) / 100,
    snippet: r.chunk.text.slice(0, 150) + (r.chunk.text.length > 150 ? '...' : ''),
  }))
}

function buildSystemMessage(
  agent: AgentConfig,
  context: string,
  webResults?: WebSearchResult[],
): string {
  let message = agent.systemPrompt

  message += `\n\n## Document Context\n${context}`

  if (webResults?.length) {
    const webContext = webResults
      .map((r, i) => `[Web ${i + 1}: ${r.title}]\n${r.snippet}\nURL: ${r.url}`)
      .join('\n\n')
    message += `\n\n## Web Search Results\n${webContext}`
  }

  return message
}

function buildMessages(
  systemMessage: string,
  history: ChatMessage[],
  query: string,
): { role: string; content: string }[] {
  const messages: { role: string; content: string }[] = [
    { role: 'system', content: systemMessage },
  ]

  // Include recent conversation history (last 10 messages to manage token count)
  const recentHistory = history.slice(-10)
  for (const msg of recentHistory) {
    if (msg.role === 'user' || msg.role === 'assistant') {
      messages.push({ role: msg.role, content: msg.content })
    }
  }

  messages.push({ role: 'user', content: query })
  return messages
}

async function callChatCompletion(
  messages: { role: string; content: string }[],
  apiKey: string,
  endpoint: string,
  deploymentName: string,
): Promise<string> {
  const url = `${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=2024-06-01`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      messages,
      temperature: 0.3, // Low temperature for factual accuracy
      max_tokens: 2000,
      top_p: 0.95,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Chat API error ${response.status}: ${error}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content ?? 'No response generated.'
}

/**
 * Simulate web search by asking the LLM to generate plausible results.
 * Production would use Bing Search API or similar.
 */
async function simulateWebSearch(
  query: string,
  config: ChatPipelineConfig,
): Promise<WebSearchResult[]> {
  const prompt = `Generate 3 realistic web search results for the query: "${query}"
Return as JSON array with objects having: title, snippet, url
Focus on NUS, Singapore regulations, and safety compliance topics.
Return ONLY the JSON array, no markdown fencing.`

  try {
    const response = await callChatCompletion(
      [
        { role: 'system', content: 'You generate realistic web search results as JSON.' },
        { role: 'user', content: prompt },
      ],
      config.apiKey,
      config.endpoint,
      config.chatDeployment,
    )
    return JSON.parse(response)
  } catch {
    return [] // Web search failure is non-critical
  }
}

/**
 * Estimate token count for a string (rough: 1 token ≈ 4 chars for English)
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

/**
 * Pre-built agent configurations for spike testing
 */
export const SAMPLE_AGENTS: AgentConfig[] = [
  DEFAULT_AGENT,
  {
    name: 'Chemical Safety Agent',
    systemPrompt: `You are a Chemical Safety specialist AI for NUS ORMC audits.
Focus on: chemical storage, MSDS/SDS compliance, labeling, disposal procedures, 
PPE requirements, and Singapore Workplace Safety & Health Act (WSHA) compliance.
Always cite page numbers. Flag any non-conformances.`,
  },
  {
    name: 'Fire Safety Agent',
    systemPrompt: `You are a Fire Safety specialist AI for NUS ORMC audits.
Focus on: fire extinguisher placement, emergency evacuation routes, 
fire alarm systems, SCDF compliance, flammable materials storage, 
and Singapore Fire Safety Act requirements.
Always cite page numbers. Flag any non-conformances.`,
  },
  {
    name: 'Biological Safety Agent',
    systemPrompt: `You are a Biological Safety specialist AI for NUS ORMC audits.
Focus on: BSL classification, autoclave procedures, biohazard disposal, 
GMAC compliance, biosafety cabinet certification, and MoH regulations.
Always cite page numbers. Flag any non-conformances.`,
  },
]
