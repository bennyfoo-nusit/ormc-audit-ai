import { useState, useCallback, useRef, useEffect } from 'react'
import { PDFViewer } from './components/PDFViewer'
import { AnnotationOverlay, type Annotation, type AnnotationRect, type TagType, HIGHLIGHT_COLORS } from './components/AnnotationOverlay'
import { AnnotationPanel } from './components/AnnotationPanel'
import { CommentsPanel } from './components/CommentsPanel'
import { ShapeOverlay, type Shape } from './components/ShapeOverlay'
import { exportPdfWithAnnotations } from './lib/pdfExport'
import { mergePdfs } from './lib/pdfMerge'
import { generateSamplePdf } from './lib/samplePdf'

/**
 * SPIKE: PDF Rendering + Annotation
 *
 * Tests:
 * 1. PDF rendering with react-pdf (pdf.js) — view, zoom, navigate
 * 2. Text layer + text selection
 * 3. Side-panel annotation with tags (FIND/CLAR/COMM) and highlight colors
 * 4. Comments panel with filtering, click-to-navigate, delete
 * 5. Shape overlay (rectangle, circle drawing)
 * 6. PDF export with annotations embedded via pdf-lib
 * 7. PDF merging with bookmarks via pdf-lib
 */

type RightPanelTab = 'annotate' | 'comments'

const STORAGE_KEY = 'spike-pdf-session'

interface SavedSession {
  annotations: Annotation[]
  shapes: Shape[]
  pdfBase64: string | null
  currentPage: number
}

