import { useState } from 'react'
import { X, MagnifyingGlass, CircleDashed, ChatCircle, Trash } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface Annotation {
  id: string
  text: string
  comment: string
  tags: string[]
  nodeId: string
  timestamp?: Date
  page?: number
  documentId?: string
  highlightColor?: string
}

interface CommentsPanelProps {
  annotations: Annotation[]
  onClose: () => void
  onDelete?: (id: string) => void
  onCommentClick?: (annotation: Annotation) => void
}

type TagFilter = 'all' | 'FIND' | 'CLAR' | 'COMM'

export function CommentsPanel({ annotations, onClose, onDelete, onCommentClick }: CommentsPanelProps) {
  const [activeFilter, setActiveFilter] = useState<TagFilter>('all')

  const tagColors: Record<string, string> = {
    'FIND': 'bg-rose-100 text-rose-700 border-rose-200',
    'CLAR': 'bg-amber-100 text-amber-700 border-amber-200',
    'COMM': 'bg-blue-100 text-blue-700 border-blue-200'
  }

  const getTagCount = (tag: TagFilter): number => {
    if (tag === 'all') return annotations.length
    return annotations.filter(a => a.tags.includes(tag)).length
  }

  const filteredAnnotations = activeFilter === 'all'
    ? annotations
    : annotations.filter(a => a.tags.includes(activeFilter))

  const sortedAnnotations = [...filteredAnnotations].sort((a, b) => {
    const pageA = a.page || 0
    const pageB = b.page || 0
    return pageA - pageB
  })

  return (
    <div className="h-full flex flex-col bg-card border-l border-border shadow-lg">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-accent/5 to-transparent">
        <div className="flex items-center gap-2">
          <ChatCircle size={20} weight="fill" className="text-accent" />
          <h3 className="font-semibold text-base">Comments</h3>
          <Badge variant="secondary" className="ml-1 font-mono text-xs">
            {annotations.length}
          </Badge>
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

      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={activeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('all')}
            className={cn(
              'flex-1 min-w-[60px] gap-1.5 transition-all',
              activeFilter === 'all' && 'shadow-sm'
            )}
          >
            All ({getTagCount('all')})
          </Button>
          <Button
            variant={activeFilter === 'FIND' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('FIND')}
            className={cn(
              'flex-1 min-w-[60px] gap-1.5 transition-all',
              activeFilter === 'FIND' && 'shadow-sm'
            )}
          >
            <MagnifyingGlass size={14} weight="bold" />
            FIND ({getTagCount('FIND')})
          </Button>
          <Button
            variant={activeFilter === 'CLAR' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('CLAR')}
            className={cn(
              'flex-1 min-w-[60px] gap-1.5 transition-all',
              activeFilter === 'CLAR' && 'shadow-sm'
            )}
          >
            <CircleDashed size={14} weight="bold" />
            CLAR ({getTagCount('CLAR')})
          </Button>
          <Button
            variant={activeFilter === 'COMM' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('COMM')}
            className={cn(
              'flex-1 min-w-[60px] gap-1.5 transition-all',
              activeFilter === 'COMM' && 'shadow-sm'
            )}
          >
            <ChatCircle size={14} weight="bold" />
            COMM ({getTagCount('COMM')})
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {sortedAnnotations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <ChatCircle size={48} weight="duotone" className="text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground font-medium">
              No comments {activeFilter !== 'all' ? `with tag "${activeFilter}"` : 'yet'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Select text in the PDF to add comments
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedAnnotations.map((annotation) => (
              <Card
                key={annotation.id}
                className="p-4 border border-border hover:shadow-md transition-all cursor-pointer group"
                onClick={() => onCommentClick?.(annotation)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  {annotation.page && (
                    <Badge variant="outline" className="text-xs font-mono">
                      Page {annotation.page}
                    </Badge>
                  )}
                  <div className="flex items-center gap-1 ml-auto">
                    {annotation.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className={cn(
                          'text-xs font-semibold',
                          tagColors[tag] || 'bg-gray-100 text-gray-700 border-gray-200'
                        )}
                      >
                        {tag === 'FIND' && <MagnifyingGlass size={12} weight="bold" className="mr-1" />}
                        {tag === 'CLAR' && <CircleDashed size={12} weight="bold" className="mr-1" />}
                        {tag === 'COMM' && <ChatCircle size={12} weight="bold" className="mr-1" />}
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {annotation.text && (
                  <div className="mb-2 p-2 bg-accent/5 border-l-2 border-accent rounded text-xs text-muted-foreground italic">
                    "{annotation.text}"
                  </div>
                )}

                {annotation.comment && (
                  <p className="text-sm text-foreground leading-relaxed mb-2">
                    {annotation.comment}
                  </p>
                )}

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                  {annotation.timestamp && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(annotation.timestamp).toLocaleDateString()} {new Date(annotation.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(annotation.id)
                      }}
                      className="h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash size={14} weight="bold" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
