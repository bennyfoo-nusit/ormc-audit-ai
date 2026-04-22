import { useState, useMemo } from 'react'
import { useKV } from '@/hooks/use-kv'
import { Highlighter, ChatCircle, FolderOpen, Funnel, X, MagnifyingGlass } from '@phosphor-icons/react'
import { DocumentTree, TreeNode } from '@/components/DocumentTree'
import { PDFViewer, Shape } from '@/components/PDFViewer'
import { AnnotationPanel } from '@/components/AnnotationPanel'
import { CommentsPanel, Annotation } from '@/components/CommentsPanel'
import { AIChatPanel } from '@/components/AIChatPanel'
import { SidePanel } from '@/components/SidePanel'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { toast } from 'sonner'
import { Project } from '@/components/DossiersHome'
import { Document } from '@/components/DocumentManagement'
import { cn } from '@/lib/utils'

type RightPanelTab = 'annotate' | 'comments'

interface WorkingPageProps {
  projectId: string
  onNavigateToDocuments?: () => void
}

export function WorkingPage({ projectId, onNavigateToDocuments }: WorkingPageProps) {
  const [currentPage, setCurrentPage] = useState(9)
  const [activeNodeId, setActiveNodeId] = useState<string | null>('section-7')
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([])
  const [selectedText, setSelectedText] = useState<string | null>(null)
  const [annotations, setAnnotations] = useKV<Annotation[]>(`annotations-${projectId}`, [])
  const [shapes, setShapes] = useKV<Shape[]>(`shapes-${projectId}`, [])
  const [projects] = useKV<Project[]>('projects-list', [])
  const [documents] = useKV<Document[]>(`documents-${projectId}`, [])
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null)
  const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab>('annotate')
  const [showDocTree, setShowDocTree] = useKV<boolean>('show-doc-tree', true)
  const [showActionPanel, setShowActionPanel] = useKV<boolean>('show-action-panel', true)
  const [showAIChat, setShowAIChat] = useKV<boolean>('show-ai-chat', true)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchKeyword, setSearchKeyword] = useState<string>('')

  const currentProject = projects?.find(p => p.id === projectId)

  const totalPages = 13

  const attachedDocuments = useMemo(() => {
    if (selectedNodeIds.length === 0) {
      return []
    }

    const docs: { id: string; name: string; pageRange: string }[] = []

    selectedNodeIds.forEach(nodeId => {
      if (nodeId.startsWith('project-')) {
        const project = projects?.find(p => p.id === projectId)
        if (project) {
          docs.push({
            id: nodeId,
            name: project.title,
            pageRange: 'All documents'
          })
        }
      } else if (nodeId.startsWith('file-')) {
        const docId = nodeId.replace('file-', '')
        const doc = documents?.find(d => d.id === docId)
        if (doc) {
          docs.push({
            id: nodeId,
            name: doc.name,
            pageRange: 'All pages'
          })
        }
      } else if (nodeId.startsWith('bookmark-')) {
        const annotationId = nodeId.replace('bookmark-', '')
        const annotation = annotations?.find(a => a.id === annotationId)
        if (annotation) {
          const doc = documents?.find(d => d.id === annotation.documentId)
          const title = annotation.comment && annotation.comment.length > 50 
            ? annotation.comment.substring(0, 50) + '...' 
            : annotation.comment || 'Untitled Bookmark'
          docs.push({
            id: nodeId,
            name: `${doc?.name || 'Document'}: ${title}`,
            pageRange: annotation.page ? `p.${annotation.page}` : 'Unknown page'
          })
        }
      }
    })

    return docs
  }, [selectedNodeIds, projects, projectId, documents, annotations])

  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    documents?.forEach(doc => {
      doc.tags?.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [documents])

  const filteredDocuments = useMemo(() => {
    let filtered = documents || []
    
    if (selectedTags.length > 0) {
      filtered = filtered.filter(doc => 
        selectedTags.every(selectedTag => doc.tags?.includes(selectedTag))
      )
    }
    
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase()
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(keyword)
      )
    }
    
    return filtered
  }, [documents, selectedTags, searchKeyword])

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const clearAllTags = () => {
    setSelectedTags([])
  }

  const documentTree = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase()
    
    const fileNodes: TreeNode[] = (filteredDocuments || []).map(doc => {
      let docBookmarks: TreeNode[] = (annotations || [])
        .filter(a => a.comment && typeof a.comment === 'string' && a.comment.trim() && a.documentId === doc.id)
        .sort((a, b) => {
          const pageA = a.page || 0
          const pageB = b.page || 0
          return pageA - pageB
        })
        .map(a => {
          const comment = a.comment || ''
          const title = comment && comment.length > 50 ? comment.substring(0, 50) + '...' : comment
          return {
            id: `bookmark-${a.id}`,
            title: title || 'Untitled Bookmark',
            pageRef: a.page ? `p.${a.page}` : undefined,
            hasAnnotation: true,
            annotationId: a.id
          }
        })
      
      if (keyword) {
        docBookmarks = docBookmarks.filter(bookmark => 
          bookmark.title.toLowerCase().includes(keyword)
        )
      }

      return {
        id: `file-${doc.id}`,
        title: doc.name,
        children: docBookmarks.length > 0 ? docBookmarks : undefined
      }
    })

    const rootNode: TreeNode = {
      id: `project-${projectId}`,
      title: currentProject?.title || 'Project',
      children: fileNodes.length > 0 ? fileNodes : undefined
    }

    return [rootNode]
  }, [projectId, currentProject, annotations, filteredDocuments, searchKeyword])

  const handleTreeSelect = (id: string, pageRef: string | undefined, isCtrlClick: boolean) => {
    if (isCtrlClick) {
      setSelectedNodeIds(prev => {
        if (prev.includes(id)) {
          const newSelection = prev.filter(nodeId => nodeId !== id)
          if (newSelection.length === 0) {
            toast.info('Selection cleared')
          }
          return newSelection
        } else {
          const newSelection = [...prev, id]
          toast.success(`${newSelection.length} item${newSelection.length > 1 ? 's' : ''} selected`)
          return newSelection
        }
      })
      setActiveNodeId(id)
    } else {
      setActiveNodeId(id)
      setSelectedNodeIds([id])
      
      if (id.startsWith('file-')) {
        const docId = id.replace('file-', '')
        setCurrentDocumentId(docId)
      }
      
      if (pageRef) {
        const pageMatch = pageRef.match(/p\.(\d+)/)
        if (pageMatch) {
          setCurrentPage(parseInt(pageMatch[1]))
        }
      }
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleTextSelect = (text: string) => {
    setSelectedText(text)
  }

  const handleSaveAnnotation = (annotation: { text: string; comment: string; tags: string[]; highlightColor: string }) => {
    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      ...annotation,
      nodeId: activeNodeId || 'unknown',
      page: currentPage,
      timestamp: new Date(),
      documentId: currentDocumentId || (documents && documents[0]?.id) || undefined
    }
    setAnnotations((current) => [...(current || []), newAnnotation])
    toast.success('Annotation saved successfully')
    setRightPanelTab('comments')
  }

  const handleDeleteAnnotation = (id: string) => {
    setAnnotations((current) => (current || []).filter(a => a.id !== id))
    toast.success('Comment deleted')
  }

  const handleCommentClick = (annotation: Annotation) => {
    if (annotation.page) {
      setCurrentPage(annotation.page)
    }
    setActiveNodeId(`bookmark-${annotation.id}`)
  }

  const handleRemoveAttachedDocument = (docId: string) => {
    setSelectedNodeIds(prev => {
      const newSelection = prev.filter(id => id !== docId)
      if (newSelection.length === 0) {
        toast.info('Document removed from AI context')
      } else {
        toast.success(`Document removed - ${newSelection.length} remaining`)
      }
      return newSelection
    })
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      <SidePanel
        showDocTree={showDocTree ?? true}
        showActionPanel={showActionPanel ?? true}
        showAIChat={showAIChat ?? true}
        onToggleDocTree={() => setShowDocTree((current) => !current)}
        onToggleActionPanel={() => setShowActionPanel((current) => !current)}
        onToggleAIChat={() => setShowAIChat((current) => !current)}
      />
      <ResizablePanelGroup direction="horizontal">
        {showDocTree && (
          <>
            <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
              <aside className="h-full border-r border-border bg-card overflow-auto shadow-sm">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-5 bg-accent rounded-full shadow-sm shadow-accent/50" />
                      <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Document Structure
                      </h2>
                    </div>
                    {onNavigateToDocuments && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onNavigateToDocuments}
                        className="h-7 gap-1.5 text-xs hover:bg-accent/10 hover:text-accent-foreground"
                      >
                        <FolderOpen size={14} weight="fill" />
                        Manage
                      </Button>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="relative">
                      <MagnifyingGlass 
                        size={16} 
                        weight="bold"
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                      />
                      <Input
                        type="text"
                        placeholder="Search documents..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        className="pl-9 pr-9 h-9 text-sm transition-all focus:ring-2 focus:ring-accent/50"
                      />
                      {searchKeyword && (
                        <button
                          onClick={() => setSearchKeyword('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <X size={14} weight="bold" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {allTags.length > 0 && (
                    <div className="mb-4">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={cn(
                              "w-full justify-start gap-2 text-xs h-8",
                              selectedTags.length > 0 && "border-accent bg-accent/5"
                            )}
                          >
                            <Funnel size={14} weight={selectedTags.length > 0 ? "fill" : "regular"} />
                            Filter by Tags
                            {selectedTags.length > 0 && (
                              <Badge variant="secondary" className="ml-auto text-xs px-1.5 py-0">
                                {selectedTags.length}
                              </Badge>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[280px] p-3" align="start">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-sm">Filter Documents</h4>
                              {selectedTags.length > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={clearAllTags}
                                  className="h-6 text-xs gap-1 px-2"
                                >
                                  <X size={12} weight="bold" />
                                  Clear
                                </Button>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Select tags to filter documents. Documents matching all selected tags will be shown.
                            </p>
                            <div className="flex flex-wrap gap-1.5 max-h-[200px] overflow-y-auto">
                              {allTags.map(tag => (
                                <Badge
                                  key={tag}
                                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                                  className={cn(
                                    "cursor-pointer transition-all text-xs px-2.5 py-1",
                                    selectedTags.includes(tag) 
                                      ? "bg-accent text-accent-foreground hover:bg-accent/80" 
                                      : "hover:bg-accent/10"
                                  )}
                                  onClick={() => toggleTag(tag)}
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      
                      {selectedTags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {selectedTags.map(tag => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs px-2 py-0.5 flex items-center gap-1 group cursor-pointer hover:bg-destructive/10"
                              onClick={() => toggleTag(tag)}
                            >
                              {tag}
                              <X size={10} weight="bold" className="group-hover:text-destructive" />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {selectedNodeIds.length > 0 && (
                    <div className="mb-3 p-2 bg-accent/10 border border-accent/20 rounded-md">
                      <p className="text-xs text-accent-foreground">
                        <span className="font-semibold">{selectedNodeIds.length} item{selectedNodeIds.length > 1 ? 's' : ''} selected</span>
                        {' · '}
                        <span className="text-muted-foreground">Click to clear</span>
                      </p>
                    </div>
                  )}

                  <DocumentTree
                    tree={documentTree}
                    activeId={activeNodeId}
                    selectedIds={selectedNodeIds}
                    onSelect={handleTreeSelect}
                  />
                </div>
              </aside>
            </ResizablePanel>
            <ResizableHandle withHandle />
          </>
        )}

        <ResizablePanel defaultSize={showDocTree && showActionPanel && showAIChat ? 40 : showDocTree || showActionPanel || showAIChat ? 60 : 100} minSize={30}>
          <main className="h-full flex overflow-hidden">
            <div className="flex-1">
              <PDFViewer
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onTextSelect={handleTextSelect}
                annotations={annotations || []}
                shapes={shapes || []}
                onShapesChange={setShapes}
              />
            </div>
          </main>
        </ResizablePanel>

        {showActionPanel && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
              <aside className="h-full border-r border-border bg-card">
                <Tabs value={rightPanelTab} onValueChange={(v) => setRightPanelTab(v as RightPanelTab)} className="h-full flex flex-col">
                  <TabsList className="mx-4 mt-4 grid w-auto grid-cols-2 bg-muted/50">
                    <TabsTrigger value="annotate" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                      <Highlighter size={16} weight="fill" />
                      Add
                    </TabsTrigger>
                    <TabsTrigger value="comments" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                      <ChatCircle size={16} weight="fill" />
                      View
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="annotate" className="flex-1 mt-0 data-[state=inactive]:hidden">
                    <AnnotationPanel
                      selectedText={selectedText}
                      onClose={() => setSelectedText(null)}
                      onSave={handleSaveAnnotation}
                    />
                  </TabsContent>
                  
                  <TabsContent value="comments" className="flex-1 mt-0 data-[state=inactive]:hidden">
                    <CommentsPanel
                      annotations={annotations || []}
                      onClose={() => setRightPanelTab('annotate')}
                      onDelete={handleDeleteAnnotation}
                      onCommentClick={handleCommentClick}
                    />
                  </TabsContent>
                </Tabs>
              </aside>
            </ResizablePanel>
          </>
        )}

        {showAIChat && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
              <aside className="h-full border-l border-border bg-card">
                <AIChatPanel 
                  attachedDocuments={attachedDocuments} 
                  onRemoveDocument={handleRemoveAttachedDocument}
                />
              </aside>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  )
}
