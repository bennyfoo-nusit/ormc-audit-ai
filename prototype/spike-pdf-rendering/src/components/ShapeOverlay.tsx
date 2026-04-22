import { useState, useRef, useCallback } from 'react'

export interface Shape {
  id: string
  page: number
  type: 'rect' | 'circle'
  x: number
  y: number
  width: number
  height: number
  color: string
}

interface ShapeOverlayProps {
  shapes: Shape[]
  drawMode: 'select' | 'rect' | 'circle'
  scale: number
  onShapeAdd: (shape: Shape) => void
}

export function ShapeOverlay({ shapes, drawMode, scale, onShapeAdd }: ShapeOverlayProps) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null)
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const getRelativePos = useCallback((e: React.MouseEvent) => {
    if (!overlayRef.current) return { x: 0, y: 0 }
    const rect = overlayRef.current.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale,
    }
  }, [scale])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (drawMode === 'select') return
    e.preventDefault()
    const pos = getRelativePos(e)
    setStartPos(pos)
    setCurrentPos(pos)
    setIsDrawing(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return
    setCurrentPos(getRelativePos(e))
  }

  const handleMouseUp = () => {
    if (!isDrawing || !startPos || !currentPos) return
    setIsDrawing(false)

    const x = Math.min(startPos.x, currentPos.x)
    const y = Math.min(startPos.y, currentPos.y)
    const width = Math.abs(currentPos.x - startPos.x)
    const height = Math.abs(currentPos.y - startPos.y)

    if (width < 5 && height < 5) return // too small

    onShapeAdd({
      id: crypto.randomUUID(),
      page: 0, // filled by parent
      type: drawMode as 'rect' | 'circle',
      x, y, width, height,
      color: drawMode === 'rect' ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 100, 255, 0.2)',
    })

    setStartPos(null)
    setCurrentPos(null)
  }

  const tempShape = isDrawing && startPos && currentPos ? {
    x: Math.min(startPos.x, currentPos.x),
    y: Math.min(startPos.y, currentPos.y),
    width: Math.abs(currentPos.x - startPos.x),
    height: Math.abs(currentPos.y - startPos.y),
  } : null

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        cursor: drawMode !== 'select' ? 'crosshair' : 'default',
        pointerEvents: drawMode !== 'select' ? 'auto' : 'none',
        zIndex: drawMode !== 'select' ? 10 : 1,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <svg
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      >
        {/* Existing shapes */}
        {shapes.map(s => (
          s.type === 'rect' ? (
            <rect
              key={s.id}
              x={s.x * scale}
              y={s.y * scale}
              width={s.width * scale}
              height={s.height * scale}
              fill={s.color}
              stroke="red"
              strokeWidth={2}
            />
          ) : (
            <ellipse
              key={s.id}
              cx={(s.x + s.width / 2) * scale}
              cy={(s.y + s.height / 2) * scale}
              rx={(s.width / 2) * scale}
              ry={(s.height / 2) * scale}
              fill={s.color}
              stroke="blue"
              strokeWidth={2}
            />
          )
        ))}

        {/* Temp drawing shape */}
        {tempShape && drawMode === 'rect' && (
          <rect
            x={tempShape.x * scale}
            y={tempShape.y * scale}
            width={tempShape.width * scale}
            height={tempShape.height * scale}
            fill="rgba(255, 0, 0, 0.1)"
            stroke="red"
            strokeWidth={1}
            strokeDasharray="4"
          />
        )}
        {tempShape && drawMode === 'circle' && (
          <ellipse
            cx={(tempShape.x + tempShape.width / 2) * scale}
            cy={(tempShape.y + tempShape.height / 2) * scale}
            rx={(tempShape.width / 2) * scale}
            ry={(tempShape.height / 2) * scale}
            fill="rgba(0, 100, 255, 0.1)"
            stroke="blue"
            strokeWidth={1}
            strokeDasharray="4"
          />
        )}
      </svg>
    </div>
  )
}
