# Planning Guide

A comprehensive AI-powered document audit and annotation platform that enables users to manage multiple audit projects (Dossiers), review documents with AI assistance, manage annotations, and navigate complex document structures efficiently.

**Experience Qualities**: 
1. **Professional** - Enterprise-grade interface that inspires confidence and trust in critical document review workflows
2. **Efficient** - Streamlined interactions that minimize friction between project management, document navigation, annotation, and AI consultation
3. **Intelligent** - Contextually aware AI assistance that enhances rather than interrupts the audit process

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This is a sophisticated document management system with project organization, multiple interconnected panels, AI integration, persistent state management, document management, and complex document navigation patterns.

## Essential Features

### 1. Dossiers Home (Project Management)
- **Functionality**: Landing page displaying all audit projects with ability to create, view, and manage projects
- **Purpose**: Organize multiple audit projects in a centralized location
- **Trigger**: Application loads to Dossiers home by default
- **Progression**: Load projects from storage → Display as card grid → User clicks project title → Navigate to working page OR User clicks document icon → Navigate to document management
- **Success criteria**: Projects persist across sessions, cards show project metadata, smooth navigation between views

### 2. Document Management Page
- **Functionality**: Upload and manage documents for each project
- **Purpose**: Central repository for project documents before audit
- **Trigger**: User clicks document icon on project card in Dossiers home
- **Progression**: Navigate to project → Display uploaded documents → User adds new document → Upload file → Document appears in list → Return to Dossiers
- **Success criteria**: Documents persist per project, file upload works reliably, can view/delete documents

### 3. Document Tree Navigation
- **Functionality**: Hierarchical tree view displaying document structure with sections, subsections, and individual items
- **Purpose**: Provides quick navigation and overview of entire document structure
- **Trigger**: User clicks on tree items to navigate
- **Progression**: Load document → Render tree structure → User expands/collapses nodes → Click item → Sync PDF view to selected section → Update active state
- **Success criteria**: Tree syncs with PDF view, visual indicators show current location, expand/collapse states persist

### 4. PDF Preview Panel
- **Functionality**: Displays PDF content with page navigation, zoom controls, and text selection capabilities
- **Purpose**: Central workspace for document review
- **Trigger**: Document loads automatically when entering working page
- **Progression**: Initialize PDF viewer → Load document → Display current page → User navigates/zooms → Selection triggers annotation panel
- **Success criteria**: Smooth page navigation, zoom maintains readability, text selection works reliably

### 5. Annotation & Tagging Panel
- **Functionality**: Add comments and tags to highlighted PDF text, view existing annotations
- **Purpose**: Capture audit findings and mark important sections
- **Trigger**: User highlights text in PDF or clicks existing annotation
- **Progression**: Select text → Panel activates → User adds comment/tags → Save → Annotation appears on PDF and tree → Close panel
- **Success criteria**: Annotations persist per project, visible in tree view, can be edited/deleted

### 6. AI Audit Chat
- **Functionality**: Context-aware AI assistant for document questions, integrated with attached documents
- **Purpose**: Provide intelligent assistance during audit process
- **Trigger**: User types question in chat input
- **Progression**: User enters question → AI analyzes attached documents → Generates response with citations → Display in chat → User can follow up
- **Success criteria**: AI responses reference specific document sections, maintains conversation context, attached documents clearly listed

### 7. Session Management
- **Functionality**: Reset current audit session for a project
- **Purpose**: Start fresh audit without previous annotations/context
- **Trigger**: User clicks "Reset Session" button in working page
- **Progression**: Click reset → Confirmation dialog → Clear annotations/chat for project → Reset to initial state
- **Success criteria**: Only current project's session data cleared, document reloads to first page

## Edge Case Handling
- **No Projects**: Empty state with call-to-action to create first project
- **No Documents**: Empty state in document management encouraging document upload
- **Large Documents**: Virtualized tree rendering and lazy PDF page loading for performance
- **Network Failures**: Graceful error messages with retry options for AI chat
- **Invalid Selections**: Disable annotation panel if no text selected
- **Empty States**: Helpful prompts when no documents attached or annotations exist
- **Concurrent Edits**: Timestamp-based conflict resolution if multiple annotations created
- **Project Deletion**: Confirmation dialog to prevent accidental project removal
- **Navigation**: Breadcrumb or back buttons to return from working/document pages to Dossiers

## Design Direction
The design should evoke precision, clarity, and professional competence. This is a tool for serious work that demands attention to detail, so the interface must feel authoritative yet approachable. Visual hierarchy should guide users naturally through the audit workflow while maintaining calm, focused environment conducive to detailed document review.

## Color Selection

