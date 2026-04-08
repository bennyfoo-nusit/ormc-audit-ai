import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Plus, Trash, PencilSimple, Robot, Tag } from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export interface CustomAgent {
  id: string
  name: string
  systemPrompt: string
  createdAt: string
}

export interface DocumentTaggingPrompt {
  id: string
  name: string
  prompt: string
  createdAt: string
}

export function Administration() {
  const [agents, setAgents] = useKV<CustomAgent[]>('custom-agents', [])
  const [taggingPrompts, setTaggingPrompts] = useKV<DocumentTaggingPrompt[]>('document-tagging-prompts', [])
  const [isAgentDialogOpen, setIsAgentDialogOpen] = useState(false)
  const [isTaggingDialogOpen, setIsTaggingDialogOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<CustomAgent | null>(null)
  const [editingTaggingPrompt, setEditingTaggingPrompt] = useState<DocumentTaggingPrompt | null>(null)
  const [agentName, setAgentName] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [taggingName, setTaggingName] = useState('')
  const [taggingPromptText, setTaggingPromptText] = useState('')

  const handleCreateAgent = () => {
    setEditingAgent(null)
    setAgentName('')
    setSystemPrompt('')
    setIsAgentDialogOpen(true)
  }

  const handleEditAgent = (agent: CustomAgent) => {
    setEditingAgent(agent)
    setAgentName(agent.name)
    setSystemPrompt(agent.systemPrompt)
    setIsAgentDialogOpen(true)
  }

  const handleSaveAgent = () => {
    if (!agentName.trim()) {
      toast.error('Agent name is required')
      return
    }
    if (!systemPrompt.trim()) {
      toast.error('System prompt is required')
      return
    }

    if (editingAgent) {
      setAgents((currentAgents) =>
        (currentAgents || []).map((agent) =>
          agent.id === editingAgent.id
            ? { ...agent, name: agentName.trim(), systemPrompt: systemPrompt.trim() }
            : agent
        )
      )
      toast.success('Agent updated successfully')
    } else {
      const newAgent: CustomAgent = {
        id: `agent-${Date.now()}`,
        name: agentName.trim(),
        systemPrompt: systemPrompt.trim(),
        createdAt: new Date().toISOString(),
      }
      setAgents((currentAgents) => [...(currentAgents || []), newAgent])
      toast.success('Agent created successfully')
    }

    setIsAgentDialogOpen(false)
    setAgentName('')
    setSystemPrompt('')
    setEditingAgent(null)
  }

  const handleDeleteAgent = (agentId: string) => {
    setAgents((currentAgents) => (currentAgents || []).filter((agent) => agent.id !== agentId))
    toast.success('Agent deleted successfully')
  }

  const handleCreateTaggingPrompt = () => {
    setEditingTaggingPrompt(null)
    setTaggingName('')
    setTaggingPromptText('')
    setIsTaggingDialogOpen(true)
  }

  const handleEditTaggingPrompt = (prompt: DocumentTaggingPrompt) => {
    setEditingTaggingPrompt(prompt)
    setTaggingName(prompt.name)
    setTaggingPromptText(prompt.prompt)
    setIsTaggingDialogOpen(true)
  }

  const handleSaveTaggingPrompt = () => {
    if (!taggingName.trim()) {
      toast.error('Prompt name is required')
      return
    }
    if (!taggingPromptText.trim()) {
      toast.error('Prompt text is required')
      return
    }

    if (editingTaggingPrompt) {
      setTaggingPrompts((currentPrompts) =>
        (currentPrompts || []).map((prompt) =>
          prompt.id === editingTaggingPrompt.id
            ? { ...prompt, name: taggingName.trim(), prompt: taggingPromptText.trim() }
            : prompt
        )
      )
      toast.success('Tagging prompt updated successfully')
    } else {
      const newPrompt: DocumentTaggingPrompt = {
        id: `tagging-${Date.now()}`,
        name: taggingName.trim(),
        prompt: taggingPromptText.trim(),
        createdAt: new Date().toISOString(),
      }
      setTaggingPrompts((currentPrompts) => [...(currentPrompts || []), newPrompt])
      toast.success('Tagging prompt created successfully')
    }

    setIsTaggingDialogOpen(false)
    setTaggingName('')
    setTaggingPromptText('')
    setEditingTaggingPrompt(null)
  }

  const handleDeleteTaggingPrompt = (promptId: string) => {
    setTaggingPrompts((currentPrompts) => (currentPrompts || []).filter((prompt) => prompt.id !== promptId))
    toast.success('Tagging prompt deleted successfully')
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Administration</h1>
            <p className="text-muted-foreground">Manage custom AI agents and system settings</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Robot size={24} weight="fill" className="text-primary" />
                  Custom Agents
                </CardTitle>
                <CardDescription>
                  Create and manage AI agents with custom system prompts for specialized tasks
                </CardDescription>
              </div>
              <Button onClick={handleCreateAgent} className="gap-2">
                <Plus size={18} weight="bold" />
                Create Agent
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!agents || agents.length === 0 ? (
              <div className="text-center py-12">
                <Robot size={48} weight="thin" className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  No custom agents created yet
                </p>
                <Button onClick={handleCreateAgent} variant="outline" className="gap-2">
                  <Plus size={18} weight="bold" />
                  Create Your First Agent
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {(agents || []).map((agent) => (
                  <div
                    key={agent.id}
                    className="border border-border rounded-lg p-4 bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base mb-1">{agent.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          Created {new Date(agent.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditAgent(agent)}
                          className="gap-2"
                        >
                          <PencilSimple size={16} weight="bold" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteAgent(agent.id)}
                          className="gap-2 text-destructive hover:text-destructive"
                        >
                          <Trash size={16} weight="bold" />
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-muted/50 rounded border border-border">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        System Prompt:
                      </p>
                      <p className="text-sm text-foreground/90 whitespace-pre-wrap line-clamp-3">
                        {agent.systemPrompt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Tag size={24} weight="fill" className="text-primary" />
                  Document Tagging Prompts
                </CardTitle>
                <CardDescription>
                  Define custom AI prompts for automatic document tagging and classification
                </CardDescription>
              </div>
              <Button onClick={handleCreateTaggingPrompt} className="gap-2">
                <Plus size={18} weight="bold" />
                Create Prompt
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!taggingPrompts || taggingPrompts.length === 0 ? (
              <div className="text-center py-12">
                <Tag size={48} weight="thin" className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  No tagging prompts created yet
                </p>
                <Button onClick={handleCreateTaggingPrompt} variant="outline" className="gap-2">
                  <Plus size={18} weight="bold" />
                  Create Your First Tagging Prompt
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {(taggingPrompts || []).map((prompt) => (
                  <div
                    key={prompt.id}
                    className="border border-border rounded-lg p-4 bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base mb-1">{prompt.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          Created {new Date(prompt.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditTaggingPrompt(prompt)}
                          className="gap-2"
                        >
                          <PencilSimple size={16} weight="bold" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteTaggingPrompt(prompt.id)}
                          className="gap-2 text-destructive hover:text-destructive"
                        >
                          <Trash size={16} weight="bold" />
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-muted/50 rounded border border-border">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        Tagging Prompt:
                      </p>
                      <p className="text-sm text-foreground/90 whitespace-pre-wrap line-clamp-3">
                        {prompt.prompt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isAgentDialogOpen} onOpenChange={setIsAgentDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAgent ? 'Edit Agent' : 'Create New Agent'}
              </DialogTitle>
              <DialogDescription>
                Configure your custom AI agent with a name and system prompt
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="agent-name">Agent Name</Label>
                <Input
                  id="agent-name"
                  placeholder="e.g., Compliance Reviewer, Technical Auditor"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="system-prompt">System Prompt</Label>
                <Textarea
                  id="system-prompt"
                  placeholder="Define the agent's role, expertise, and how it should respond..."
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={12}
                  className="resize-none font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  The system prompt defines how the AI agent will behave and respond to queries.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAgentDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveAgent}>
                {editingAgent ? 'Update Agent' : 'Create Agent'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isTaggingDialogOpen} onOpenChange={setIsTaggingDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTaggingPrompt ? 'Edit Tagging Prompt' : 'Create New Tagging Prompt'}
              </DialogTitle>
              <DialogDescription>
                Define a custom prompt for AI-powered document tagging
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tagging-name">Prompt Name</Label>
                <Input
                  id="tagging-name"
                  placeholder="e.g., Risk Assessment Tags, Compliance Categories"
                  value={taggingName}
                  onChange={(e) => setTaggingName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagging-prompt">Tagging Prompt</Label>
                <Textarea
                  id="tagging-prompt"
                  placeholder="Describe what tags should be generated and how documents should be categorized..."
                  value={taggingPromptText}
                  onChange={(e) => setTaggingPromptText(e.target.value)}
                  rows={12}
                  className="resize-none font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  This prompt will be used by AI to automatically generate relevant tags for uploaded documents.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTaggingDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTaggingPrompt}>
                {editingTaggingPrompt ? 'Update Prompt' : 'Create Prompt'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
