import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Tree, Note, ChatsCircle, List } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface SidePanelProps {
  showDocTree: boolean
  showActionPanel: boolean
  showAIChat: boolean
  onToggleDocTree: () => void
  onToggleActionPanel: () => void
  onToggleAIChat: () => void
}

export function SidePanel({
  showDocTree,
  showActionPanel,
  showAIChat,
  onToggleDocTree,
  onToggleActionPanel,
  onToggleAIChat
}: SidePanelProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-full w-14 bg-primary border-r border-border flex flex-col items-center py-4 gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleDocTree}
              className={cn(
                "w-10 h-10 rounded-lg transition-all",
                showDocTree
                  ? "bg-accent text-accent-foreground hover:bg-accent/90 shadow-md"
                  : "text-primary-foreground hover:bg-primary-foreground/10"
              )}
            >
              <Tree size={20} weight={showDocTree ? "fill" : "regular"} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{showDocTree ? 'Hide' : 'Show'} Document Tree</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleActionPanel}
              className={cn(
                "w-10 h-10 rounded-lg transition-all",
                showActionPanel
                  ? "bg-accent text-accent-foreground hover:bg-accent/90 shadow-md"
                  : "text-primary-foreground hover:bg-primary-foreground/10"
              )}
            >
              <Note size={20} weight={showActionPanel ? "fill" : "regular"} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{showActionPanel ? 'Hide' : 'Show'} Actions Panel</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleAIChat}
              className={cn(
                "w-10 h-10 rounded-lg transition-all",
                showAIChat
                  ? "bg-accent text-accent-foreground hover:bg-accent/90 shadow-md"
                  : "text-primary-foreground hover:bg-primary-foreground/10"
              )}
            >
              <ChatsCircle size={20} weight={showAIChat ? "fill" : "regular"} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{showAIChat ? 'Hide' : 'Show'} AI Chat</p>
          </TooltipContent>
        </Tooltip>

        <div className="flex-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-lg text-primary-foreground hover:bg-primary-foreground/10 transition-all"
            >
              <List size={20} weight="regular" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>View Options</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