- **Primary Color**: Deep Navy Blue `oklch(0.28 0.08 250)` - Conveys authority, trustworthiness, and professional rigor expected in audit contexts
- **Secondary Colors**: 
  - Slate Gray `oklch(0.45 0.01 250)` for supporting UI elements and muted backgrounds
  - Light Blue `oklch(0.88 0.04 250)` for hover states and subtle highlights
- **Accent Color**: Vibrant Orange `oklch(0.68 0.18 45)` - Draws attention to active annotations, important actions, and AI responses. Creates energetic contrast against cool primary palette
- **Foreground/Background Pairings**: 
  - Background (Soft White `oklch(0.98 0 0)`): Navy text `oklch(0.28 0.08 250)` - Ratio 8.9:1 ✓
  - Primary (Navy `oklch(0.28 0.08 250)`): White text `oklch(1 0 0)` - Ratio 8.9:1 ✓
  - Accent (Orange `oklch(0.68 0.18 45)`): Navy text `oklch(0.28 0.08 250)` - Ratio 4.6:1 ✓
  - Card (White `oklch(1 0 0)`): Foreground text `oklch(0.22 0.02 250)` - Ratio 13.1:1 ✓

## Font Selection
Typography should communicate precision and readability appropriate for extended document review sessions. A modern sans-serif with excellent legibility at various sizes paired with a monospace font for technical annotations.

- **Typographic Hierarchy**: 
  - H1 (Page Title): Inter Bold / 24px / -0.02em letter-spacing / 1.2 line-height
  - H2 (Section Headers): Inter Semibold / 16px / -0.01em letter-spacing / 1.3 line-height
  - Body (Content): Inter Regular / 14px / normal letter-spacing / 1.5 line-height
  - Small (Metadata): Inter Regular / 12px / normal letter-spacing / 1.4 line-height
  - Code/Tags: JetBrains Mono Medium / 13px / normal letter-spacing / 1.4 line-height

## Animations
Animations should reinforce the application's structure and maintain spatial awareness during complex interactions. Use subtle motion to guide attention during state changes - panel expansions ease with gentle spring physics, tree nodes rotate smoothly when expanding, and hover states respond with immediate but gentle color transitions. Chat messages should slide in naturally to feel conversational yet professional.

## Component Selection

- **Components**: 
  - Dossiers home: Card grid with Dialog for creating new projects
  - Document management: Card grid with upload Dialog, AlertDialog for deletions
  - Tree navigation: Custom recursive component using Collapsible for expand/collapse with Checkbox for item selection
  - PDF viewer: Custom component with Button controls for navigation/zoom
  - Annotation panel: Sheet component for slide-in panel with Textarea for comments and Badge for tags
  - Chat: ScrollArea for messages with Input and Button for message composition
  - Session reset: AlertDialog for confirmation with Button trigger
  - Document attachments: Card components with Badge for page numbers
  - Navigation: Button components for Dossiers/Administration switching with active states

- **Customizations**: 
  - Custom tree item component with indentation levels and connection lines
  - Custom PDF page renderer (simulated for this implementation)
  - Custom chat message bubbles with sender differentiation
  - Custom annotation markers with color coding

- **States**: 
  - Tree items: default (gray), hover (light blue bg), active/selected (orange icon/border)
  - Buttons: default (navy), hover (lighter navy + shadow), active (pressed effect), disabled (gray + opacity)
  - Input fields: default (border-gray), focus (border-orange + ring), filled (subtle bg)
  - Annotations: unread (orange badge), viewed (gray badge), active (orange glow)

- **Icon Selection**: 
  - Navigation: House for Dossiers home, GearSix for Administration, CaretRight/CaretDown for tree expansion
  - Actions: Plus for new project/document, ChatCircle for chat, ArrowsClockwise for reset
  - Project/Document: Folder/FolderOpen for projects, FilePdf for documents, Upload for file uploads
  - Annotations: Tag, Highlighter for highlighting, ChatCircle for comments
  - Controls: MagnifyingGlassPlus/Minus for zoom, Trash for deletion

- **Spacing**: 
  - Panel padding: p-4 (16px) for compact areas, p-6 (24px) for main content
  - Element gaps: gap-2 (8px) for tight groups, gap-4 (16px) for related items, gap-6 (24px) for sections
  - Tree indentation: pl-4 (16px) per level
  - Card spacing: p-4 internally, gap-3 between cards

- **Mobile**: 
  - Stacked single-column layout with tabbed interface to switch between tree/PDF/annotations/chat
  - Collapsible panels that overlay main content
  - Touch-optimized hit areas (min 44px)
  - Bottom sheet for annotation panel
  - Fixed header with hamburger menu for navigation
