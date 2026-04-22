import { useState } from 'react'
import { useKV } from '@/hooks/use-kv'
import { ArrowsClockwise, House, GearSix } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { DossiersHome, Project } from '@/components/DossiersHome'
import { WorkingPage } from '@/components/WorkingPage'
import { DocumentManagement } from '@/components/DocumentManagement'
import { Administration } from '@/components/Administration'
import { Annotation } from '@/components/CommentsPanel'
import { Toaster } from '@/components/ui/sonner'
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
import { toast } from 'sonner'
import NUSLogo from '@/assets/images/NUS_Logo.jpg'

type NavigationView = 'dossiers' | 'working' | 'documents' | 'administration'

function App() {
  const [currentView, setCurrentView] = useState<NavigationView>('dossiers')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [annotations, setAnnotations] = useKV<Annotation[]>('document-annotations', [])

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project)
    setCurrentView('working')
  }

  const handleDocumentManagementClick = (project: Project) => {
    setSelectedProject(project)
    setCurrentView('documents')
  }

  const handleNavigateToWorkingFromDocuments = () => {
    if (selectedProject) {
      setCurrentView('working')
    }
  }

  const handleNavigateToDocumentsFromWorking = () => {
    if (selectedProject) {
      setCurrentView('documents')
    }
  }

  const handleResetSession = () => {
    setAnnotations([])
    toast.success('Session reset successfully')
  }

  const handleNavigateToDossiers = () => {
    setCurrentView('dossiers')
    setSelectedProject(null)
  }

  const getPageTitle = () => {
    if (currentView === 'administration') return 'Administration'
    if (currentView === 'dossiers') return 'Dossiers'
    if (currentView === 'documents') return selectedProject?.title || 'Documents'
    if (currentView === 'working') return selectedProject?.title || 'Working'
    return 'ORMC AI Document Audit'
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <Toaster position="top-right" />
      <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <img src={NUSLogo} alt="NUS Logo" className="h-10 w-auto object-contain" />
          <nav className="flex items-center gap-1">
            <Button
              variant={currentView === 'dossiers' ? 'default' : 'ghost'}
              size="sm"
              onClick={handleNavigateToDossiers}
              className="gap-2"
            >
              <House size={18} weight={currentView === 'dossiers' ? 'fill' : 'regular'} />
              Dossiers
            </Button>
            {selectedProject && currentView === 'working' && (
              <div className="flex items-center gap-2 ml-2">
                <div className="h-5 w-px bg-border" />
                <span className="text-sm font-semibold text-primary px-2">
                  {selectedProject.title}
                </span>
              </div>
            )}
            <Button
              variant={currentView === 'administration' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('administration')}
              className="gap-2"
            >
              <GearSix size={18} weight={currentView === 'administration' ? 'fill' : 'regular'} />
              Administration
            </Button>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {currentView === 'working' && selectedProject && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 transition-all hover:shadow-md hover:border-accent/30">
                  <ArrowsClockwise size={16} weight="bold" />
                  Reset Session
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset Session?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will clear all annotations and chat history. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetSession}>Reset</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </header>

      {currentView === 'dossiers' && (
        <DossiersHome
          onProjectClick={handleProjectClick}
          onDocumentManagementClick={handleDocumentManagementClick}
        />
      )}

      {currentView === 'working' && selectedProject && (
        <WorkingPage 
          projectId={selectedProject.id}
          onNavigateToDocuments={handleNavigateToDocumentsFromWorking}
        />
      )}

      {currentView === 'documents' && selectedProject && (
        <DocumentManagement
          projectId={selectedProject.id}
          projectTitle={selectedProject.title}
          onNavigateBack={handleNavigateToDossiers}
          onNavigateToWorking={handleNavigateToWorkingFromDocuments}
        />
      )}

      {currentView === 'administration' && <Administration />}
    </div>
  )
}

export default App
