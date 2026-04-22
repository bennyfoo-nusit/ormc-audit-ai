# UI Reference Analysis

**Source:** `/design/ormc-ai-audit-homepa/`
**Files Analyzed:** 18 components + 40 UI primitives
**Framework:** React 19 + TypeScript
**UI Library:** Radix UI + shadcn/ui primitives + Tailwind CSS v4
**Build Tool:** Vite (with SWC plugin)
**State Management:** GitHub Spark KV hooks (`useKV`)

## Screens Identified

| # | Screen | File | Key Components | Purpose |
|---|--------|------|----------------|---------|
| 1 | Dossiers Home | `DossiersHome.tsx` | Card grid, Dialog, Badge, ShareProjectDialog | Landing page — project list, create/share projects |
| 2 | Working Page | `WorkingPage.tsx` | ResizablePanelGroup, Tabs, DocumentTree, PDFViewer, AnnotationPanel, AIChatPanel | Main audit workspace — 3-panel layout with doc tree, PDF viewer, annotation/chat |
| 3 | Document Management | `DocumentManagement.tsx` | Table, Dialog, AlertDialog, drag-and-drop reorder | Upload, manage, tag, reorder documents per project |
| 4 | PDF Viewer | `PDFViewer.tsx` | Custom canvas with zoom, page nav, shape drawing tools | Document display with annotation overlay and shape drawing |
| 5 | AI Chat Panel | `AIChatPanel.tsx` | ScrollArea, Textarea, Command (agent picker), Switch | AI assistant with web search toggle, multi-agent @-mention |
| 6 | Annotation Panel | `AnnotationPanel.tsx` | Textarea, Badge, color picker | Add comments/tags to highlighted text with color coding |
| 7 | Comments Panel | `CommentsPanel.tsx` | ScrollArea, annotation list | View and manage all annotations for current document |
| 8 | Document Tree | `DocumentTree.tsx` | Custom recursive tree with Collapsible, multi-select | Hierarchical navigation with bookmark structure |
| 9 | Side Panel | `SidePanel.tsx` | Collapsible wrapper | Toggle-able side panel container |
| 10 | Administration | `Administration.tsx` | Card, Dialog, CRUD forms | Manage custom AI agents and document tagging prompts |
| 11 | Share Project Dialog | `ShareProjectDialog.tsx` | Dialog, permissions selector | Share dossiers with other users (View/Edit permissions) |

## API Endpoints Referenced

| Method | Endpoint | Used In | Purpose |
|--------|----------|---------|---------|
| — | `useKV('projects-list')` | DossiersHome | CRUD project list (persisted key-value) |
| — | `useKV('documents-{id}')` | DocumentManagement | CRUD documents per project |
| — | `useKV('annotations-{id}')` | WorkingPage | CRUD annotations per project |
| — | `useKV('shapes-{id}')` | WorkingPage | CRUD shapes per project |
| — | `useKV('custom-agents')` | Administration, AIChatPanel | CRUD custom AI agents |
| — | `useKV('document-tagging-prompts')` | Administration | CRUD document tagging prompts |
| — | `useKV('web-search-enabled')` | AIChatPanel | Web search toggle state |
| — | `window.spark.user()` | DossiersHome | Current authenticated user |

> **Note:** The mockup uses GitHub Spark's `useKV` hooks for all persistence. A real implementation will need a proper backend API layer.

## Data Models Inferred

| Entity | Fields | Source |
|--------|--------|--------|
| Project | id, title, description, createdAt, updatedAt, ownerId, shares[] | DossiersHome.tsx |
| ProjectShare | userId, username, permission (view/edit), sharedAt | DossiersHome.tsx |
| Document | id, name, fileName, description, uploadedAt, fileSize, fileData, tags[] | DocumentManagement.tsx |
| Annotation | id, text, comment, tags[], highlightColor, page | CommentsPanel.tsx, AnnotationPanel.tsx |
| Shape | id, type (box/arrow/circle/triangle), page, x, y, width, height, color | PDFViewer.tsx |
| TreeNode | id, title, children[], pageRef, hasAnnotation, annotationId | DocumentTree.tsx |
| CustomAgent | id, name, systemPrompt, createdAt | Administration.tsx |
| DocumentTaggingPrompt | id, name, prompt, createdAt | Administration.tsx |
| Message (AI Chat) | id, sender (user/ai), text, timestamp, usedWebSearch, searchResults[] | AIChatPanel.tsx |

## Design Patterns

- **Layout:** 3-panel resizable workspace (tree | PDF | annotation+chat), header with nav
- **Responsive:** Mobile support via `use-mobile.ts` hook; stacked layout for small screens
- **Theme:** Deep Navy primary (`oklch(0.28 0.08 250)`), Orange accent (`oklch(0.68 0.18 45)`), CSS custom properties via `theme.css`
- **Accessibility:** Radix UI primitives provide ARIA support; semantic HTML structure
- **Navigation:** View-based routing (`dossiers` | `working` | `documents` | `administration`)
- **State:** Component-level `useState` + persistent `useKV` for cross-session data
- **Animation:** Framer Motion for tree expand/collapse, chat message transitions
- **Icons:** Phosphor Icons (React)
- **Typography:** Inter (UI) + JetBrains Mono (code/tags)
