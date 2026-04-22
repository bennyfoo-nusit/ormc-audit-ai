import { useState } from 'react'
import { HIGHLIGHT_COLORS, TAG_STYLES, type TagType } from './AnnotationOverlay'

interface AnnotationPanelProps {
  selectedText: string | null
  onSave: (data: { text: string; comment: string; tags: TagType[]; highlightColor: string }) => void
  onClear: () => void
}

const QUICK_TAGS: TagType[] = ['FIND', 'CLAR', 'COMM']

export function AnnotationPanel({ selectedText, onSave, onClear }: AnnotationPanelProps) {
  const [comment, setComment] = useState('')
  const [tags, setTags] = useState<TagType[]>([])
  const [highlightColor, setHighlightColor] = useState(HIGHLIGHT_COLORS[0].value)

  const toggleTag = (tag: TagType) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  const handleSave = () => {
    if (!selectedText || (!comment.trim() && tags.length === 0)) return
    onSave({ text: selectedText, comment: comment.trim(), tags, highlightColor })
    setComment('')
    setTags([])
    setHighlightColor(HIGHLIGHT_COLORS[0].value)
  }

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
      {/* Selected text preview */}
      {selectedText ? (
        <div>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
            Selected Text
          </div>
          <div style={{
            background: highlightColor,
            padding: '8px 12px',
            borderRadius: 6,
            fontSize: 13,
            lineHeight: 1.5,
            maxHeight: 120,
            overflow: 'auto',
            border: '1px solid #e5e7eb',
          }}>
            "{selectedText}"
          </div>
          <button
            onClick={onClear}
            style={{ fontSize: 11, color: '#888', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', marginTop: 2 }}
          >
            ✕ Clear selection
          </button>
        </div>
      ) : (
        <div style={{ padding: 24, textAlign: 'center', color: '#999', fontSize: 13 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🖱</div>
          <div>Select text on the PDF to create an annotation</div>
        </div>
      )}

      {/* Tag selection */}
      <div>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 6, textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
          Tag
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {QUICK_TAGS.map(tag => {
            const style = TAG_STYLES[tag]
            const active = tags.includes(tag)
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 14,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: `1.5px solid ${active ? style.text : style.border}`,
                  background: active ? style.bg : '#fff',
                  color: active ? style.text : '#888',
                  transition: 'all 0.15s',
                }}
              >
                {style.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Highlight color */}
      <div>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 6, textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
          Highlight Color
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {HIGHLIGHT_COLORS.map(c => (
            <button
              key={c.value}
              onClick={() => setHighlightColor(c.value)}
              title={c.label}
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: highlightColor === c.value ? '2px solid #333' : '2px solid #e5e7eb',
                background: c.value,
                cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
            />
          ))}
        </div>
      </div>

      {/* Comment input */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 6, textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
          Comment
        </div>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Add your comment..."
          disabled={!selectedText}
          style={{
            width: '100%',
            minHeight: 80,
            padding: 10,
            borderRadius: 6,
            border: '1px solid #e5e7eb',
            fontSize: 13,
            resize: 'vertical',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
          onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleSave() }}
        />
        <div style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>⌘ + Enter to save</div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={!selectedText || (!comment.trim() && tags.length === 0)}
        style={{
          padding: '10px 16px',
          borderRadius: 6,
          border: 'none',
          background: selectedText && (comment.trim() || tags.length > 0) ? '#2563eb' : '#e5e7eb',
          color: selectedText && (comment.trim() || tags.length > 0) ? '#fff' : '#999',
          fontWeight: 600,
          fontSize: 13,
          cursor: selectedText && (comment.trim() || tags.length > 0) ? 'pointer' : 'default',
          transition: 'all 0.15s',
        }}
      >
        💬 Save Annotation
      </button>
    </div>
  )
}
