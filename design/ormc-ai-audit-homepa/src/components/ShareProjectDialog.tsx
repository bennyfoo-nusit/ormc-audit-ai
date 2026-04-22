import { useState } from 'react'
import { useKV } from '@/hooks/use-kv'
import { ShareNetwork, Trash, UserPlus } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Project, ProjectShare } from './DossiersHome'

interface ShareProjectDialogProps {
  project: Project
  onUpdateProject: (updatedProject: Project) => void
  trigger?: React.ReactNode
}

export function ShareProjectDialog({ project, onUpdateProject, trigger }: ShareProjectDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [permission, setPermission] = useState<'view' | 'edit'>('view')

  const handleAddShare = () => {
    if (!username.trim()) {
      toast.error('Please enter a username')
      return
    }

    const existingShare = project.shares?.find(s => s.username.toLowerCase() === username.toLowerCase())
    if (existingShare) {
      toast.error('User already has access to this project')
      return
    }

    const newShare: ProjectShare = {
      userId: `user-${Date.now()}`,
      username: username.trim(),
      permission,
      sharedAt: new Date().toISOString()
    }

    const updatedProject = {
      ...project,
      shares: [...(project.shares || []), newShare],
      updatedAt: new Date().toISOString()
    }

    onUpdateProject(updatedProject)
    setUsername('')
    setPermission('view')
    toast.success(`Shared with ${username} (${permission} access)`)
  }

  const handleRemoveShare = (userId: string) => {
    const shareToRemove = project.shares?.find(s => s.userId === userId)
    if (!shareToRemove) return

    const updatedProject = {
      ...project,
      shares: project.shares?.filter(s => s.userId !== userId) || [],
      updatedAt: new Date().toISOString()
    }

    onUpdateProject(updatedProject)
    toast.success(`Removed access for ${shareToRemove.username}`)
  }

  const handleUpdatePermission = (userId: string, newPermission: 'view' | 'edit') => {
    const updatedProject = {
      ...project,
      shares: project.shares?.map(s => 
        s.userId === userId ? { ...s, permission: newPermission } : s
      ) || [],
      updatedAt: new Date().toISOString()
    }

    onUpdateProject(updatedProject)
    toast.success('Permission updated')
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="flex-shrink-0">
            <ShareNetwork size={20} weight="bold" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShareNetwork size={24} weight="fill" className="text-accent" />
            Share "{project.title}"
          </DialogTitle>
          <DialogDescription>
            Grant other users access to view or edit this project
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>Add User</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  id="share-username"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && username.trim()) {
                      handleAddShare()
                    }
                  }}
                />
              </div>
              <Select value={permission} onValueChange={(val: 'view' | 'edit') => setPermission(val)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View</SelectItem>
                  <SelectItem value="edit">Edit</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddShare} size="icon" className="flex-shrink-0">
                <UserPlus size={20} weight="bold" />
              </Button>
            </div>
          </div>

          {project.shares && project.shares.length > 0 && (
            <div className="space-y-2">
              <Label>Shared With ({project.shares.length})</Label>
              <div className="space-y-2 max-h-64 overflow-y-auto border border-border rounded-lg p-3 bg-muted/30">
                {project.shares.map((share) => (
                  <div
                    key={share.userId}
                    className="flex items-center justify-between gap-3 p-2 bg-card rounded border border-border hover:border-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{share.username}</div>
                      <div className="text-xs text-muted-foreground">
                        Shared {new Date(share.sharedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={share.permission}
                        onValueChange={(val: 'view' | 'edit') => handleUpdatePermission(share.userId, val)}
                      >
                        <SelectTrigger className="w-24 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="view">View</SelectItem>
                          <SelectItem value="edit">Edit</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveShare(share.userId)}
                      >
                        <Trash size={16} weight="bold" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!project.shares || project.shares.length === 0) && (
            <div className="text-center py-8 px-4 border border-dashed border-border rounded-lg bg-muted/20">
              <ShareNetwork size={40} className="mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">
                This project hasn't been shared with anyone yet
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
