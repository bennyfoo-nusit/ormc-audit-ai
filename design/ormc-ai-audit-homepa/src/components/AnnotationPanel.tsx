import { useState } from 'react'
import { X, Tag, Chat, Palette } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface AnnotationPanelProps {
  selectedText: string | null
  onClose: () => void
  onSave: (annotation: { text: string; comment: string; tags: string[]; highlightColor: string }) => void
}

const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: 'oklch(0.95 0.15 100)' },
  { name: 'Green', value: 'oklch(0.93 0.12 150)' },
  { name: 'Blue', value: 'oklch(0.93 0.12 240)' },
  { name: 'Pink', value: 'oklch(0.93 0.15 350)' },
  { name: 'Orange', value: 'oklch(0.93 0.15 50)' },
  { name: 'Purple', value: 'oklch(0.93 0.12 300)' },
]

const PRECONFIGURED_TAGS = [
  { label: 'FIND', description: 'Finding' },
  { label: 'CLAR', description: 'Clarification' },
  { label: 'COMM', description: 'Comment' },
]

export function AnnotationPanel({ selectedText, onClose, onSave }: AnnotationPanelProps) {
  const [comment, setComment] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [highlightColor, setHighlightColor] = useState(HIGHLIGHT_COLORS[0].value)

  const handleAddTag = (tag?: string) => {
    const tagToAdd = tag || tagInput.trim()
    if (tagToAdd && !tags.includes(tagToAdd)) {
      setTags([...tags, tagToAdd])
      setTagInput('')
    }
  }

  const handleQuickTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag])
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSave = () => {
    if (selectedText && (comment.trim() || tags.length > 0)) {
      onSave({
        text: selectedText,
        comment: comment.trim(),
        tags,
        highlightColor
      })
      setComment('')
      setTags([])
      setTagInput('')
      setHighlightColor(HIGHLIGHT_COLORS[0].value)
      onClose()
    }
  }

  if (!selectedText) return null

  return (
    <div className="h-full flex flex-col bg-card border-l border-border shadow-lg">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-accent/5 to-transparent">
        <div className="flex items-center gap-2">
          <Chat size={20} weight="fill" className="text-accent" />
          <h3 className="font-semibold text-base">Add Annotation</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose}
          className="hover:bg-accent/10 transition-colors"
        >
          <X size={20} weight="bold" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div>
          <Label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase tracking-wide">
            Selected Text
          </Label>
          <div className="p-3 bg-accent/10 border border-accent/20 rounded-md text-sm leading-relaxed">
            "{selectedText}"
          </div>
        </div>

        <div>
          <Label className="text-sm font-semibold mb-2 block">
            Highlight Color
          </Label>
          <div className="flex flex-wrap gap-2">
            {HIGHLIGHT_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setHighlightColor(color.value)}
                className={cn(
                  'w-10 h-10 rounded-lg border-2 transition-all hover:scale-110',
                  highlightColor === color.value 
                    ? 'border-foreground shadow-lg ring-2 ring-accent/30' 
                    : 'border-border hover:border-accent/50'
                )}
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                {highlightColor === color.value && (
                  <div className="flex items-center justify-center">
                    <Palette size={18} weight="fill" className="text-foreground drop-shadow-sm" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="comment" className="text-sm font-semibold mb-2 block">
            Comment
          </Label>
          <Textarea
            id="comment"
            placeholder="Add your audit notes here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[120px] resize-none focus:ring-2 focus:ring-accent/20 transition-all"
          />
        </div>

        <div>
          <Label htmlFor="tags" className="text-sm font-semibold mb-2 block">
            Tags
          </Label>
          
          <div className="mb-3">
            <Label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase tracking-wide">
              Quick Selection
            </Label>
            <div className="flex flex-wrap gap-2">
              {PRECONFIGURED_TAGS.map((preTag) => (
                <Button
                  key={preTag.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickTag(preTag.label)}
                  disabled={tags.includes(preTag.label)}
                  className={cn(
                    "font-mono text-xs transition-all",
                    tags.includes(preTag.label) 
                      ? "bg-accent/20 border-accent text-accent-foreground" 
                      : "hover:bg-accent/10 hover:border-accent/50"
                  )}
                  title={preTag.description}
                >
                  {preTag.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 mb-2">
            <Input
              id="tags"
              placeholder="Enter custom tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddTag()
                }
              }}
              className="focus:ring-2 focus:ring-accent/20 transition-all"
            />
            <Button 
              onClick={() => handleAddTag()} 
              size="sm" 
              variant="outline"
              className="transition-all hover:bg-accent/10 hover:border-accent/30"
            >
              <Tag size={16} weight="bold" />
            </Button>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="font-mono text-xs pl-2 pr-1 gap-1 bg-accent/10 text-accent-foreground hover:bg-accent/20 transition-colors"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-destructive transition-colors"
                  >
                    <X size={12} weight="bold" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-border flex gap-2 bg-muted/30">
        <Button 
          variant="outline" 
          onClick={onClose} 
          className="flex-1 transition-all hover:shadow-md"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!comment.trim() && tags.length === 0}
          className="flex-1 transition-all hover:shadow-md"
        >
          Save Annotation
        </Button>
      </div>
    </div>
  )
}
