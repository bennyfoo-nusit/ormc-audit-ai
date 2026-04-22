import { useState, useRef, useEffect } from 'react'
import { extractTextFromPdf, type ExtractedDocument } from './lib/pdfExtractor'
import { chunkDocument, getChunkingStats, type DocumentChunk } from './lib/chunker'
import {
  InMemoryVectorStore,
  generateEmbeddings,
  generateEmbedding,
  type EmbeddedChunk,
  type VectorStoreStats,
} from './lib/vectorStore'
import {
  ragQuery,
  SAMPLE_AGENTS,
  estimateTokens,
  type ChatMessage,
  type AgentConfig,
} from './lib/ragPipeline'

// --- Styles ---
const styles = {
  container: { fontFamily: 'Inter, system-ui, sans-serif', maxWidth: 1200, margin: '0 auto', padding: 24 },
  header: { borderBottom: '2px solid #003D7C', paddingBottom: 16, marginBottom: 24 },
  h1: { color: '#003D7C', fontSize: 24, margin: 0 },
  subtitle: { color: '#666', fontSize: 14, marginTop: 4 },
  section: { marginBottom: 24, border: '1px solid #e0e0e0', borderRadius: 8, padding: 16 },
  sectionTitle: { color: '#003D7C', fontSize: 16, fontWeight: 600 as const, marginBottom: 12 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  input: { padding: '8px 12px', border: '1px solid #ccc', borderRadius: 4, fontSize: 14, width: '100%', boxSizing: 'border-box' as const },
  button: { padding: '8px 16px', backgroundColor: '#003D7C', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14 },
  buttonDisabled: { padding: '8px 16px', backgroundColor: '#999', color: 'white', border: 'none', borderRadius: 4, fontSize: 14, cursor: 'not-allowed' },
  buttonAccent: { padding: '8px 16px', backgroundColor: '#EF7C00', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14 },
  log: { backgroundColor: '#f5f5f5', padding: 12, borderRadius: 4, fontSize: 12, fontFamily: 'JetBrains Mono, monospace', maxHeight: 200, overflow: 'auto', whiteSpace: 'pre-wrap' as const },
  table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: 13 },
  td: { padding: '6px 8px', borderBottom: '1px solid #eee' },
  th: { padding: '6px 8px', borderBottom: '2px solid #ccc', textAlign: 'left' as const, fontWeight: 600 as const },
  badge: { display: 'inline-block', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 as const, marginRight: 4 },
  chatContainer: { border: '1px solid #e0e0e0', borderRadius: 8, maxHeight: 400, overflowY: 'auto' as const, padding: 12, backgroundColor: '#fafafa' },
  userMsg: { backgroundColor: '#003D7C', color: 'white', padding: '8px 12px', borderRadius: '12px 12px 0 12px', marginBottom: 8, maxWidth: '80%', marginLeft: 'auto' as const },
  aiMsg: { backgroundColor: 'white', color: '#333', padding: '8px 12px', borderRadius: '12px 12px 12px 0', marginBottom: 8, maxWidth: '80%', border: '1px solid #e0e0e0' },
  citation: { fontSize: 11, color: '#003D7C', backgroundColor: '#f0f4f8', padding: '4px 8px', borderRadius: 4, marginTop: 4, cursor: 'pointer' },
} as const

