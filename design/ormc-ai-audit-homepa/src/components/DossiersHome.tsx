import { useKV } from '@/hooks/use-kv'
import { Plus, Folder, FolderOpen, ShareNetwork, User, MagnifyingGlass, SquaresFour, List } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { ShareProjectDialog } from './ShareProjectDialog'

export interface ProjectShare {
  userId: string
  username: string
  permission: 'view' | 'edit'
  sharedAt: string
}

export interface Project {
  id: string
  title: string
  description: string
  createdAt: string
  updatedAt: string
  ownerId?: string
  shares?: ProjectShare[]
}

interface DossiersHomeProps {
  onProjectClick: (project: Project) => void
  onDocumentManagementClick: (project: Project) => void
}

export function DossiersHome({ onProjectClick, onDocumentManagementClick }: DossiersHomeProps) {
  const [projects, setProjects] = useKV<Project[]>('projects-list', [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newProjectTitle, setNewProjectTitle] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [hoveredProject, setHoveredProject] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>('180628674')
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const initializeData = async () => {
      try {
        const user = await window.spark.user()
        if (user) {
          setCurrentUserId(String(user.id))
          
          const currentProjects = projects || []
          const hasSharedProject = currentProjects.some(p => p.id === '1774600500000')
          
          if (currentProjects.length === 0 || !hasSharedProject) {
            const initialProjects: Project[] = [
              {
                id: '1774600227626',
                title: 'My First Project',
                description: 'Initial audit project for document review',
                createdAt: new Date('2024-01-15').toISOString(),
                updatedAt: new Date('2024-01-15').toISOString(),
                ownerId: String(user.id),
                shares: []
              },
              {
                id: '1774600391154',
                title: '2nd Project',
                description: 'Secondary project for testing',
                createdAt: new Date('2024-01-20').toISOString(),
                updatedAt: new Date('2024-01-20').toISOString(),
                ownerId: String(user.id),
                shares: []
              },
              {
                id: '1774600500000',
                title: 'Shared Compliance Review',
                description: 'Q4 compliance audit shared by team lead',
                createdAt: new Date('2024-01-10').toISOString(),
                updatedAt: new Date('2024-01-25').toISOString(),
                ownerId: 'shared-user-123',
                shares: [
                  {
                    userId: String(user.id),
                    username: user.login || 'Current User',
                    permission: 'edit',
                    sharedAt: new Date('2024-01-12').toISOString()
                  }
                ]
              }
            ]
            
            const mergedProjects = [...currentProjects]
            initialProjects.forEach(initProj => {
              if (!mergedProjects.some(p => p.id === initProj.id)) {
                mergedProjects.push(initProj)
              }
            })
            
            setProjects(mergedProjects)
            
            const doc1Exists = await window.spark.kv.get('documents-1774600227626')
            if (!doc1Exists) {
              await window.spark.kv.set('documents-1774600227626', [
                {
                  id: '1',
                  name: 'File Name',
                  fileName: 'sample-audit-document.pdf',
                  description: 'Primary audit document for review',
                  uploadedAt: new Date('2024-01-15').toISOString(),
                  fileSize: '2.4 MB',
                  tags: ['Audit', 'Financial', 'Q1 2024']
                }
              ])
            }
            
            const doc2Exists = await window.spark.kv.get('documents-1774600391154')
            if (!doc2Exists) {
              await window.spark.kv.set('documents-1774600391154', [
                {
                  id: '2',
                  name: 'Test Document',
                  fileName: 'test-document.pdf',
                  description: 'Test document for validation',
                  uploadedAt: new Date('2024-01-20').toISOString(),
                  fileSize: '1.8 MB',
                  tags: ['Test', 'Validation', 'Sample']
                },
                {
                  id: '3',
                  name: 'Secondary Report',
                  fileName: 'secondary-report.pdf',
                  description: 'Additional test document',
                  uploadedAt: new Date('2024-01-21').toISOString(),
                  fileSize: '3.1 MB',
                  tags: ['Report', 'Analysis', 'Documentation']
                }
              ])
            }

            const doc3Exists = await window.spark.kv.get('documents-1774600500000')
            if (!doc3Exists) {
              await window.spark.kv.set('documents-1774600500000', [
                {
                  id: '4',
                  name: 'Compliance Report Q4',
                  fileName: 'compliance-q4-2023.pdf',
                  description: 'Q4 compliance audit report',
                  uploadedAt: new Date('2024-01-10').toISOString(),
                  fileSize: '4.2 MB',
                  tags: ['Compliance', 'Q4', 'Regulatory', 'Audit']
                },
                {
                  id: '5',
                  name: 'Policy Guidelines',
                  fileName: 'policy-guidelines-2024.pdf',
                  description: 'Updated policy guidelines for 2024',
                  uploadedAt: new Date('2024-01-12').toISOString(),
                  fileSize: '2.9 MB',
                  tags: ['Policy', 'Guidelines', 'Compliance']
                }
              ])
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      }
    }
    initializeData()
  }, [])

  const handleCreateProject = async () => {
    if (!newProjectTitle.trim()) {
      toast.error('Project title is required')
      return
    }

    let ownerId = currentUserId
    if (!ownerId) {
      try {
        const user = await window.spark.user()
        if (user) {
          ownerId = String(user.id)
          setCurrentUserId(String(user.id))
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      }
    }

    const newProject: Project = {
      id: Date.now().toString(),
      title: newProjectTitle.trim(),
      description: newProjectDescription.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerId: ownerId || undefined,
      shares: []
    }

    setProjects((current) => [...(current || []), newProject])
    setNewProjectTitle('')
    setNewProjectDescription('')
    setIsDialogOpen(false)
    toast.success('Project created successfully')
  }

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects((current) =>
      (current || []).map(p => p.id === updatedProject.id ? updatedProject : p)
    )
  }

  const filterBySearch = (list: Project[]) => {
    if (!searchQuery.trim()) return list
    const q = searchQuery.toLowerCase()
    return list.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    )
  }

  const myProjects = filterBySearch((projects || []).filter(p => p.ownerId === currentUserId))
  const sharedProjects = filterBySearch((projects || []).filter(p => {
    if (p.ownerId === currentUserId) return false
    return p.shares?.some(share => share.userId === currentUserId)
  }))

  const renderProjectListRow = (project: Project, isShared: boolean = false) => (
    <TableRow
      key={project.id}
      className="cursor-pointer hover:bg-accent/5 transition-colors"
      onClick={() => onProjectClick(project)}
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <Folder size={20} weight="fill" className="text-primary flex-shrink-0" />
          <span className="font-semibold">{project.title}</span>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm max-w-[300px] truncate">
        {project.description || '—'}
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {new Date(project.createdAt).toLocaleDateString()}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {isShared && (
            <Badge variant="outline" className="text-xs gap-1">
              <User size={12} weight="fill" />
              Shared
            </Badge>
          )}
          {!isShared && project.shares && project.shares.length > 0 && (
            <Badge variant="outline" className="text-xs gap-1">
              <ShareNetwork size={12} weight="fill" />
              {project.shares.length}
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-1">
          {!isShared && (
            <ShareProjectDialog
              project={project}
              onUpdateProject={handleUpdateProject}
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ShareNetwork size={16} weight="bold" className="text-accent" />
                </Button>
              }
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation()
              onDocumentManagementClick(project)
            }}
            title="Manage Documents"
          >
            <FolderOpen size={16} weight="bold" className="text-muted-foreground" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )

  const renderProjectCard = (project: Project, isShared: boolean = false) => (
    <Card
      key={project.id}
      className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-accent/50"
      onMouseEnter={() => setHoveredProject(project.id)}
      onMouseLeave={() => setHoveredProject(null)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0" onClick={() => onProjectClick(project)}>
            <div className="flex items-center gap-2 mb-2">
              {hoveredProject === project.id ? (
                <FolderOpen size={24} weight="fill" className="text-accent flex-shrink-0" />
              ) : (
                <Folder size={24} weight="fill" className="text-primary flex-shrink-0" />
              )}
              <CardTitle className="text-lg leading-tight truncate">
                {project.title}
              </CardTitle>
            </div>
            {project.description && (
              <CardDescription className="line-clamp-2 text-sm">
                {project.description}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {!isShared && (
              <ShareProjectDialog
                project={project}
                onUpdateProject={handleUpdateProject}
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ShareNetwork size={20} weight="bold" className="text-accent" />
                    {project.shares && project.shares.length > 0 && (
                      <Badge
                        variant="secondary"
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-accent text-accent-foreground"
                      >
                        {project.shares.length}
                      </Badge>
                    )}
                  </Button>
                }
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                onDocumentManagementClick(project)
              }}
              title="Manage Documents"
            >
              <FolderOpen size={20} weight="bold" className="text-muted-foreground" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
          <div className="flex items-center gap-2">
            {isShared && (
              <Badge variant="outline" className="text-xs gap-1">
                <User size={12} weight="fill" />
                Shared
              </Badge>
            )}
            {!isShared && project.shares && project.shares.length > 0 && (
              <Badge variant="outline" className="text-xs gap-1">
                <ShareNetwork size={12} weight="fill" />
                {project.shares.length} {project.shares.length === 1 ? 'share' : 'shares'}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </Card>
  )

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-foreground">Dossiers</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 shadow-md hover:shadow-lg transition-all">
                  <Plus size={20} weight="bold" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Add a new project to your dossiers. You can start auditing documents once created.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="project-title">Project Title</Label>
                    <Input
                      id="project-title"
                      placeholder="Enter project title"
                      value={newProjectTitle}
                      onChange={(e) => setNewProjectTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newProjectTitle.trim()) {
                          handleCreateProject()
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-description">Description (Optional)</Label>
                    <Input
                      id="project-description"
                      placeholder="Enter project description"
                      value={newProjectDescription}
                      onChange={(e) => setNewProjectDescription(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateProject}>Create Project</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-muted-foreground">
            Manage your document audit projects and track progress
          </p>
        </div>

        {/* Search & View Toggle */}
        {projects && projects.length > 0 && (
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
              <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'card' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-none h-9 px-3"
                onClick={() => setViewMode('card')}
                title="Card view"
              >
                <SquaresFour size={18} weight={viewMode === 'card' ? 'fill' : 'regular'} />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-none h-9 px-3"
                onClick={() => setViewMode('list')}
                title="List view"
              >
                <List size={18} weight={viewMode === 'list' ? 'fill' : 'regular'} />
              </Button>
            </div>
          </div>
        )}

        {(!projects || projects.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
              <Folder size={48} className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Get started by creating your first project. You'll be able to upload documents and start the audit process.
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus size={20} weight="bold" />
              Create Your First Project
            </Button>
          </div>
        ) : (
          <div className="space-y-10">
            {myProjects.length === 0 && sharedProjects.length === 0 && searchQuery.trim() && (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <MagnifyingGlass size={48} className="text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-1">No results found</h3>
                <p className="text-muted-foreground text-sm">No projects match "{searchQuery}"</p>
              </div>
            )}

            {myProjects.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Folder size={24} weight="fill" className="text-primary" />
                  My Projects
                </h2>
                {viewMode === 'card' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myProjects.map((project) => renderProjectCard(project, false))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="min-w-[200px]">Project</TableHead>
                            <TableHead className="min-w-[200px]">Description</TableHead>
                            <TableHead className="w-[120px]">Created</TableHead>
                            <TableHead className="w-[100px]">Status</TableHead>
                            <TableHead className="w-[100px] text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {myProjects.map((project) => renderProjectListRow(project, false))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {sharedProjects.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <ShareNetwork size={24} weight="fill" className="text-accent" />
                  Shared with Me
                </h2>
                {viewMode === 'card' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sharedProjects.map((project) => renderProjectCard(project, true))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="min-w-[200px]">Project</TableHead>
                            <TableHead className="min-w-[200px]">Description</TableHead>
                            <TableHead className="w-[120px]">Created</TableHead>
                            <TableHead className="w-[100px]">Status</TableHead>
                            <TableHead className="w-[100px] text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sharedProjects.map((project) => renderProjectListRow(project, true))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
