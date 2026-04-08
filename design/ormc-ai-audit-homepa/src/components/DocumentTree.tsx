import { useState } from 'react'
import { CaretRight, CaretDown, File } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export interface TreeNode {
  id: string
  title: string
  children?: TreeNode[]
  pageRef?: string
  hasAnnotation?: boolean
  annotationId?: string
}

interface TreeItemProps {
  node: TreeNode
  level: number
  activeId: string | null
  selectedIds: string[]
  onSelect: (id: string, pageRef: string | undefined, isCtrlClick: boolean) => void
}

function TreeItem({ node, level, activeId, selectedIds, onSelect }: TreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const hasChildren = node.children && node.children.length > 0
  const isActive = activeId === node.id
  const isSelected = selectedIds.includes(node.id)

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-all duration-200 group',
          'hover:bg-accent/5 hover:shadow-sm',
          (isActive || isSelected) && 'bg-accent/10 border-l-2 border-accent shadow-sm'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={(e) => {
          if (hasChildren) {
            setIsExpanded(!isExpanded)
          }
          onSelect(node.id, node.pageRef, e.ctrlKey || e.metaKey)
        }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-all duration-200"
          >
            <motion.div
              animate={{ rotate: isExpanded ? 0 : -90 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              <CaretDown size={16} weight="bold" />
            </motion.div>
          </button>
        ) : (
          <div className="w-4 shrink-0" />
        )}
        
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {!hasChildren && (
            <File 
              size={16} 
              weight="fill"
              className={cn(
                'shrink-0 transition-colors duration-200',
                (isActive || isSelected) ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground'
              )}
            />
          )}
          <span 
            className={cn(
              'text-sm truncate transition-all duration-200',
              (isActive || isSelected) ? 'font-semibold text-foreground' : 'text-foreground'
            )}
          >
            {node.title}
          </span>
        </div>

        {node.hasAnnotation && (
          <motion.div 
            className="w-2 h-2 rounded-full bg-accent shrink-0 shadow-sm"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {node.pageRef && (
          <span className="text-xs text-muted-foreground font-mono shrink-0">
            {node.pageRef}
          </span>
        )}
      </div>

      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            {node.children!.map((child) => (
              <TreeItem
                key={child.id}
                node={child}
                level={level + 1}
                activeId={activeId}
                selectedIds={selectedIds}
                onSelect={onSelect}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface DocumentTreeProps {
  tree: TreeNode[]
  activeId: string | null
  selectedIds: string[]
  onSelect: (id: string, pageRef: string | undefined, isCtrlClick: boolean) => void
}

export function DocumentTree({ tree, activeId, selectedIds, onSelect }: DocumentTreeProps) {
  return (
    <div className="space-y-1">
      {tree.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          level={0}
          activeId={activeId}
          selectedIds={selectedIds}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
