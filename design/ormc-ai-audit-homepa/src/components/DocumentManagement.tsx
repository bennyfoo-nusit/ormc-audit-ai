import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { FilePdf, Upload, Trash, Plus, FolderOpen, DotsSixVertical, File, Tag, Sparkle, Briefcase, X, PencilSimple } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'

export interface Document {
  id: string
  name: string
  fileName: string
  description: string
  uploadedAt: string
  fileSize?: string
  fileData?: string
  tags?: string[]
}

interface DocumentManagementProps {
  projectId: string
  projectTitle: string
  onNavigateBack?: () => void
  onNavigateToWorking?: () => void
}

export function DocumentManagement({ projectId, projectTitle, onNavigateBack, onNavigateToWorking }: DocumentManagementProps) {
  const [documents, setDocuments] = useKV<Document[]>(`documents-${projectId}`, [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newDocName, setNewDocName] = useState('')
  const [newDocDescription, setNewDocDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isGeneratingTags, setIsGeneratingTags] = useState(false)
  const [draggedItem, setDraggedItem] = useState<number | null>(null)
  const [dragOverItem, setDragOverItem] = useState<number | null>(null)
  const [generatingTagsForDoc, setGeneratingTagsForDoc] = useState<string | null>(null)
  const [editingTagsDoc, setEditingTagsDoc] = useState<Document | null>(null)
  const [editedTags, setEditedTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    console.log(`DocumentManagement loaded for project ${projectId}, documents:`, documents)
  }, [projectId, documents])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      if (!newDocName) {
        setNewDocName(file.name.replace(/\.[^/.]+$/, ''))
      }
    }
  }

  const generateAITags = async (fileName: string, description: string): Promise<string[]> => {
    try {
      const desc = description || 'No description provided'
      const promptFn = window.spark.llmPrompt as any
      const prompt = promptFn`Analyze this document and generate 3-5 relevant tags for categorization. 
      
      Document Name: ${fileName}
      Description: ${desc}
      
      Return only the tags as a JSON array of strings. Tags should be concise, relevant, and help with document organization.
      Example: ["Financial", "Q4 Report", "Budget"]`
      
      const result = await window.spark.llm(prompt, 'gpt-4o-mini', true)
      const parsed = JSON.parse(result)
      return Array.isArray(parsed) ? parsed : parsed.tags || []
    } catch (error) {
      console.error('Error generating tags:', error)
      return ['Document', 'Audit', 'Review']
    }
  }

  const handleAddDocument = async () => {
    if (!newDocName.trim()) {
      toast.error('Document name is required')
      return
    }

    if (!selectedFile) {
      toast.error('Please select a file to upload')
      return
    }

    setIsGeneratingTags(true)

    try {
      console.log('[DocumentManagement] Starting document upload process...')
      
      const tags = await generateAITags(newDocName, newDocDescription)
      console.log('[DocumentManagement] Tags generated:', tags)

      const newDocument: Document = {
        id: Date.now().toString(),
        name: newDocName.trim(),
        fileName: selectedFile.name,
        description: newDocDescription.trim(),
        uploadedAt: new Date().toISOString(),
        fileSize: formatFileSize(selectedFile.size),
        tags
      }

      console.log(`[DocumentManagement] Created new document object for documents-${projectId}:`, {
        id: newDocument.id,
        name: newDocument.name,
        fileName: newDocument.fileName,
        tagsCount: tags.length
      })

      const currentDocs = await window.spark.kv.get<Document[]>(`documents-${projectId}`) || []
      console.log(`[DocumentManagement] Current documents count: ${currentDocs.length}`)
      
      const updatedDocs = [...currentDocs, newDocument]
      console.log(`[DocumentManagement] Saving ${updatedDocs.length} documents to KV store...`)
      
      await window.spark.kv.set(`documents-${projectId}`, updatedDocs)
      console.log(`[DocumentManagement] KV store updated successfully`)
      
      setDocuments(updatedDocs)
      console.log('[DocumentManagement] Local state updated')

      setNewDocName('')
      setNewDocDescription('')
      setSelectedFile(null)
      setIsDialogOpen(false)
      
      console.log('[DocumentManagement] Document upload completed successfully')
      toast.success(`Document "${newDocument.name}" uploaded successfully`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('[DocumentManagement] Upload error:', error)
      toast.error(`Failed to upload document: ${errorMessage}`)
    } finally {
      setIsGeneratingTags(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleDeleteDocument = (id: string) => {
    setDocuments((current) => (current || []).filter(doc => doc.id !== id))
    toast.success('Document deleted')
  }

  const handleRegenerateTags = async (document: Document) => {
    setGeneratingTagsForDoc(document.id)
    
    try {
      const tags = await generateAITags(document.name, document.description)
      
      setDocuments((current) => 
        (current || []).map(doc => 
          doc.id === document.id ? { ...doc, tags } : doc
        )
      )
      
      toast.success('Tags generated successfully')
    } catch (error) {
      toast.error('Failed to generate tags')
    } finally {
      setGeneratingTagsForDoc(null)
    }
  }

  const handleOpenTagEditor = (document: Document) => {
    setEditingTagsDoc(document)
    setEditedTags(document.tags || [])
    setNewTag('')
  }

  const handleAddTag = () => {
    const trimmedTag = newTag.trim()
    if (!trimmedTag) {
      toast.error('Tag cannot be empty')
      return
    }
    if (editedTags.includes(trimmedTag)) {
      toast.error('Tag already exists')
      return
    }
    setEditedTags([...editedTags, trimmedTag])
    setNewTag('')
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setEditedTags(editedTags.filter(tag => tag !== tagToRemove))
  }

  const handleSaveTags = () => {
    if (!editingTagsDoc) return

    setDocuments((current) => 
      (current || []).map(doc => 
        doc.id === editingTagsDoc.id ? { ...doc, tags: editedTags } : doc
      )
    )

    toast.success('Tags updated successfully')
    setEditingTagsDoc(null)
    setEditedTags([])
    setNewTag('')
  }

  const handleDragStart = (index: number) => {
    setDraggedItem(index)
  }

  const handleDragEnter = (index: number) => {
    setDragOverItem(index)
  }

  const handleDragEnd = () => {
    if (draggedItem === null || dragOverItem === null) return
    if (draggedItem === dragOverItem) {
      setDraggedItem(null)
      setDragOverItem(null)
      return
    }

    setDocuments((current) => {
      const items = [...(current || [])]
      const draggedItemContent = items[draggedItem]
      items.splice(draggedItem, 1)
      items.splice(dragOverItem, 0, draggedItemContent)
      return items
    })

    setDraggedItem(null)
    setDragOverItem(null)
    toast.success('Document order updated')
  }

  const getFileIcon = (fileName?: string) => {
    if (!fileName) return <File size={24} weight="fill" className="text-primary" />
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') return <FilePdf size={24} weight="fill" className="text-destructive" />
    return <File size={24} weight="fill" className="text-primary" />
  }

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateBack || (() => window.history.back())}
              className="gap-2"
            >
              ← Back
            </Button>
            {onNavigateToWorking && (
              <>
                <div className="h-8 w-px bg-border" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onNavigateToWorking}
                  className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Briefcase size={18} weight="fill" />
                  Go to Working Page
                </Button>
              </>
            )}
            <div className="h-8 w-px bg-border" />
            <FolderOpen size={32} weight="fill" className="text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">{projectTitle}</h1>
              <p className="text-sm text-muted-foreground">Document Management</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              {documents && documents.length > 0 
                ? `${documents.length} document${documents.length === 1 ? '' : 's'} uploaded`
                : 'Upload and manage documents for this project'
              }
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 shadow-md hover:shadow-lg transition-all">
                  <Plus size={20} weight="bold" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload New Document</DialogTitle>
                  <DialogDescription>
                    Upload a document to this project. AI will automatically generate relevant tags.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="doc-upload">File</Label>
                    <Input
                      id="doc-upload"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileSelect}
                      className="cursor-pointer"
                    />
                    {selectedFile && (
                      <p className="text-xs text-muted-foreground">
                        Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Document metadata will be stored for reference purposes.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doc-name">Document Name</Label>
                    <Input
                      id="doc-name"
                      placeholder="Enter document name"
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doc-description">Description (Optional)</Label>
                    <Input
                      id="doc-description"
                      placeholder="Enter document description"
                      value={newDocDescription}
                      onChange={(e) => setNewDocDescription(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setIsDialogOpen(false)
                    setSelectedFile(null)
                    setNewDocName('')
                    setNewDocDescription('')
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddDocument} disabled={isGeneratingTags || !selectedFile || !newDocName.trim()}>
                    {isGeneratingTags ? 'Uploading...' : 'Upload'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {(!documents || documents.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
              <FilePdf size={48} className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Documents Yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Upload documents to start the AI-powered audit and review process for this project.
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Upload size={20} weight="bold" />
              Upload Your First Document
            </Button>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12"></TableHead>
                    <TableHead className="w-12">Type</TableHead>
                    <TableHead className="min-w-[200px]">Document Name</TableHead>
                    <TableHead className="min-w-[180px]">Original File</TableHead>
                    <TableHead className="min-w-[200px]">Tags</TableHead>
                    <TableHead className="w-[120px]">Uploaded</TableHead>
                    <TableHead className="w-[100px]">Size</TableHead>
                    <TableHead className="w-[140px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((document, index) => (
                    <TableRow
                      key={document.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragEnter={() => handleDragEnter(index)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => e.preventDefault()}
                      className={`cursor-move hover:bg-accent/5 transition-colors ${
                        dragOverItem === index ? 'bg-accent/10 border-l-4 border-l-accent' : ''
                      }`}
                    >
                      <TableCell>
                        <DotsSixVertical 
                          size={20} 
                          className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing" 
                          weight="bold"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          {getFileIcon(document.fileName)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-foreground">{document.name}</p>
                          {document.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {document.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-mono text-muted-foreground truncate max-w-[180px]">
                          {document.fileName}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 items-center">
                          {document.tags && document.tags.length > 0 ? (
                            document.tags.map((tag, i) => (
                              <Badge 
                                key={i} 
                                variant="secondary" 
                                className="text-xs px-2 py-0.5"
                              >
                                {tag}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">No tags</span>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenTagEditor(document)}
                            className="h-6 w-6 p-0 ml-1"
                            title="Edit tags manually"
                          >
                            <PencilSimple 
                              size={14} 
                              weight="bold" 
                              className="text-muted-foreground hover:text-primary"
                            />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRegenerateTags(document)}
                            disabled={generatingTagsForDoc === document.id}
                            className="h-6 w-6 p-0"
                            title={document.tags && document.tags.length > 0 ? "Regenerate tags" : "Generate tags"}
                          >
                            <Sparkle 
                              size={14} 
                              weight="fill" 
                              className={generatingTagsForDoc === document.id ? "animate-spin text-accent" : "text-muted-foreground hover:text-accent"}
                            />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(document.uploadedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {document.fileSize}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash size={16} weight="bold" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Document?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete "{document.name}". This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteDocument(document.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={!!editingTagsDoc} onOpenChange={(open) => {
        if (!open) {
          setEditingTagsDoc(null)
          setEditedTags([])
          setNewTag('')
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Tags</DialogTitle>
            <DialogDescription>
              Add or remove tags for "{editingTagsDoc?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Tags</Label>
              <div className="flex flex-wrap gap-2 min-h-[40px] p-3 border border-border rounded-lg bg-muted/30">
                {editedTags.length > 0 ? (
                  editedTags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="text-sm px-3 py-1 flex items-center gap-1.5 hover:bg-destructive/10 transition-colors group"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-destructive transition-colors"
                        type="button"
                      >
                        <X size={14} weight="bold" />
                      </button>
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No tags yet</span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-tag">Add New Tag</Label>
              <div className="flex gap-2">
                <Input
                  id="new-tag"
                  placeholder="Enter tag name"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                />
                <Button 
                  onClick={handleAddTag} 
                  size="sm" 
                  className="gap-2 shrink-0"
                  disabled={!newTag.trim()}
                >
                  <Tag size={16} weight="bold" />
                  Add
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Press Enter or click Add to add a tag
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setEditingTagsDoc(null)
                setEditedTags([])
                setNewTag('')
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveTags} className="gap-2">
              <Tag size={16} weight="bold" />
              Save Tags
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
