import { useState, useRef, useEffect } from 'react'
import { PaperPlaneTilt, X, Copy, Check, At, Globe } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useKV } from '@/hooks/use-kv'
import { CustomAgent } from '@/components/Administration'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface Message {
  id: string
  sender: 'user' | 'ai'
  text: string
  timestamp: Date
  usedWebSearch?: boolean
  searchResults?: WebSearchResult[]
}

interface WebSearchResult {
  title: string
  snippet: string
  url: string
}

interface AttachedDocument {
  id: string
  name: string
  pageRange: string
}

interface AIChatPanelProps {
  attachedDocuments: AttachedDocument[]
  onRemoveDocument?: (id: string) => void
}

export function AIChatPanel({ attachedDocuments, onRemoveDocument }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! I\'m ready to help you audit the attached documents. Ask me questions about the content, and I\'ll provide detailed answers with references.',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [customAgents] = useKV<CustomAgent[]>('custom-agents', [])
  const [showAgentDropdown, setShowAgentDropdown] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<CustomAgent | null>(null)
  const [cursorPosition, setCursorPosition] = useState(0)
  const [webSearchEnabled, setWebSearchEnabled] = useKV<boolean>('web-search-enabled', false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const cursorPos = e.target.selectionStart
    
    setInput(value)
    setCursorPosition(cursorPos)
    
    const lastChar = value.charAt(cursorPos - 1)
    if (lastChar === '@') {
      setShowAgentDropdown(true)
    } else if (lastChar === ' ' || cursorPos === 0) {
      setShowAgentDropdown(false)
    }
  }

  const handleAgentSelect = (agent: CustomAgent) => {
    setSelectedAgent(agent)
    const beforeCursor = input.substring(0, cursorPosition - 1)
    const afterCursor = input.substring(cursorPosition)
    const newInput = beforeCursor + '@' + agent.name + ' ' + afterCursor
    setInput(newInput)
    setShowAgentDropdown(false)
    
    if (textareaRef.current) {
      textareaRef.current.focus()
      const newCursorPos = beforeCursor.length + agent.name.length + 2
      setTimeout(() => {
        textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos)
      }, 0)
    }
  }

  const performWebSearch = async (query: string): Promise<WebSearchResult[]> => {
    const promptFn = window.spark.llmPrompt as any
    const searchPrompt = promptFn`You are a web search engine. Generate 3 realistic search results for the query: "${query}". 
    
Return the result as a valid JSON object with a single property called "results" that contains an array of search results. Each result should have:
- title: A relevant page title
- snippet: A 2-3 sentence summary
- url: A realistic URL (can be simulated)

Return ONLY valid JSON in this exact format:
{
  "results": [
    {"title": "Example Title", "snippet": "Example snippet...", "url": "https://example.com"},
    ...
  ]
}`
    
    try {
      const response = await window.spark.llm(searchPrompt, 'gpt-4o-mini', true)
      const parsed = JSON.parse(response)
      return parsed.results || []
    } catch (error) {
      console.error('Web search failed:', error)
      return []
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date()
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setIsLoading(true)
    setShowAgentDropdown(false)

    try {
      const docsContext = attachedDocuments.map(d => `${d.name} (${d.pageRange})`).join(', ')
      const promptFn = window.spark.llmPrompt as any
      
      let searchResults: WebSearchResult[] = []
      let searchContext = ''
      
      if (webSearchEnabled) {
        searchResults = await performWebSearch(currentInput)
        if (searchResults.length > 0) {
          searchContext = `\n\nWeb Search Results:\n${searchResults.map((r, i) => 
            `${i + 1}. ${r.title}\n   ${r.snippet}\n   Source: ${r.url}`
          ).join('\n\n')}`
        }
      }
      
      let systemPrompt = `You are an AI audit assistant helping review documents. 
      
The user has attached the following documents: ${docsContext}

User question: ${currentInput}${searchContext}

Provide a helpful, detailed response as if you have access to these documents. Include specific references to document sections or pages when relevant. Be professional and audit-focused.${searchContext ? ' If web search results are provided, incorporate relevant information from them and cite the sources.' : ''}`

      if (selectedAgent) {
        systemPrompt = `${selectedAgent.systemPrompt}

The user has attached the following documents: ${docsContext}

User question: ${currentInput}${searchContext}

Provide a helpful, detailed response based on your role and the attached documents.${searchContext ? ' If web search results are provided, incorporate relevant information from them and cite the sources.' : ''}`
      }

      const prompt = promptFn`${systemPrompt}`
      const response = await window.spark.llm(prompt, 'gpt-4o-mini')

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response,
        timestamp: new Date(),
        usedWebSearch: webSearchEnabled && searchResults.length > 0,
        searchResults: searchResults.length > 0 ? searchResults : undefined
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setSelectedAgent(null)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    
    if (e.key === 'Escape') {
      setShowAgentDropdown(false)
    }
  }

  const handleCopyMessage = async (messageId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(messageId)
      toast.success('Response copied to clipboard')
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  return (
    <div className="h-full flex flex-col bg-card shadow-lg">
      <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-sm shadow-accent/50" />
          <h3 className="font-semibold text-base">AI Audit Assistant</h3>
          <Badge variant="secondary" className="ml-auto font-mono text-xs bg-accent/10 text-accent-foreground">
            {attachedDocuments.length} attached
          </Badge>
        </div>

        <div className="mb-3 flex items-center justify-between gap-3 p-2 bg-muted/30 rounded-md border border-border/50">
          <div className="flex items-center gap-2">
            <Globe size={16} weight={webSearchEnabled ? 'fill' : 'regular'} className={cn(
              "transition-colors",
              webSearchEnabled ? "text-accent" : "text-muted-foreground"
            )} />
            <Label htmlFor="web-search-toggle" className="text-sm font-medium cursor-pointer">
              Web Search
            </Label>
          </div>
          <Switch
            id="web-search-toggle"
            checked={webSearchEnabled ?? false}
            onCheckedChange={setWebSearchEnabled}
            className="data-[state=checked]:bg-accent"
          />
        </div>

        {attachedDocuments.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1.5 font-semibold uppercase tracking-wide">
              Attached Documents
            </p>
            <div className="flex flex-wrap gap-1.5">
              {attachedDocuments.map((doc) => (
                <Badge 
                  key={doc.id} 
                  variant="secondary" 
                  className="px-2 py-1 bg-muted/50 hover:bg-muted/70 transition-colors group flex items-center gap-1.5 max-w-full"
                >
                  <span className="truncate text-xs font-medium text-foreground">{doc.name}</span>
                  <span className="text-xs text-muted-foreground font-mono shrink-0">({doc.pageRange})</span>
                  <button
                    className="ml-0.5 shrink-0 text-foreground hover:text-destructive transition-colors"
                    onClick={() => onRemoveDocument?.(doc.id)}
                  >
                    <X size={12} weight="bold" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className={cn(
                  'flex',
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-lg px-4 py-2 shadow-sm relative group',
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground border border-border'
                  )}
                >
                  {message.sender === 'ai' && (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-xs font-semibold text-accent uppercase tracking-wide">AI</div>
                        {message.usedWebSearch && (
                          <Badge variant="secondary" className="gap-1 text-xs px-1.5 py-0 bg-accent/10 text-accent-foreground">
                            <Globe size={10} weight="fill" />
                            Web Search
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent/10"
                        onClick={() => handleCopyMessage(message.id, message.text)}
                      >
                        {copiedId === message.id ? (
                          <Check size={14} weight="bold" className="text-accent" />
                        ) : (
                          <Copy size={14} className="text-muted-foreground" />
                        )}
                      </Button>
                    </>
                  )}
                  {message.sender === 'user' && (
                    <div className="text-xs font-semibold opacity-80 mb-1 uppercase tracking-wide">You</div>
                  )}
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                  {message.searchResults && message.searchResults.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sources</p>
                      {message.searchResults.map((result, idx) => (
                        <div key={idx} className="p-2 bg-background/50 rounded border border-border/30 hover:border-accent/30 transition-colors">
                          <a 
                            href={result.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-accent hover:underline line-clamp-1"
                          >
                            {result.title}
                          </a>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{result.snippet}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <p
                    className={cn(
                      'text-xs mt-1',
                      message.sender === 'user' ? 'opacity-70' : 'text-muted-foreground'
                    )}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-muted rounded-lg px-4 py-2 border border-border">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border bg-muted/30">
        <div className="relative">
          {selectedAgent && (
            <div className="mb-2">
              <Badge 
                variant="secondary" 
                className="gap-1 bg-accent/20 text-accent-foreground"
              >
                <At size={12} weight="bold" />
                {selectedAgent.name}
                <button
                  className="ml-1 hover:text-destructive transition-colors"
                  onClick={() => setSelectedAgent(null)}
                >
                  <X size={10} weight="bold" />
                </button>
              </Badge>
            </div>
          )}
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                placeholder="Ask a question about the documents... (Type @ to mention an agent)"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                disabled={isLoading}
                rows={3}
                className="resize-none focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="shrink-0 rounded-full w-10 h-10 transition-all hover:shadow-md hover:scale-105 active:scale-95"
            >
              <PaperPlaneTilt size={18} weight="fill" />
            </Button>
          </div>
          
          {showAgentDropdown && customAgents && customAgents.length > 0 && (
            <Card className="absolute bottom-full mb-2 w-full max-h-64 overflow-auto shadow-lg border-2 border-accent/20 z-50">
              <Command>
                <CommandList>
                  <CommandGroup heading="Custom Agents">
                    {customAgents.map((agent) => (
                      <CommandItem
                        key={agent.id}
                        onSelect={() => handleAgentSelect(agent)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <At size={16} weight="bold" className="text-accent" />
                          <div>
                            <div className="font-semibold">{agent.name}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {agent.systemPrompt.substring(0, 60)}...
                            </div>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  {(!customAgents || customAgents.length === 0) && (
                    <CommandEmpty>No custom agents available. Create one in Administration.</CommandEmpty>
                  )}
                </CommandList>
              </Command>
            </Card>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded font-mono">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded font-mono">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  )
}
