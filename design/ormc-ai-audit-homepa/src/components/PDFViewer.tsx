import { useState, useMemo, useRef, useEffect } from 'react'
import { MagnifyingGlassPlus, MagnifyingGlassMinus, CaretLeft, CaretRight, Square, ArrowRight, Cursor, Circle, Triangle, Shapes } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Annotation } from '@/components/CommentsPanel'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface Shape {
  id: string
  type: 'box' | 'arrow' | 'circle' | 'triangle'
  page: number
  x: number
  y: number
  width: number
  height: number
  color: string
}

interface PDFViewerProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onTextSelect?: (text: string) => void
  annotations?: Annotation[]
  shapes?: Shape[]
  onShapesChange?: (shapes: Shape[]) => void
}

export function PDFViewer({ currentPage, totalPages, onPageChange, onTextSelect, annotations = [], shapes = [], onShapesChange }: PDFViewerProps) {
  const [zoom, setZoom] = useState(110)
  const [drawMode, setDrawMode] = useState<'select' | 'box' | 'arrow' | 'circle' | 'triangle'>('select')
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null)
  const [tempShape, setTempShape] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null)
  const documentRef = useRef<HTMLDivElement>(null)

  const handleZoomIn = () => setZoom(Math.min(zoom + 10, 200))
  const handleZoomOut = () => setZoom(Math.max(zoom - 10, 50))
  
  const pageAnnotations = useMemo(() => {
    return annotations.filter(a => a.page === currentPage)
  }, [annotations, currentPage])

  const pageShapes = useMemo(() => {
    return shapes.filter(s => s.page === currentPage)
  }, [shapes, currentPage])

  const handlePrevPage = () => {
    if (currentPage > 1) onPageChange(currentPage - 1)
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1)
  }

  const getRelativePosition = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!documentRef.current) return { x: 0, y: 0 }
    const rect = documentRef.current.getBoundingClientRect()
    const scaleMultiplier = zoom / 100
    return {
      x: (e.clientX - rect.left) / scaleMultiplier,
      y: (e.clientY - rect.top) / scaleMultiplier
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (drawMode === 'select') {
      const clickedShape = pageShapes.find(shape => {
        const pos = getRelativePosition(e)
        return pos.x >= shape.x && pos.x <= shape.x + shape.width &&
               pos.y >= shape.y && pos.y <= shape.y + shape.height
      })

      if (clickedShape) {
        const pos = getRelativePosition(e)
        setSelectedShapeId(clickedShape.id)
        setDragOffset({
          x: pos.x - clickedShape.x,
          y: pos.y - clickedShape.y
        })
      } else {
        setSelectedShapeId(null)
      }
    } else {
      const pos = getRelativePosition(e)
      setStartPos(pos)
      setIsDrawing(true)
      setTempShape({ x: pos.x, y: pos.y, width: 0, height: 0 })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (drawMode === 'select' && selectedShapeId && dragOffset) {
      const pos = getRelativePosition(e)
      const updatedShapes = shapes.map(shape => 
        shape.id === selectedShapeId 
          ? { ...shape, x: pos.x - dragOffset.x, y: pos.y - dragOffset.y }
          : shape
      )
      onShapesChange?.(updatedShapes)
    } else if (isDrawing && startPos) {
      const pos = getRelativePosition(e)
      setTempShape({
        x: Math.min(startPos.x, pos.x),
        y: Math.min(startPos.y, pos.y),
        width: Math.abs(pos.x - startPos.x),
        height: Math.abs(pos.y - startPos.y)
      })
    }
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (drawMode === 'select' && selectedShapeId) {
      setDragOffset(null)
    } else if (isDrawing && tempShape && (tempShape.width > 10 || tempShape.height > 10)) {
      const newShape: Shape = {
        id: Date.now().toString(),
        type: drawMode as 'box' | 'arrow' | 'circle' | 'triangle',
        page: currentPage,
        x: tempShape.x,
        y: tempShape.y,
        width: tempShape.width,
        height: tempShape.height,
        color: 'oklch(0.68 0.18 45)'
      }
      onShapesChange?.([...shapes, newShape])
    }
    setIsDrawing(false)
    setStartPos(null)
    setTempShape(null)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedShapeId) {
        const updatedShapes = shapes.filter(s => s.id !== selectedShapeId)
        onShapesChange?.(updatedShapes)
        setSelectedShapeId(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedShapeId, shapes, onShapesChange])

  const sampleContent = currentPage === 9 ? `7. Chemical Waste Disposal

General Principles:
• Never pour chemicals down the drain unless specifically approved
• Segregate waste by compatibility
• Label all waste containers clearly
• Keep waste containers closed when not in use
• Store waste containers in secondary containment until full

Waste Categories:

1. Halogenated Organic Waste:
Examples: Chloroform, methylene chloroform, carbon tetrachloride
Container: Safety can with flame arrester labeled "Halogenated Waste"
Location: Fume hood 1, secondary containment tray

2. Non-Halogenated Organic Waste:
Examples: Acetone, toluene, hexane, ethyl acetate
Container: Safety can with flame arrester
Location: Flammable cabinet

3. Aqueous Waste:
Examples: Dilute acid/base solutions, salt solutions
Container: Plastic carboy
Note: pH must be between 5-9 before disposal

4. Sharps:
Examples: Needles, broken glass, disposable blades
Container: Rigid sharps container
Location: Under each fume hood

Waste Pickup:
Request pickup via EH&S360 portal. Typical response time: 2-3 business days. Emergency pickup available for urgent situations.` : `Document Content - Page ${currentPage}

This is a simulated PDF viewer showing page ${currentPage} of ${totalPages}.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Section ${currentPage}.1: Introduction
Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.

Section ${currentPage}.2: Details
At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentibus voluptatum deleniti atque corrupti.`

  const renderHighlightedContent = useMemo(() => {
    if (pageAnnotations.length === 0) {
      return <>{sampleContent}</>
    }

    let content = sampleContent
    const highlights: Array<{ start: number; end: number; color: string }> = []

    pageAnnotations.forEach((annotation) => {
      if (annotation.text) {
        const index = content.indexOf(annotation.text)
        if (index !== -1) {
          highlights.push({
            start: index,
            end: index + annotation.text.length,
            color: annotation.highlightColor || 'oklch(0.95 0.15 100)',
          })
        }
      }
    })

    highlights.sort((a, b) => a.start - b.start)

    const segments: React.ReactNode[] = []
    let lastIndex = 0

    highlights.forEach((highlight, idx) => {
      if (lastIndex < highlight.start) {
        segments.push(content.substring(lastIndex, highlight.start))
      }

      segments.push(
        <mark
          key={`highlight-${idx}`}
          style={{
            backgroundColor: highlight.color,
            padding: '2px 0',
            borderRadius: '2px',
          }}
        >
          {content.substring(highlight.start, highlight.end)}
        </mark>
      )

      lastIndex = highlight.end
    })

    if (lastIndex < content.length) {
      segments.push(content.substring(lastIndex))
    }

    return <>{segments}</>
  }, [sampleContent, pageAnnotations])

  return (
    <div className="flex flex-col h-full bg-muted/30">
      <div className="flex items-center justify-between px-6 py-3 bg-card border-b border-border shadow-sm">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="transition-all hover:shadow-md hover:border-accent/30"
          >
            <CaretLeft size={16} weight="bold" />
          </Button>
          <span className="text-sm font-semibold min-w-[120px] text-center">
            Page {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="transition-all hover:shadow-md hover:border-accent/30"
          >
            <CaretRight size={16} weight="bold" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-5 w-px bg-border mx-1" />
          <Button 
            variant={drawMode === 'select' ? 'default' : 'outline'}
            size="sm" 
            onClick={() => setDrawMode('select')}
            className="transition-all hover:shadow-md hover:border-accent/30"
            title="Select and move shapes"
          >
            <Cursor size={16} weight={drawMode === 'select' ? 'fill' : 'regular'} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant={drawMode !== 'select' ? 'default' : 'outline'}
                size="sm" 
                className="transition-all hover:shadow-md hover:border-accent/30 gap-1.5"
                title="Draw shapes"
              >
                <Shapes size={16} weight={drawMode !== 'select' ? 'fill' : 'regular'} />
                Shapes
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-40">
              <DropdownMenuItem 
                onClick={() => setDrawMode('box')}
                className="gap-2 cursor-pointer"
              >
                <Square size={16} weight={drawMode === 'box' ? 'fill' : 'regular'} />
                Box
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setDrawMode('circle')}
                className="gap-2 cursor-pointer"
              >
                <Circle size={16} weight={drawMode === 'circle' ? 'fill' : 'regular'} />
                Circle
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setDrawMode('triangle')}
                className="gap-2 cursor-pointer"
              >
                <Triangle size={16} weight={drawMode === 'triangle' ? 'fill' : 'regular'} />
                Triangle
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setDrawMode('arrow')}
                className="gap-2 cursor-pointer"
              >
                <ArrowRight size={16} weight={drawMode === 'arrow' ? 'bold' : 'regular'} />
                Arrow
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="h-5 w-px bg-border mx-1" />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleZoomOut}
            className="transition-all hover:shadow-md hover:border-accent/30"
          >
            <MagnifyingGlassMinus size={16} weight="bold" />
          </Button>
          <span className="text-sm font-semibold min-w-[60px] text-center font-mono">
            {zoom}%
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleZoomIn}
            className="transition-all hover:shadow-md hover:border-accent/30"
          >
            <MagnifyingGlassPlus size={16} weight="bold" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div
          ref={documentRef}
          className={cn(
            'max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8 relative',
            'transition-all duration-200 origin-top',
            drawMode !== 'select' && 'cursor-crosshair'
          )}
          style={{ transform: `scale(${zoom / 100})` }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <div
            className="whitespace-pre-wrap text-foreground leading-relaxed select-text"
            onMouseUp={() => {
              if (drawMode === 'select') {
                const selection = window.getSelection()
                const text = selection?.toString().trim()
                if (text && text.length > 0 && onTextSelect) {
                  onTextSelect(text)
                }
              }
            }}
          >
            {renderHighlightedContent}
          </div>

          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ top: 0, left: 0 }}
          >
            {pageShapes.map(shape => (
              <g key={shape.id} className="pointer-events-auto">
                {shape.type === 'box' ? (
                  <rect
                    x={shape.x}
                    y={shape.y}
                    width={shape.width}
                    height={shape.height}
                    fill="none"
                    stroke={shape.color}
                    strokeWidth="3"
                    className={cn(
                      'transition-all',
                      selectedShapeId === shape.id && 'stroke-[4]'
                    )}
                    style={{
                      filter: selectedShapeId === shape.id ? 'drop-shadow(0 0 8px oklch(0.68 0.18 45 / 0.6))' : 'none'
                    }}
                  />
                ) : shape.type === 'circle' ? (
                  <ellipse
                    cx={shape.x + shape.width / 2}
                    cy={shape.y + shape.height / 2}
                    rx={shape.width / 2}
                    ry={shape.height / 2}
                    fill="none"
                    stroke={shape.color}
                    strokeWidth="3"
                    className={cn(
                      'transition-all',
                      selectedShapeId === shape.id && 'stroke-[4]'
                    )}
                    style={{
                      filter: selectedShapeId === shape.id ? 'drop-shadow(0 0 8px oklch(0.68 0.18 45 / 0.6))' : 'none'
                    }}
                  />
                ) : shape.type === 'triangle' ? (
                  <polygon
                    points={`${shape.x + shape.width / 2},${shape.y} ${shape.x + shape.width},${shape.y + shape.height} ${shape.x},${shape.y + shape.height}`}
                    fill="none"
                    stroke={shape.color}
                    strokeWidth="3"
                    className={cn(
                      'transition-all',
                      selectedShapeId === shape.id && 'stroke-[4]'
                    )}
                    style={{
                      filter: selectedShapeId === shape.id ? 'drop-shadow(0 0 8px oklch(0.68 0.18 45 / 0.6))' : 'none'
                    }}
                  />
                ) : (
                  <>
                    <defs>
                      <marker
                        id={`arrowhead-${shape.id}`}
                        markerWidth="10"
                        markerHeight="10"
                        refX="9"
                        refY="3"
                        orient="auto"
                      >
                        <polygon points="0 0, 10 3, 0 6" fill={shape.color} />
                      </marker>
                    </defs>
                    <line
                      x1={shape.x}
                      y1={shape.y + shape.height / 2}
                      x2={shape.x + shape.width}
                      y2={shape.y + shape.height / 2}
                      stroke={shape.color}
                      strokeWidth="3"
                      markerEnd={`url(#arrowhead-${shape.id})`}
                      className={cn(
                        'transition-all',
                        selectedShapeId === shape.id && 'stroke-[4]'
                      )}
                      style={{
                        filter: selectedShapeId === shape.id ? 'drop-shadow(0 0 8px oklch(0.68 0.18 45 / 0.6))' : 'none'
                      }}
                    />
                  </>
                )}
              </g>
            ))}

            {tempShape && (
              drawMode === 'box' ? (
                <rect
                  x={tempShape.x}
                  y={tempShape.y}
                  width={tempShape.width}
                  height={tempShape.height}
                  fill="none"
                  stroke="oklch(0.68 0.18 45)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  opacity="0.7"
                />
              ) : drawMode === 'circle' ? (
                <ellipse
                  cx={tempShape.x + tempShape.width / 2}
                  cy={tempShape.y + tempShape.height / 2}
                  rx={tempShape.width / 2}
                  ry={tempShape.height / 2}
                  fill="none"
                  stroke="oklch(0.68 0.18 45)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  opacity="0.7"
                />
              ) : drawMode === 'triangle' ? (
                <polygon
                  points={`${tempShape.x + tempShape.width / 2},${tempShape.y} ${tempShape.x + tempShape.width},${tempShape.y + tempShape.height} ${tempShape.x},${tempShape.y + tempShape.height}`}
                  fill="none"
                  stroke="oklch(0.68 0.18 45)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  opacity="0.7"
                />
              ) : (
                <>
                  <defs>
                    <marker
                      id="arrowhead-temp"
                      markerWidth="10"
                      markerHeight="10"
                      refX="9"
                      refY="3"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3, 0 6" fill="oklch(0.68 0.18 45)" opacity="0.7" />
                    </marker>
                  </defs>
                  <line
                    x1={tempShape.x}
                    y1={tempShape.y + tempShape.height / 2}
                    x2={tempShape.x + tempShape.width}
                    y2={tempShape.y + tempShape.height / 2}
                    stroke="oklch(0.68 0.18 45)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    markerEnd="url(#arrowhead-temp)"
                    opacity="0.7"
                  />
                </>
              )
            )}
          </svg>
        </div>
      </div>
    </div>
  )
}
