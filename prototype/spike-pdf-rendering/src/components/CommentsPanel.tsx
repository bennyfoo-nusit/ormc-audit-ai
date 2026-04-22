import { useState } from 'react'
import { TAG_STYLES, type Annotation, type TagType } from './AnnotationOverlay'

type FilterTag = 'all' | TagType

interface CommentsPanelProps {
  annotations: Annotation[]
  onDelete: (id: string) => void
  onCommentClick: (annotation: Annotation) => void
}

export function CommentsPanel({ annotations, onDelete, onCommentClick }: CommentsPanelProps) {
  const [activeFilter, setActiveFilter] = useState<FilterTag>('all')
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const filtered = activeFilter === 'all'
    ? annotations
    : annotations.filter(a => a.tags.includes(activeFilter))

  const sorted = [...filtered].sort((a, b) => a.page - b.page)

  const countFor = (tag: FilterTag) =>
    tag === 'all' ? annotations.length : annotations.filter(a => a.tags.includes(tag)).length

  const filters: FilterTag[] = ['all', 'FIND', 'CLAR', 'COMM']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, padding: '12px 16px 8px', borderBottom: '1px solid #f0f0f0' }}>
        {filters.map(f => {
          const active = activeFilter === f
          const count = countFor(f)
          const tagStyle = f !== 'all' ? TAG_STYLES[f] : null
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                flex: 1,
                padding: '6px 4px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: active ? (tagStyle ? tagStyle.bg : '#f3f4f6') : 'transparent',
                color: active ? (tagStyle ? tagStyle.text : '#111') : '#999',
                transition: 'all 0.15s',
              }}
            >
              {f === 'all' ? 'All' : f}
              {count > 0 && (
                <span style={{
                  marginLeft: 4,
                  background: active ? 'rgba(0,0,0,0.1)' : '#e5e7eb',
                  padding: '1px 5px',
                  borderRadius: 8,
                  fontSize: 10,
                }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Annotations list */}
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 12px' }}>
        {sorted.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#999', fontSize: 13 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📝</div>
            {annotations.length === 0
              ? 'No annotations yet. Select text on the PDF to get started.'
              : `No ${activeFilter} annotations found.`}
          </div>
        ) : (
          sorted.map(ann => (
            <div
              key={ann.id}
              onClick={() => onCommentClick(ann)}
              onMouseEnter={() => setHoveredId(ann.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                padding: 12,
                marginBottom: 8,
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                background: hoveredId === ann.id ? '#f9fafb' : '#fff',
                cursor: 'pointer',
                transition: 'background 0.15s',
                position: 'relative',
              }}
            >
              {/* Header: page + tags + delete */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#6b7280',
                  background: '#f3f4f6',
                  padding: '2px 6px',
                  borderRadius: 4,
                }}>
                  Page {ann.page}
                </span>
                {ann.tags.map(tag => {
                  const s = TAG_STYLES[tag]
                  return (
                    <span key={tag} style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: s.text,
                      background: s.bg,
                      border: `1px solid ${s.border}`,
                      padding: '1px 6px',
                      borderRadius: 8,
                    }}>
                      {tag}
                    </span>
                  )
                })}
                {/* delete button */}
                {hoveredId === ann.id && (
                  <button
                    onClick={e => { e.stopPropagation(); onDelete(ann.id) }}
                    style={{
                      marginLeft: 'auto',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 14,
                      color: '#ef4444',
                      padding: '0 4px',
                    }}
                    title="Delete annotation"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Quoted text */}
              <div style={{
                fontSize: 12,
                color: '#374151',
                background: ann.highlightColor,
                padding: '4px 8px',
                borderRadius: 4,
                marginBottom: 6,
                lineHeight: 1.5,
                borderLeft: '3px solid rgba(0,0,0,0.15)',
              }}>
                "{ann.text.length > 120 ? ann.text.slice(0, 120) + '...' : ann.text}"
              </div>

              {/* Comment */}
              {ann.comment && (
                <div style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.5 }}>
                  {ann.comment}
                </div>
              )}

              {/* Timestamp */}
              <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 6 }}>
                {ann.timestamp.toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