export function App() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null)
  const [numPages, setNumPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(1.0)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [shapes, setShapes] = useState<Shape[]>([])
  const [selectedText, setSelectedText] = useState<string | null>(null)
  const [selectionRects, setSelectionRects] = useState<AnnotationRect[]>([])
  const [drawMode, setDrawMode] = useState<'select' | 'rect' | 'circle'>('select')
  const pdfContainerRef = useRef<HTMLDivElement>(null)
  const [statusLog, setStatusLog] = useState<string[]>([])
  const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab>('annotate')
  const [showRightPanel, setShowRightPanel] = useState(true)
  const [hasSavedSession, setHasSavedSession] = useState(false)

  // --- Restore session from localStorage on mount ---
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const saved: SavedSession = JSON.parse(raw)

      // Restore annotations (rehydrate Date objects)
      if (saved.annotations?.length) {
        setAnnotations(saved.annotations.map(a => ({ ...a, timestamp: new Date(a.timestamp) })))
      }
      if (saved.shapes?.length) {
        setShapes(saved.shapes)
      }
      if (saved.currentPage) {
        setCurrentPage(saved.currentPage)
      }

      // Restore PDF from base64
      if (saved.pdfBase64) {
        const binary = atob(saved.pdfBase64)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
        loadPdf(bytes)
      }

      setHasSavedSession(true)
      setStatusLog(['[restored] Session loaded from localStorage'])
    } catch {
      // ignore corrupt data
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // mount only

  const loadPdf = useCallback((bytes: Uint8Array) => {
    setPdfBytes(bytes)
    const blob = new Blob([bytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    setPdfUrl(prev => { if (prev) URL.revokeObjectURL(prev); return url })
  }, [])

  const log = useCallback((msg: string) => {
    setStatusLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])
  }, [])

  // --- Auto-save to localStorage when annotations/shapes/pdf change ---
  useEffect(() => {
    // Convert PDF bytes to base64 for storage
    let pdfBase64: string | null = null
    if (pdfBytes) {
      const chunks: string[] = []
      const arr = pdfBytes
      for (let i = 0; i < arr.length; i += 8192) {
        chunks.push(String.fromCharCode(...arr.subarray(i, i + 8192)))
      }
      pdfBase64 = btoa(chunks.join(''))
    }

    const session: SavedSession = {
      annotations,
      shapes,
      pdfBase64,
      currentPage,
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
      setHasSavedSession(true)
    } catch {
      // localStorage full — ignore
    }
  }, [annotations, shapes, pdfBytes, currentPage])

  // --- Clear saved session ---
  const handleClearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setAnnotations([])
    setShapes([])
    setPdfUrl(null)
    setPdfBytes(null)
    setNumPages(0)
    setCurrentPage(1)
    setSelectedText(null)
    setSelectionRects([])
    setHasSavedSession(false)
    log('🗑 Session cleared')
  }, [log])

  // --- Download session as JSON file ---
  const handleDownloadJson = useCallback(() => {
    let pdfBase64: string | null = null
    if (pdfBytes) {
      const chunks: string[] = []
      for (let i = 0; i < pdfBytes.length; i += 8192) {
        chunks.push(String.fromCharCode(...pdfBytes.subarray(i, i + 8192)))
      }
      pdfBase64 = btoa(chunks.join(''))
    }
    const session: SavedSession = { annotations, shapes, pdfBase64, currentPage }
    const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pdf-session.json'
    a.click()
    URL.revokeObjectURL(url)
    log('💾 Session downloaded as pdf-session.json')
  }, [annotations, shapes, pdfBytes, currentPage, log])

  // --- Load session from JSON file ---
  const handleLoadJson = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const saved: SavedSession = JSON.parse(reader.result as string)
        if (saved.annotations?.length) {
          setAnnotations(saved.annotations.map(a => ({ ...a, timestamp: new Date(a.timestamp) })))
        }
        if (saved.shapes?.length) {
          setShapes(saved.shapes)
        }
        if (saved.currentPage) {
          setCurrentPage(saved.currentPage)
        }
        if (saved.pdfBase64) {
          const binary = atob(saved.pdfBase64)
          const bytes = new Uint8Array(binary.length)
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
          loadPdf(bytes)
        }
        log(`✅ Session loaded from ${file.name}`)
      } catch {
        log(`❌ Failed to parse ${file.name}`)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }, [loadPdf, log])

  // --- Load sample PDF ---
  const handleLoadSample = async () => {
    log('Generating sample PDF with pdf-lib...')
    const bytes = await generateSamplePdf()
    loadPdf(bytes)
    log('✅ Sample PDF generated and loaded')
  }

  // --- Upload a real PDF ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    log(`Loading uploaded file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`)
    const reader = new FileReader()
    reader.onload = () => {
      const bytes = new Uint8Array(reader.result as ArrayBuffer)
      loadPdf(bytes)
      log('✅ PDF file loaded from upload')
    }
    reader.readAsArrayBuffer(file)
  }

  // --- Text selection → capture position rects relative to PDF container ---
  const handleTextSelect = useCallback(() => {
    if (drawMode !== 'select') return
    const selection = window.getSelection()
    if (!selection || !selection.toString().trim()) return
    const container = pdfContainerRef.current
    if (!container) return

    const range = selection.getRangeAt(0)
    const containerRect = container.getBoundingClientRect()
    const clientRects = range.getClientRects()
    const rects: AnnotationRect[] = []

    for (let i = 0; i < clientRects.length; i++) {
      const cr = clientRects[i]
      // Convert from viewport coords to container-relative, un-scaled
      rects.push({
        x: (cr.left - containerRect.left) / zoom,
        y: (cr.top - containerRect.top) / zoom,
        width: cr.width / zoom,
        height: cr.height / zoom,
      })
    }

    setSelectedText(selection.toString().trim())
    setSelectionRects(rects)
    setRightPanelTab('annotate')
    setShowRightPanel(true)
  }, [drawMode, zoom])

  // --- Save annotation from panel ---
  const handleSaveAnnotation = (data: { text: string; comment: string; tags: TagType[]; highlightColor: string }) => {
    const annotation: Annotation = {
      id: crypto.randomUUID(),
      page: currentPage,
      text: data.text,
      comment: data.comment,
      tags: data.tags,
      highlightColor: data.highlightColor,
      timestamp: new Date(),
      rects: selectionRects,
    }
    setAnnotations(prev => [...prev, annotation])
    setSelectedText(null)
    setSelectionRects([])
    setRightPanelTab('comments')
    log(`✅ Annotation added on page ${currentPage} [${data.tags.join(',')}]: "${data.text.slice(0, 40)}"`)
  }

  // --- Delete annotation ---
  const handleDeleteAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id))
    log('🗑 Annotation deleted')
  }

  // --- Click annotation → navigate to page ---
  const handleCommentClick = (annotation: Annotation) => {
    if (annotation.page !== currentPage) {
      setCurrentPage(annotation.page)
      log(`📄 Navigated to page ${annotation.page}`)
    }
  }

  // --- Export PDF with annotations ---
  const handleExportPdf = async () => {
    if (!pdfBytes) return
    log('Exporting PDF with annotations embedded via pdf-lib...')
    try {
      const exported = await exportPdfWithAnnotations(pdfBytes, annotations, shapes)
      const blob = new Blob([exported], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'annotated-document.pdf'
      a.click()
      URL.revokeObjectURL(url)
      log(`✅ PDF exported with ${annotations.length} annotations and ${shapes.length} shapes`)
    } catch (err) {
      log(`❌ Export failed: ${err}`)
    }
  }

  // --- Merge PDFs ---
  const handleMergePdfs = async () => {
    log('Testing PDF merging with bookmarks via pdf-lib...')
    try {
      const merged = await mergePdfs()
      const blob = new Blob([merged], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'merged-with-bookmarks.pdf'
      a.click()
      URL.revokeObjectURL(url)
      log('✅ PDF merge with bookmarks successful')
    } catch (err) {
      log(`❌ Merge failed: ${err}`)
    }
  }

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <h1 style={{ margin: 0, fontSize: 18 }}>🔬 PDF Rendering + Annotation Spike</h1>
          <span style={{ fontSize: 12, color: '#888' }}>react-pdf + pdf-lib</span>
        </div>

        {/* Controls row */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={handleLoadSample}>📄 Load Sample</button>
          <label style={{ cursor: 'pointer', padding: '4px 8px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13 }}>
            📁 Upload PDF
            <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
          <span style={{ borderLeft: '1px solid #ddd', margin: '0 4px', height: 20 }} />
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}>−</button>
          <span style={{ fontSize: 12, minWidth: 36, textAlign: 'center' }}>{(zoom * 100).toFixed(0)}%</span>
          <button onClick={() => setZoom(z => Math.min(3, z + 0.25))}>+</button>
          <span style={{ borderLeft: '1px solid #ddd', margin: '0 4px', height: 20 }} />
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}>◀</button>
          <span style={{ fontSize: 12 }}>Page {currentPage}/{numPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))} disabled={currentPage >= numPages}>▶</button>
          <span style={{ borderLeft: '1px solid #ddd', margin: '0 4px', height: 20 }} />
          <button onClick={() => setDrawMode('select')} style={{ fontWeight: drawMode === 'select' ? 'bold' : 'normal' }}>🖱 Select</button>
          <button onClick={() => setDrawMode('rect')} style={{ fontWeight: drawMode === 'rect' ? 'bold' : 'normal' }}>▭ Rect</button>
          <button onClick={() => setDrawMode('circle')} style={{ fontWeight: drawMode === 'circle' ? 'bold' : 'normal' }}>◯ Circle</button>
          <span style={{ borderLeft: '1px solid #ddd', margin: '0 4px', height: 20 }} />
          <button onClick={handleExportPdf} disabled={!pdfBytes}>📥 Export</button>
          <button onClick={handleMergePdfs}>🔗 Merge Test</button>
          <span style={{ borderLeft: '1px solid #ddd', margin: '0 4px', height: 20 }} />
          <button onClick={handleDownloadJson} disabled={!pdfBytes && annotations.length === 0} title="Download session as JSON">💾 Save JSON</button>
          <label style={{ cursor: 'pointer', padding: '4px 8px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13 }} title="Load session from JSON">
            📂 Load JSON
            <input type="file" accept=".json" onChange={handleLoadJson} style={{ display: 'none' }} />
          </label>
          <button onClick={handleClearSession} disabled={!hasSavedSession && annotations.length === 0} title="Clear session">🗑 Clear</button>
          <span style={{ borderLeft: '1px solid #ddd', margin: '0 4px', height: 20 }} />
          <button
            onClick={() => setShowRightPanel(v => !v)}
            style={{ fontWeight: showRightPanel ? 'bold' : 'normal' }}
          >
            {showRightPanel ? '◧' : '◨'} Panel
          </button>
        </div>
      </div>

      {/* Main content: PDF viewer + right panel */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* PDF Viewer area */}
        <div
          style={{ flex: 1, position: 'relative', overflow: 'auto', background: '#f5f5f5' }}
          onMouseUp={handleTextSelect}
        >
          {pdfUrl ? (
            <div ref={pdfContainerRef} style={{ position: 'relative', display: 'inline-block', margin: 20 }}>
              {/* Suppress text layer pointer events during draw mode so ShapeOverlay gets clicks */}
              {drawMode !== 'select' && (
                <style>{`.react-pdf__Page__textContent { pointer-events: none !important; }`}</style>
              )}
              <PDFViewer
                file={pdfUrl}
                pageNumber={currentPage}
                scale={zoom}
                onLoadSuccess={({ numPages: n }) => { setNumPages(n); log(`✅ PDF loaded: ${n} pages`) }}
                onLoadError={(err) => log(`❌ PDF load error: ${err.message}`)}
              />
              <AnnotationOverlay
                annotations={annotations.filter(a => a.page === currentPage)}
                scale={zoom}
                drawMode={drawMode}
                onAnnotationClick={(id) => {
                  setRightPanelTab('comments')
                  setShowRightPanel(true)
                }}
              />
              <ShapeOverlay
                shapes={shapes.filter(s => s.page === currentPage)}
                drawMode={drawMode}
                scale={zoom}
                onShapeAdd={(shape) => {
                  const s = { ...shape, page: currentPage }
                  setShapes(prev => [...prev, s])
                  log(`✅ Shape added: ${s.type} on page ${currentPage}`)
                }}
              />
            </div>
          ) : (
            <div style={{ padding: 60, textAlign: 'center', color: '#999' }}>
              <p style={{ fontSize: 16 }}>No PDF loaded</p>
              <p>Click "Load Sample" or upload a file to get started</p>
            </div>
          )}
        </div>

        {/* Right side panel — matching design mockup */}
        {showRightPanel && (
          <div style={{
            width: 340,
            borderLeft: '1px solid #e5e7eb',
            background: '#fff',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
          }}>
            {/* Tabs: Add / View */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
              <button
                onClick={() => setRightPanelTab('annotate')}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 13,
                  color: rightPanelTab === 'annotate' ? '#2563eb' : '#999',
                  borderBottom: rightPanelTab === 'annotate' ? '2px solid #2563eb' : '2px solid transparent',
                }}
              >
                ✏️ Add
              </button>
              <button
                onClick={() => setRightPanelTab('comments')}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 13,
                  color: rightPanelTab === 'comments' ? '#2563eb' : '#999',
                  borderBottom: rightPanelTab === 'comments' ? '2px solid #2563eb' : '2px solid transparent',
                }}
              >
                💬 View ({annotations.length})
              </button>
            </div>

            {/* Tab content */}
            <div style={{ flex: 1, overflow: 'auto' }}>
              {rightPanelTab === 'annotate' ? (
                <AnnotationPanel
                  selectedText={selectedText}
                  onSave={handleSaveAnnotation}
                  onClear={() => setSelectedText(null)}
                />
              ) : (
                <CommentsPanel
                  annotations={annotations}
                  onDelete={handleDeleteAnnotation}
                  onCommentClick={handleCommentClick}
                />
              )}
            </div>

            {/* Mini log at bottom of panel */}
            <div style={{
              borderTop: '1px solid #e5e7eb',
              maxHeight: 120,
              overflow: 'auto',
              padding: '8px 12px',
              fontSize: 10,
              fontFamily: 'monospace',
              background: '#fafafa',
              color: '#666',
            }}>
              {statusLog.slice(-5).map((msg, i) => (
                <div key={i} style={{ marginBottom: 2 }}>{msg}</div>
              ))}
              {statusLog.length === 0 && <span style={{ color: '#bbb' }}>Activity log...</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