function App() {
  // --- Config State ---
  const [apiKey, setApiKey] = useState('')
  const [endpoint, setEndpoint] = useState('')
  const [embeddingDeployment, setEmbeddingDeployment] = useState('text-embedding-3-small')
  const [chatDeployment, setChatDeployment] = useState('gpt-4o-mini')

  // --- Pipeline State ---
  const [documents, setDocuments] = useState<ExtractedDocument[]>([])
  const [allChunks, setAllChunks] = useState<DocumentChunk[]>([])
  const [vectorStore] = useState(() => new InMemoryVectorStore())
  const [storeStats, setStoreStats] = useState<VectorStoreStats | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isQuerying, setIsQuerying] = useState(false)

  // --- Chat State ---
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [queryInput, setQueryInput] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<AgentConfig>(SAMPLE_AGENTS[0])
  const [enableWebSearch, setEnableWebSearch] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // --- Search State ---
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ chunk: DocumentChunk; score: number }[]>([])

  const logRef = useRef<HTMLDivElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  const log = (msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])
  }

  useEffect(() => {
    logRef.current?.scrollTo(0, logRef.current.scrollHeight)
  }, [logs])

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight)
  }, [messages])

  const isConfigured = apiKey && endpoint

  // --- All unique tags from indexed documents ---
  const allTags = [...new Set(allChunks.flatMap((c) => c.tags ?? []))]

  // --- Handlers ---

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length || !isConfigured) return

    setIsProcessing(true)

    for (const file of Array.from(files)) {
      try {
        // Step 1: Extract text
        log(`📄 Extracting text from ${file.name}...`)
        const doc = await extractTextFromPdf(file)
        log(`✅ Extracted ${doc.totalPages} pages, ${doc.totalChars} chars in ${Math.round(doc.extractionTimeMs)}ms`)
        setDocuments((prev) => [...prev, doc])

        // Step 2: Generate tags via LLM
        log(`🏷️ Generating tags for ${file.name}...`)
        const tags = await generateDocumentTags(doc, file.name)
        log(`🏷️ Tags: ${tags.join(', ')}`)

        // Step 3: Chunk the document
        log(`🔪 Chunking ${file.name}...`)
        const chunks = chunkDocument(
          crypto.randomUUID(),
          file.name,
          doc.pages,
          tags,
        )
        const stats = getChunkingStats(chunks)
        log(`✅ Created ${stats.count} chunks (avg ${stats.avgSize} chars, range ${stats.minSize}–${stats.maxSize})`)
        setAllChunks((prev) => [...prev, ...chunks])

        // Step 4: Generate embeddings
        log(`🧠 Generating embeddings for ${chunks.length} chunks...`)
        const startEmbed = performance.now()
        const embedded = await generateEmbeddings(
          chunks,
          apiKey,
          endpoint,
          embeddingDeployment,
          (completed, total) => {
            log(`  Embedding batch: ${completed}/${total} chunks`)
          },
        )
        const embedTime = Math.round(performance.now() - startEmbed)
        log(`✅ ${embedded.length} embeddings generated in ${embedTime}ms (${embedded[0]?.embedding.length} dimensions)`)

        // Step 5: Add to vector store
        vectorStore.addChunks(embedded)
        setStoreStats(vectorStore.stats)
        log(`📦 Vector store: ${vectorStore.stats.totalChunks} chunks from ${vectorStore.stats.totalDocuments} documents`)
      } catch (err) {
        log(`❌ Error processing ${file.name}: ${err}`)
      }
    }

    setIsProcessing(false)
    e.target.value = '' // Reset file input
  }

  const generateDocumentTags = async (doc: ExtractedDocument, fileName: string): Promise<string[]> => {
    const sampleText = doc.pages
      .slice(0, 3)
      .map((p) => p.text)
      .join(' ')
      .slice(0, 2000)

    try {
      const url = `${endpoint}/openai/deployments/${chatDeployment}/chat/completions?api-version=2024-06-01`
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'Generate 3-5 concise metadata tags for categorizing documents in a safety audit context. Return ONLY a JSON array of tag strings. Examples: ["Chemical Hazards","Fire Safety","Contractor","Lab Equipment","Biological Hazards"]',
            },
            { role: 'user', content: `File: ${fileName}\n\nContent sample:\n${sampleText}` },
          ],
          temperature: 0.3,
          max_tokens: 100,
        }),
      })
      if (!response.ok) throw new Error(`Tag API error: ${response.status}`)
      const data = await response.json()
      return JSON.parse(data.choices[0].message.content)
    } catch {
      return ['Untagged']
    }
  }

  const handleChat = async () => {
    if (!queryInput.trim() || !isConfigured || isQuerying) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: queryInput,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setQueryInput('')
    setIsQuerying(true)

    log(`💬 Query: "${userMessage.content}" | Agent: ${selectedAgent.name} | Web: ${enableWebSearch} | Tags: ${selectedTags.join(',')}`)

    try {
      const response = await ragQuery(userMessage.content, {
        apiKey,
        endpoint,
        embeddingDeployment,
        chatDeployment,
        vectorStore,
      }, {
        agent: selectedAgent,
        conversationHistory: messages,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        enableWebSearch,
        topK: 5,
      })

      log(`✅ Response generated (${estimateTokens(response.content)} est. tokens, ${response.citations?.length ?? 0} citations)`)
      setMessages((prev) => [...prev, response])
    } catch (err) {
      log(`❌ Chat error: ${err}`)
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: `Error: ${err}`, timestamp: new Date() },
      ])
    }

    setIsQuerying(false)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim() || !isConfigured) return

    log(`🔍 Search: "${searchQuery}"`)
    try {
      const queryEmb = await generateEmbedding(searchQuery, apiKey, endpoint, embeddingDeployment)
      const results = vectorStore.hybridSearch(queryEmb, searchQuery, 10, {
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      })
      setSearchResults(results)
      log(`✅ Search returned ${results.length} results`)
    } catch (err) {
      log(`❌ Search error: ${err}`)
    }
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.h1}>Spike: AI RAG Pipeline (Chat + Search)</h1>
        <p style={styles.subtitle}>
          PDF extraction → Chunking → Embedding → Vector Store → Hybrid Search → RAG Chat
        </p>
      </header>

      {/* Config Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>🔑 Azure OpenAI Configuration</h2>
        <div style={styles.grid}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600 }}>Endpoint</label>
            <input
              style={styles.input}
              type="text"
              placeholder="https://your-resource.openai.azure.com"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600 }}>API Key</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Enter API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600 }}>Embedding Deployment</label>
            <input
              style={styles.input}
              value={embeddingDeployment}
              onChange={(e) => setEmbeddingDeployment(e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600 }}>Chat Deployment</label>
            <input
              style={styles.input}
              value={chatDeployment}
              onChange={(e) => setChatDeployment(e.target.value)}
            />
          </div>
        </div>
        {!isConfigured && (
          <p style={{ color: '#EF7C00', fontSize: 13, marginTop: 8 }}>
            ⚠️ Enter Azure OpenAI endpoint and API key to enable pipeline
          </p>
        )}
      </div>

      {/* Document Ingestion */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>📄 Document Ingestion Pipeline</h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
          <input
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileUpload}
            disabled={!isConfigured || isProcessing}
          />
          {isProcessing && <span style={{ color: '#EF7C00' }}>⏳ Processing...</span>}
        </div>

        {/* Indexed Documents */}
        {documents.length > 0 && (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Document</th>
                <th style={styles.th}>Pages</th>
                <th style={styles.th}>Chars</th>
                <th style={styles.th}>Extract Time</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((d, i) => (
                <tr key={i}>
                  <td style={styles.td}>{d.fileName}</td>
                  <td style={styles.td}>{d.totalPages}</td>
                  <td style={styles.td}>{d.totalChars.toLocaleString()}</td>
                  <td style={styles.td}>{Math.round(d.extractionTimeMs)}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Vector Store Stats */}
        {storeStats && (
          <div style={{ marginTop: 12, fontSize: 13 }}>
            <strong>Vector Store:</strong>{' '}
            {storeStats.totalChunks} chunks from {storeStats.totalDocuments} documents |{' '}
            {storeStats.dimensions}D embeddings
            {allTags.length > 0 && (
              <div style={{ marginTop: 4 }}>
                <strong>Tags:</strong>{' '}
                {allTags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      ...styles.badge,
                      backgroundColor: selectedTags.includes(tag) ? '#003D7C' : '#e0e0e0',
                      color: selectedTags.includes(tag) ? 'white' : '#333',
                      cursor: 'pointer',
                    }}
                    onClick={() =>
                      setSelectedTags((prev) =>
                        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
                      )
                    }
                  >
                    {tag}
                  </span>
                ))}
                {selectedTags.length > 0 && (
                  <span
                    style={{ ...styles.badge, backgroundColor: '#f0f0f0', cursor: 'pointer' }}
                    onClick={() => setSelectedTags([])}
                  >
                    ✕ Clear
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>🔍 Hybrid Search (Semantic + Keyword)</h2>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            style={{ ...styles.input, flex: 1 }}
            placeholder="Search across indexed documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            style={isConfigured && storeStats ? styles.button : styles.buttonDisabled}
            disabled={!isConfigured || !storeStats}
            onClick={handleSearch}
          >
            Search
          </button>
        </div>

        {searchResults.length > 0 && (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Score</th>
                <th style={styles.th}>Document</th>
                <th style={styles.th}>Pages</th>
                <th style={styles.th}>Snippet</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.map((r, i) => (
                <tr key={i}>
                  <td style={styles.td}>{(r.score * 100).toFixed(1)}%</td>
                  <td style={styles.td}>{r.chunk.documentName}</td>
                  <td style={styles.td}>{r.chunk.pageNumbers.join(', ')}</td>
                  <td style={{ ...styles.td, fontSize: 12 }}>
                    {r.chunk.text.slice(0, 200)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Chat Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>💬 RAG Chat</h2>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600 }}>Agent</label>
            <select
              style={{ ...styles.input, width: 200 }}
              value={selectedAgent.name}
              onChange={(e) => {
                const agent = SAMPLE_AGENTS.find((a) => a.name === e.target.value)
                if (agent) setSelectedAgent(agent)
              }}
            >
              {SAMPLE_AGENTS.map((a) => (
                <option key={a.name} value={a.name}>
                  @{a.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'end' }}>
            <label style={{ fontSize: 13, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={enableWebSearch}
                onChange={(e) => setEnableWebSearch(e.target.checked)}
                style={{ marginRight: 4 }}
              />
              🌐 Web Search
            </label>
          </div>
        </div>

        <div ref={chatRef} style={styles.chatContainer}>
          {messages.length === 0 && (
            <p style={{ color: '#999', textAlign: 'center', marginTop: 40 }}>
              Upload a PDF and ask questions about its content
            </p>
          )}
          {messages.map((msg) => (
            <div key={msg.id}>
              <div style={msg.role === 'user' ? styles.userMsg : styles.aiMsg}>
                {msg.agentName && msg.role === 'assistant' && (
                  <div style={{ fontSize: 11, color: '#EF7C00', fontWeight: 600, marginBottom: 4 }}>
                    @{msg.agentName}
                  </div>
                )}
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                {msg.citations && msg.citations.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>📎 Sources:</div>
                    {msg.citations.map((c, i) => (
                      <div key={i} style={styles.citation}>
                        [{c.documentName}, p.{c.pageNumbers.join(',')}] (score: {c.score})
                      </div>
                    ))}
                  </div>
                )}
                {msg.webResults && msg.webResults.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>🌐 Web Results:</div>
                    {msg.webResults.map((w, i) => (
                      <div key={i} style={{ fontSize: 12, marginBottom: 4 }}>
                        <a href={w.url} target="_blank" rel="noreferrer" style={{ color: '#003D7C' }}>
                          {w.title}
                        </a>
                        <div style={{ fontSize: 11, color: '#666' }}>{w.snippet}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isQuerying && (
            <div style={styles.aiMsg}>
              <span style={{ color: '#EF7C00' }}>⏳ Thinking...</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input
            style={{ ...styles.input, flex: 1 }}
            placeholder="Ask a question about your documents..."
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleChat()}
            disabled={isQuerying}
          />
          <button
            style={isConfigured && storeStats && !isQuerying ? styles.buttonAccent : styles.buttonDisabled}
            disabled={!isConfigured || !storeStats || isQuerying}
            onClick={handleChat}
          >
            Send
          </button>
          <button
            style={{ ...styles.button, backgroundColor: '#666' }}
            onClick={() => setMessages([])}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Pipeline Log */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>📋 Pipeline Log</h2>
        <div ref={logRef} style={styles.log}>
          {logs.length === 0 ? 'Upload a PDF to start the pipeline...' : logs.join('\n')}
        </div>
      </div>
    </div>
  )
}

export default App
