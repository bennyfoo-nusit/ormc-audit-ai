import { useState, useCallback } from 'react'

export type TagType = 'FIND' | 'CLAR' | 'COMM'

export interface AnnotationRect {
  x: number
  y: number
  width: number
  height: number
}

export interface Annotation {
  id: string
  page: number
  text: string
  comment: string
  tags: TagType[]
  highlightColor: string
  timestamp: Date
  rects: AnnotationRect[]
}

export const HIGHLIGHT_COLORS = [
  { label: 'Yellow', value: 'rgba(255, 220, 50, 0.35)' },
  { label: 'Green', value: 'rgba(100, 220, 100, 0.30)' },
  { label: 'Blue', value: 'rgba(100, 160, 255, 0.30)' },
  { label: 'Pink', value: 'rgba(255, 130, 170, 0.30)' },
  { label: 'Orange', value: 'rgba(255, 170, 50, 0.30)' },
  { label: 'Purple', value: 'rgba(180, 130, 255, 0.30)' },
]

export const TAG_STYLES: Record<TagType, { bg: string; text: string; border: string; label: string }> = {
  FIND: { bg: '#ffe4e6', text: '#be123c', border: '#fecdd3', label: 'Finding' },
  CLAR: { bg: '#fef3c7', text: '#92400e', border: '#fde68a', label: 'Clarification' },
  COMM: { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe', label: 'Comment' },
}

interface AnnotationOverlayProps {
  annotations: Annotation[]
  scale: number
  drawMode: 'select' | 'rect' | 'circle'
  onAnnotationClick?: (id: string) => void
}

/**
 * Renders highlight rectangles over the selected text, a tag badge
 * anchored to the left, and a popup card showing full annotation content.
 * Popup appears on hover and stays pinned on click.
 */
export function AnnotationOverlay({ annotations, scale, drawMode, onAnnotationClick }: AnnotationOverlayProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [pinnedId, setPinnedId] = useState<string | null>(null)

  const togglePin = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    setPinnedId(prev => prev === id ? null : id)
    onAnnotationClick?.(id)
  }, [onAnnotationClick])

  const closePin = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setPinnedId(null)
  }, [])

  if (annotations.length === 0) return null

  const isDrawing = drawMode !== 'select'

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: isDrawing ? 0 : 5,
      }}
    >
      {annotations.map((ann, idx) => {
        const tagStyle = ann.tags.length > 0 ? TAG_STYLES[ann.tags[0]] : TAG_STYLES.COMM
        const firstRect = ann.rects[0]
        const isPinned = pinnedId === ann.id
        const showPopup = (hoveredId === ann.id || isPinned) && !isDrawing

        return (
          <div key={ann.id}>
            {/* Highlight rectangles over the selected text */}
            {ann.rects.map((r, ri) => (
              <div
                key={ri}
                style={{
                  position: 'absolute',
                  left: r.x * scale,
                  top: r.y * scale,
                  width: r.width * scale,
                  height: r.height * scale,
                  background: ann.highlightColor,
                  borderRadius: 2,
                  mixBlendMode: 'multiply',
                  pointerEvents: isDrawing ? 'none' : 'auto',
                  cursor: 'pointer',
                  zIndex: 5,
                }}
                onMouseEnter={() => setHoveredId(ann.id)}
                onMouseLeave={() => setHoveredId(null)}
                onMouseDown={(e) => togglePin(e, ann.id)}
              />
            ))}

            {/* Tag badge anchored to the left of the first highlight rect */}
            {firstRect && (
              <div
                style={{
                  position: 'absolute',
                  right: `calc(100% - ${firstRect.x * scale}px + 4px)`,
                  top: firstRect.y * scale + (firstRect.height * scale - 16) / 2,
                  pointerEvents: isDrawing ? 'none' : 'auto',
                  cursor: 'pointer',
                  zIndex: 10,
                }}
                onMouseEnter={() => setHoveredId(ann.id)}
                onMouseLeave={() => setHoveredId(null)}
                onMouseDown={(e) => togglePin(e, ann.id)}
              >
                <span style={{
                  fontSize: 10,
                  background: tagStyle.bg,
                  color: tagStyle.text,
                  border: `1px solid ${tagStyle.border}`,
                  padding: '1px 5px',
                  borderRadius: 8,
                  whiteSpace: 'nowrap',
                  fontWeight: 600,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                }}>
                  {ann.tags[0] || 'COMM'} #{idx + 1}
                </span>
              </div>
            )}

            {/* Popup card — hover shows, click pins */}
            {showPopup && firstRect && (
              <div
                style={{
                  position: 'absolute',
                  left: firstRect.x * scale,
                  top: (firstRect.y + firstRect.height) * scale + 6,
                  width: 280,
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  padding: 12,
                  pointerEvents: 'auto',
                  zIndex: 30,
                  fontSize: 12,
                  lineHeight: 1.5,
                }}
                onMouseEnter={() => setHoveredId(ann.id)}
                onMouseLeave={() => { if (!isPinned) setHoveredId(null) }}
              >
                {/* Header: tags + close */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                  {ann.tags.map(tag => {
                    const s = TAG_STYLES[tag]
                    return (
                      <span key={tag} style={{
                        fontSize: 10, fontWeight: 600,
                        color: s.text, background: s.bg,
                        border: `1px solid ${s.border}`,
                        padding: '1px 6px', borderRadius: 8,
                      }}>
                        {s.label}
                      </span>
                    )
                  })}
                  <span style={{ marginLeft: 'auto', fontSize: 10, color: '#999' }}>
                    Page {ann.page}
                  </span>
                  {isPinned && (
                    <button
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 14, color: '#999', padding: '0 2px', lineHeight: 1,
                      }}
                      title="Close"
                      onMouseDown={closePin}
                    >✕</button>
                  )}
                </div>

                {/* Selected text */}
                <div style={{
                  background: ann.highlightColor,
                  padding: '6px 8px',
                  borderRadius: 4,
                  marginBottom: 8,
                  borderLeft: '3px solid rgba(0,0,0,0.15)',
                  maxHeight: 120,
                  overflow: 'auto',
                  color: '#374151',
                }}>
                  "{ann.text}"
                </div>

                {/* Comment */}
                {ann.comment && (
                  <div style={{ color: '#4b5563' }}>
                    {ann.comment}
                  </div>
                )}

                {/* Timestamp */}
                <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 6 }}>
                  {ann.timestamp.toLocaleString()}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
