# Functional Requirements — ORMC AI Document Audit

**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Extracted:** 2026-04-21
**Total Requirements:** 38
**Status:** Draft

---

## 1. User Authentication and Sharing

### FR-001: User Login
**Priority:** High
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Status:** 📋 Draft

**User Story:**
As a PI, I want to log in to the system with my NUS credentials so that my dossiers are securely tagged to my account.

**Acceptance Criteria:**
- [ ] Given a user navigates to the application, when they are not authenticated, then they are redirected to the Azure Entra ID login page via MSAL PKCE flow
- [ ] Given a user provides valid NUS credentials via Azure Entra ID, when they complete authentication, then they are redirected to the Dossiers Home with an active session
- [ ] Given a user is authenticated, when they access the system, then only their own dossiers are visible by default (data isolation)
- [ ] Given a user's session expires, when they attempt an action, then MSAL silently acquires a new token or prompts re-authentication
- [ ] Given the application starts, when MSAL initializes, then it uses the NUS Azure Entra ID tenant with OIDC protocol

**Business Rules:**
- Individual dossiers are tagged to users as owners
- Data isolation: users can only see their own dossiers by default
- Authentication uses Azure Entra ID (OIDC) with PKCE flow

**Dependencies:** None
**Notes:** Azure Entra ID confirmed as identity provider (CLR-001 resolved 2026-04-21). Use `@azure/msal-react` v5.3.0 for browser auth, `@azure/msal-node` v5.1.3 for server-side validation. Requires NUS tenant ID and app registration.

---

### FR-002: Project Sharing with Permissions
**Priority:** High
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Status:** 📋 Draft

**User Story:**
As a PI, I want to share my dossiers with other users with varying permission levels so that team members can collaborate on audits.

**Acceptance Criteria:**
- [ ] Given a dossier owner, when they share a dossier, then they can specify a target user by username
- [ ] Given a dossier owner, when sharing, then they can set permission level to View, Edit, or Download
- [ ] Given a user with View permission, when they access a shared dossier, then they can view content but cannot modify annotations or documents
- [ ] Given a user with Edit permission, when they access a shared dossier, then they can add/edit annotations, comments, and interact with AI chat
- [ ] Given a dossier owner, when they view shared users, then they can update or revoke permissions at any time
- [ ] Given a shared dossier, when displayed on the recipient's home page, then it appears in a "Shared with Me" section

**Business Rules:**
- Only dossier owners can manage sharing permissions
- Duplicate sharing to the same user is prevented (case-insensitive)
- Share timestamp is recorded

**Dependencies:** FR-001
**Notes:** Design shows View and Edit permissions. Confluence source also mentions Download permission.

---

## 2. File Management

### FR-003: Document Upload
**Priority:** High
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Status:** 📋 Draft

**User Story:**
As a PI, I want to upload documents to my dossier so that I can begin the audit review process.

**Acceptance Criteria:**
- [ ] Given a user in document management, when they select files, then they can upload one or more documents (bulk upload)
- [ ] Given a user uploads a document, when the upload completes, then the document is stored with name, description, upload timestamp, and file size
- [ ] Given a user uploads a document, when the file is processed, then supported formats include PDF, DOC, DOCX, XLSX, TXT, and image files (PNG, JPG, JPEG)
- [ ] Given a user uploads a ZIP file, when the file is processed, then contained documents are extracted smartly preserving folder structure
- [ ] Given a user has an existing dossier, when they upload additional documents ad-hoc, then the new documents are added without disrupting existing content

**Business Rules:**
- Documents are stored per-project (dossier)
- File metadata (name, description, size, upload date) is recorded automatically

**Dependencies:** FR-001
**Notes:** ZIP file smart handling mentioned in Confluence source. Specific file size limits not defined.

---

### FR-004: Document Download and Export
**Priority:** High
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Status:** 📋 Draft

**User Story:**
As a PI, I want to download my dossier with findings so that I can submit audit results for compliance.

**Acceptance Criteria:**
- [ ] Given a user in a dossier, when they choose to download, then they can download the full dossier as a compressed archive
- [ ] Given a user downloads a dossier, when selecting export options, then they can choose which aspects to include: findings, comments, annotations, AI conversations
- [ ] Given a user exports the dossier, when the export includes annotations, then annotations and shapes are embedded in the PDF
- [ ] Given a user exports the dossier, when bookmarks exist, then bookmarks are preserved in the exported PDF
- [ ] Given a user chooses to export findings only, when the export runs, then a standalone findings report is generated
- [ ] Given a user chooses to export AI conversations (Notebook), when the export runs, then chat history including screenshots is exported

**Business Rules:**
- User selects which aspects to download
- Notebook export includes screenshots
- Bookmarks must be preserved across export

**Dependencies:** FR-003, FR-014, FR-019
**Notes:** Notebook concept includes AI conversations and user notes with screenshots.

---

### FR-005: Document Organization with Folders
**Priority:** Medium
**Source:** [Discovery: AI Document Audit — Design Components](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Status:** 📋 Draft

**User Story:**
As a PI Supporting Staff, I want to organize documents into folders so that related audit documents are grouped logically.

**Acceptance Criteria:**
- [ ] Given a user in document management, when they create a folder, then a new folder is added with a name and timestamp
- [ ] Given documents exist, when a user drags a document to a folder, then the document is moved to that folder
- [ ] Given a user deletes a folder, when the folder contains documents, then the documents are moved to the unfiled section (not deleted)
- [ ] Given documents exist in folders, when the user views the document list, then documents are grouped by folder with an unfiled section

**Business Rules:**
- Deleting a folder does not delete its documents
- Documents can be moved between folders via drag-and-drop

**Dependencies:** FR-003
**Notes:** Derived from DocumentManagement.tsx design component. Not explicitly in Confluence source.

---

## 3. Document Conversion

### FR-006: Smart Sizing of Large Documents
**Priority:** High
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Status:** 📋 Draft

**User Story:**
As a PI, I want the system to smartly resize large documents so that content like wide Excel tables is readable in PDF format.

**Acceptance Criteria:**
- [ ] Given a large XLSX file with >6 columns, when converted to PDF, then the page orientation automatically switches to landscape
- [ ] Given a very wide XLSX file with >12 columns, when converted to PDF, then the page size switches to A3
- [ ] Given a dense XLSX file, when converted to PDF, then font size is dynamically reduced (10pt → 6pt) based on column density
- [ ] Given an XLSX file with multiple sheets, when converted, then each sheet is rendered with sheet name headers and page footers
- [ ] Given a large document, when processing, then the conversion runs without blocking the user interface

**Business Rules:**
- Auto-detect column count to determine page orientation and size
- Per-column width optimization (sample first 100 rows, cap at 40mm)
- Warning emitted for spreadsheets >1000 rows

**Dependencies:** FR-007
**Notes:** Smart sizing capabilities validated in spike-doc-conversion spike.

---

### FR-007: Document Conversion to PDF
**Priority:** High
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Status:** 📋 Draft

**User Story:**
As a PI, I want all uploaded documents to be automatically converted to PDF so that I can view and annotate them in a unified format.

**Acceptance Criteria:**
- [ ] Given a DOCX file is uploaded, when processing completes, then it is converted to PDF preserving headings, lists, tables, and images
- [ ] Given an XLSX file is uploaded, when processing completes, then it is converted to PDF with smart table formatting
- [ ] Given image files (PNG, JPG, JPEG) are uploaded, when processing completes, then they are converted to PDF with smart orientation detection
- [ ] Given a PPTX file is uploaded, when processing completes, then it is converted to PDF via server-side conversion
- [ ] Given a PDF file is uploaded, when processing completes, then no conversion is needed and the file is used as-is
- [ ] Given all documents, when conversion completes, then each document is stored as a separate PDF

**Business Rules:**
- All documents are converted to PDF separately
- Conversion preserves original content structure where possible
- DOCX/XLSX/Image conversion is client-side; PPTX uses server-side LibreOffice

**Dependencies:** FR-003
**Notes:** Validated by spike-doc-conversion. DOCX produces image-based PDFs (text not selectable). PPTX requires server-side infrastructure.

---

## 4. Document Tagging

### FR-008: AI Document Tagging
**Priority:** High
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Status:** 📋 Draft

**User Story:**
As a PI, I want AI to automatically read and tag each uploaded document so that documents are categorized by content for easier retrieval.

**Acceptance Criteria:**
- [ ] Given a document is uploaded, when AI processing completes, then 3-5 relevant metadata tags are generated based on document content
- [ ] Given AI tags are generated, when the user views the document, then the tags are displayed alongside the document metadata
- [ ] Given AI tags exist, when the user wants to refine them, then they can regenerate tags using the AI
- [ ] Given AI tagging, when tag criteria are defined by admin-set prompts, then the AI follows those prompts to determine tag categories
- [ ] Given AI tagging fails, when an error occurs, then default fallback tags are applied and the user is notified

**Business Rules:**
- Tags and criteria come from admin-set prompts (configurable by System Administrator)
- AI uses the configured tagging prompt to generate tags
- Manual tagging is also allowed (see FR-009)

**Dependencies:** FR-003, FR-030
**Notes:** Uses LLM API (e.g., GPT-4O-Mini) for tag generation. Example tags from domain: Chemical Hazards, Contractor, Biological Hazards, Safety Compliance.

---

### FR-009: Manual Document Tagging
**Priority:** Medium
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Status:** 📋 Draft

**User Story:**
As a PI, I want to manually add, edit, or remove document tags so that I can correct or supplement AI-generated tags.

**Acceptance Criteria:**
- [ ] Given a document with existing tags, when the user opens the tag editor, then current tags are displayed
- [ ] Given the tag editor is open, when the user adds a custom tag, then it is appended to the tag list
- [ ] Given the tag editor is open, when the user removes a tag, then it is deleted from the tag list
- [ ] Given the user modifies tags, when they save, then the updated tags are persisted

**Business Rules:**
- Duplicate tags are not allowed
- Custom tags coexist with AI-generated tags

**Dependencies:** FR-008
**Notes:** Design component shows inline tag editing with add/remove functionality.

---

### FR-010: AI-Assisted Retrieval Using Tags
**Priority:** High
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Status:** 📋 Draft

**User Story:**
As a PI, I want the AI to use document tags when answering my queries so that search results are more relevant and focused.

**Acceptance Criteria:**
- [ ] Given a user asks the AI a question, when relevant tags exist, then the AI uses tags to filter and prioritize its search across documents
- [ ] Given a user filters by specific tags in the AI chat, when the query runs, then the AI only searches documents matching those tags
- [ ] Given multiple documents have matching tags, when the AI responds, then it cites specific documents and page references

**Business Rules:**
- AI retrieval is tag-aware as a filtering mechanism
- Tags supplement full-text search, not replace it

**Dependencies:** FR-008, FR-027
**Notes:** Tags serve as metadata for AI retrieval to improve precision.

---

## 5. Dossier Compilation

### FR-011: Document Merging into Dossier
**Priority:** High
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Status:** 📋 Draft

**User Story:**
As a PI, I want documents to be merged into a compiled dossier PDF so that I can review all audit documents in a single view.

**Acceptance Criteria:**
- [ ] Given multiple documents in a dossier, when the merge runs, then all documents are combined into a single navigable PDF
- [ ] Given documents are merged, when bookmarks are added, then bookmarks are auto-generated at separation points using original file names
- [ ] Given the merged dossier, when the user views it, then they can navigate between documents using the bookmark tree

**Business Rules:**
- Bookmarks are named after original file names
- Merge preserves document order as uploaded/organized

**Dependencies:** FR-003, FR-007
**Notes:** Validated by spike-pdf-rendering using pdf-lib's copyPages() and low-level bookmark API.

---

### FR-012: Document Insertion into Existing Dossier
**Priority:** High
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Status:** 📋 Draft

**User Story:**
As a PI, I want to insert additional documents into my existing dossier without disrupting existing bookmarks so that I can add new evidence during the audit.

**Acceptance Criteria:**
- [ ] Given an existing compiled dossier, when a user adds a new document, then the document is inserted into the PDF
- [ ] Given a document is inserted, when the dossier is recompiled, then existing bookmarks and annotations are preserved
- [ ] Given a document is inserted, when the user selects an insertion point, then the document is placed at that location (click and drop)
- [ ] Given a new document is inserted, when bookmarks are regenerated, then a new bookmark is added for the inserted document

**Business Rules:**
- Insertion must not disrupt existing bookmarks
- Click-and-drop insertion at specific location

**Dependencies:** FR-011
**Notes:** "Click and drop" insertion method specified in Confluence source.

---

## 6. Display and Navigation

### FR-013: Document Display and Viewing
**Priority:** High
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Status:** 📋 Draft

**User Story:**
As a PI, I want to view documents in a PDF viewer with scrolling and zoom so that I can read audit documents clearly.

**Acceptance Criteria:**
- [ ] Given a dossier is open, when the user selects a document, then it is displayed in the PDF viewer panel
- [ ] Given the PDF viewer, when the user scrolls, then the document scrolls smoothly through pages
- [ ] Given the PDF viewer, when the user zooms in/out, then the zoom adjusts in 10% increments (50%–200%)
- [ ] Given the PDF viewer, when the user navigates pages, then prev/next buttons and page counter are available
- [ ] Given the PDF viewer, when text is rendered, then it is selectable and searchable in the text layer

**Business Rules:**
- Zoom range: 50% to 200%
- Page navigation with boundary checks (disable prev on page 1, next on last)

**Dependencies:** FR-011
**Notes:** Uses react-pdf with pdf.js. Text layer provides selectable text. Validated in spike.

---

### FR-014: Bookmark Navigation
**Priority:** High
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Status:** 📋 Draft

**User Story:**
As a PI, I want to navigate documents using a bookmark tree so that I can quickly jump to specific sections of the dossier.

**Acceptance Criteria:**
- [ ] Given a compiled dossier, when the bookmark tree loads, then bookmarks are generated based on folder structure and file names
- [ ] Given the bookmark tree, when the user clicks a bookmark, then the PDF viewer navigates to that document/page
- [ ] Given the bookmark tree, when nodes have children, then they can be expanded/collapsed with animation
- [ ] Given the bookmark tree, when the user wants to reorganize, then they can manually relocate and nest bookmarks via click-and-drag
- [ ] Given the bookmark tree, when annotations exist on a bookmarked section, then a visual indicator (pulsing dot) is shown
- [ ] Given the bookmark tree, when the user creates a new bookmark, then they can insert it at any position in the hierarchy

**Business Rules:**
- Bookmarks are generated automatically from folder structure/file names
- Users can edit, insert, relocate, and nest bookmarks manually
- Annotation indicator on bookmarked nodes

**Dependencies:** FR-011, FR-013
**Notes:** Design shows recursive tree with expand/collapse animation, page references, and annotation indicators.

---

### FR-015: Document Tag Viewer and Filtering
**Priority:** Medium
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Status:** 📋 Draft

**User Story:**
As a PI, I want to filter documents by their tags in the tree view so that I can focus on specific categories during the audit.

**Acceptance Criteria:**
- [ ] Given document tags exist, when the user selects one or more tag filters, then only documents matching ALL selected tags are shown
- [ ] Given tag filters are active, when displayed in the document tree, then filtered documents are highlighted on the bookmarks bar
- [ ] Given the user clears tag filters, when the tree updates, then all documents are shown again

**Business Rules:**
- Tag filtering uses AND logic (documents must match all selected tags)
- Filter state persists during the session

**Dependencies:** FR-008, FR-014
**Notes:** Design shows multi-tag AND filtering with visual highlight on matching documents.

---

### FR-016: Notebook (Findings Capture)
**Priority:** Medium
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Status:** 📋 Draft

**User Story:**
As a PI, I want to capture AI chat conversations, manual notes, and screenshots in a Notebook so that I have a complete record of my audit findings.

**Acceptance Criteria:**
- [ ] Given the user is in the working page, when they click "capture to notebook", then the current AI conversation is saved to the Notebook
- [ ] Given the Notebook, when the user adds a manual note, then it is appended with timestamp
- [ ] Given the Notebook, when the user captures a screenshot, then it is saved alongside the conversation
- [ ] Given the Notebook, when the user exports, then it is downloadable as a document

**Business Rules:**
- One-click capture of AI chat conversations
- Notebook is a downloadable export option

**Dependencies:** FR-027, FR-004
**Notes:** Notebook concept mentioned in Confluence source under Display and Navigation (6.4) and Document Download (2.2).

---

## 7. Annotation

### FR-017: Text Annotation
**Priority:** High
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Status:** 📋 Draft

**User Story:**
As a PI, I want to select text in the PDF and add annotations so that I can record findings, clarifications, and comments during the audit.

**Acceptance Criteria:**
- [ ] Given the user is viewing a PDF, when they select text, then the annotation panel opens showing the selected text
- [ ] Given the annotation panel is open, when the user selects a highlight color, then they can choose from 6 preset colors (Yellow, Green, Blue, Pink, Orange, Purple)
- [ ] Given the annotation panel, when the user types a comment, then the comment is associated with the highlighted text
- [ ] Given the annotation panel, when the user adds tags, then they can choose from preconfigured tags (FIND, CLAR, COMM) or add custom tags
- [ ] Given a user saves an annotation, when the annotation is saved, then it is stored with text, comment, tags, highlight color, page number, and timestamp
- [ ] Given an annotation has a bookmark tag, when saved, then it forms a bookmark in the document tree

**Business Rules:**
- Tagged comments (with bookmark tags) form a bookmark
- Annotations are stored per document and page
- Preconfigured tag types: FIND (Finding), CLAR (Clarification), COMM (Comment)
- At least one comment or tag is required to save

**Dependencies:** FR-013
**Notes:** Design shows 6 highlight colors and 3 preconfigured tag types with color coding.

---

### FR-018: Shape Annotation
**Priority:** Medium
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Status:** 📋 Draft

**User Story:**
As a PI, I want to draw shapes on the PDF so that I can highlight areas of interest with visual markers.

**Acceptance Criteria:**
- [ ] Given the PDF viewer, when the user selects a shape tool, then available shapes include box, circle, triangle, and arrow
- [ ] Given a shape tool is selected, when the user clicks and drags on the PDF, then a shape is drawn with a temporary preview (dashed outline)
- [ ] Given a shape is drawn, when the user releases the mouse, then the shape is finalized with the selected color
- [ ] Given existing shapes, when the user clicks a shape, then it is selected with visual feedback (glow effect)
- [ ] Given a selected shape, when the user drags it, then the shape can be repositioned
- [ ] Given a selected shape, when the user presses Delete, then the shape is removed
- [ ] Given shapes on a page, when the user zooms, then shapes scale correctly with the document

**Business Rules:**
- Shapes are page-specific (stored with page number)
- Shape types: box, arrow, circle, triangle
- Shapes are rendered as SVG overlays

**Dependencies:** FR-013
**Notes:** Validated in spike-pdf-rendering. Shapes are baked into PDF on export (not native PDF annotations).

---

### FR-019: Stamp Annotation
**Priority:** Medium
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Status:** 📋 Draft

**User Story:**
As a PI, I want to insert stamps on the PDF so that I can mark documents with approval, review status, or custom indicators.

**Acceptance Criteria:**
- [ ] Given the PDF viewer, when the user selects the stamp tool, then a library of default stamps is available
- [ ] Given the stamp library, when the user selects a stamp, then they can place it on the PDF by clicking a location
- [ ] Given custom stamps, when a user has personalized stamps, then those stamps are available in their stamp library
- [ ] Given a stamp is placed, when the PDF is exported, then the stamp is embedded in the output

**Business Rules:**
- Default stamp set provided
- Custom stamps can be personalized per user

**Dependencies:** FR-013
**Notes:** Stamps require image embedding via pdf-lib.embedPng(). Stamp images need to be pre-loaded as assets.

---

## 8. Smart Search

### FR-020: Keyword Search
**Priority:** High
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Status:** 📋 Draft

**User Story:**
As a PI, I want to search documents by keywords so that I can quickly find relevant content across the dossier.

**Acceptance Criteria:**
- [ ] Given a user enters a keyword in the search box, when the search runs, then all documents containing the keyword are identified
- [ ] Given search results, when documents match, then matching documents are highlighted on the bookmarks bar
- [ ] Given search results, when the user clicks a result, then the PDF viewer navigates to the matching page with the keyword highlighted
- [ ] Given the search, when filtering by keyword in the document tree, then the tree filters to show only matching nodes

**Business Rules:**
- Search across all documents in the dossier
- Results highlighted on bookmarks bar
- Real-time search filtering in document tree

**Dependencies:** FR-013, FR-014
**Notes:** Design shows real-time search filtering in the document tree panel.

---

### FR-021: Search by Document Tag
**Priority:** Medium
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Status:** 📋 Draft

**User Story:**
As a PI, I want to search by document element or tag so that I can find documents based on their categorization.

**Acceptance Criteria:**
- [ ] Given document tags exist, when the user selects a tag-based search, then documents with matching tags are listed
- [ ] Given tag search results, when documents match, then they are highlighted on the bookmarks bar
- [ ] Given tag filtering, when combined with keyword search, then both filters apply (AND logic)

**Business Rules:**
- Matching documents highlighted on bookmarks bar
- Tag search can be combined with keyword search

**Dependencies:** FR-008, FR-020
**Notes:** Confluence source specifies "Documents with tags highlighted on bookmarks bar."

---

## 9. AI Chat and Query

### FR-022: Web Search Integration
**Priority:** Medium
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Status:** 📋 Draft

**User Story:**
As a PI, I want the AI to search the web to answer queries related to my audit documents so that I can verify facts against external sources.

**Acceptance Criteria:**
- [ ] Given the user is in AI chat, when they enable web search toggle, then the AI includes web sources in its response
- [ ] Given web search is enabled, when the AI responds, then it shows web search results with title, snippet, and URL
- [ ] Given web search results, when the user clicks a result link, then it opens the external source
- [ ] Given a user preference, when web search is toggled, then the preference persists across sessions

**Business Rules:**
- Web search is opt-in (toggle control)
- Web search results are clearly distinguished from document-based answers

**Dependencies:** None
**Notes:** Design shows Globe icon toggle for web search with visual indicator when active.

---

### FR-023: AI Chat and Document Interaction
**Priority:** High
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Status:** 📋 Draft

**User Story:**
As a PI, I want to chat with AI about my document contents so that I can quickly retrieve facts, get summaries, and ask questions.

**Acceptance Criteria:**
- [ ] Given the user types a question, when the AI processes it, then the AI responds based on the attached documents' content
- [ ] Given the user has selected documents in the tree, when they ask a question, then the AI scopes its answer to the selected documents
- [ ] Given the AI responds, when the response references a document, then reference links are provided that jump to the active PDF page
- [ ] Given the AI chat, when filtering by tags, then the AI searches only documents matching those tags
- [ ] Given a conversation, when the user continues chatting, then the AI maintains conversation context
- [ ] Given the AI chat, when a system prompt is configured by admin, then the AI uses that prompt to establish its role and behavior
- [ ] Given the AI response, when the user wants to copy it, then a copy-to-clipboard button is available

**Business Rules:**
- Admin-set AI prompt establishes AI role
- AI can filter by tags, specific documents, or all documents
- Reference links navigate to the PDF page
- Conversation context is maintained within a session

**Dependencies:** FR-010, FR-013
**Notes:** Design shows document attachment indicators, copy button, and markdown-style messages.

---

### FR-024: Multi-Agent Window
**Priority:** High
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Status:** 📋 Draft

**User Story:**
As a PI, I want to invoke specialized AI agents for subject-matter questions so that I can get domain-specific answers from my documents.

**Acceptance Criteria:**
- [ ] Given the AI chat, when a default Document Agent is loaded, then it is available for general document queries
- [ ] Given the AI chat, when the user types @, then a dropdown shows available agents (default + custom)
- [ ] Given the agent picker, when the user selects an agent, then the agent's system prompt is applied to the conversation
- [ ] Given a custom agent is selected, when the user asks a question, then the AI responds using that agent's system prompt and role
- [ ] Given the agent picker, when hovering over an agent, then the system prompt preview is shown

**Business Rules:**
- Default Document Agent is always available
- Custom agents are invoked via @ indicators
- Each agent has a distinct system prompt that sets its role

**Dependencies:** FR-023, FR-029
**Notes:** Design shows @-mention agent picker with system prompt preview. Agents configured in Administration.

---

## 10. Dossier Management (Home)

### FR-025: Dossier Home Page
**Priority:** High
**Source:** [Discovery: AI Document Audit — Design](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Status:** 📋 Draft

**User Story:**
As a PI, I want a home page showing all my audit dossiers so that I can manage and access my projects from one place.

**Acceptance Criteria:**
- [ ] Given a user logs in, when the home page loads, then their dossiers are displayed in a card grid layout
- [ ] Given the home page, when the user creates a new dossier, then they can enter a title (required) and description (optional)
- [ ] Given the home page, when dossiers exist, then they show title, description, creation date, and share count
- [ ] Given the home page, when the user searches, then dossiers are filtered by title or description in real-time
- [ ] Given the home page, when dossiers are separated, then "My Projects" and "Shared with Me" sections are displayed
- [ ] Given the home page, when the user toggles view mode, then they can switch between card grid and table list views
- [ ] Given the home page, when the user clicks a dossier, then they are navigated to the Working Page
- [ ] Given no dossiers exist, when the home page loads, then an empty state with a "Create First Project" prompt is shown

**Business Rules:**
- Title is required for dossier creation
- Responsive layout: 1 column mobile, 2 tablet, 3 desktop

**Dependencies:** FR-001
**Notes:** Derived from DossiersHome.tsx design component.

---

### FR-026: Session Reset
**Priority:** Low
**Source:** [Discovery: AI Document Audit — Design](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Status:** 📋 Draft

**User Story:**
As a PI, I want to reset the current audit session so that I can start a fresh review without previous annotations and chat history.

**Acceptance Criteria:**
- [ ] Given the user is in the Working Page, when they click "Reset Session", then a confirmation dialog is shown
- [ ] Given the confirmation dialog, when the user confirms, then all annotations and chat history for the current project are cleared
- [ ] Given the session is reset, when the workspace reloads, then the document returns to the first page with no annotations
- [ ] Given the confirmation dialog, when the user cancels, then no data is lost

**Business Rules:**
- Only the current project's session data is cleared
- Confirmation required before reset (destructive action)

**Dependencies:** FR-017, FR-023
**Notes:** Derived from App.tsx design component.

---

## 11. AI Chat — Document Context

### FR-027: Document Attachment for AI Context
**Priority:** High
**Source:** [Discovery: AI Document Audit — Design](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Status:** 📋 Draft

**User Story:**
As a PI, I want to select multiple documents from the tree as AI context so that the AI can answer questions across specific documents.

**Acceptance Criteria:**
- [ ] Given the document tree, when the user Ctrl+Clicks multiple documents, then they are all selected as AI context
- [ ] Given selected documents, when displayed in the AI chat panel, then attached documents are listed with names and page ranges
- [ ] Given attached documents, when the user removes one, then it is deselected from the AI context
- [ ] Given multiple documents are selected, when the user asks a question, then the AI searches across all attached documents

**Business Rules:**
- Multi-select via Ctrl/Cmd + Click
- Selected document count is shown
- Documents can be individually removed from context

**Dependencies:** FR-023, FR-014
**Notes:** Derived from WorkingPage.tsx design showing multi-select and attachment indicators.

---

## 12. Comments and Findings View

### FR-028: Comments Panel with Tag Filtering
**Priority:** High
**Source:** [Discovery: AI Document Audit — Design](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Status:** 📋 Draft

**User Story:**
As a PI, I want to view all my annotations filtered by type so that I can review findings, clarifications, and comments separately.

**Acceptance Criteria:**
- [ ] Given annotations exist, when the user opens the Comments panel, then all annotations are listed sorted by page number
- [ ] Given the Comments panel, when the user filters by tag (FIND, CLAR, COMM), then only annotations with that tag are shown
- [ ] Given filter buttons, when displayed, then each shows the count of matching annotations
- [ ] Given an annotation in the list, when the user clicks it, then the PDF viewer navigates to that annotation's page and highlights it
- [ ] Given an annotation, when the user deletes it, then it is removed from the list and the PDF view
- [ ] Given annotations, when displayed, then each shows the selected text, comment, tags (color-coded), timestamp, and page number

**Business Rules:**
- Tag color coding: FIND (rose), CLAR (amber), COMM (blue)
- Annotations sorted by page number ascending
- Filter shows count per tag

**Dependencies:** FR-017
**Notes:** Derived from CommentsPanel.tsx design component.

---

## 13. Administration

### FR-029: Custom AI Agent Management
**Priority:** High
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Status:** 📋 Draft

**User Story:**
As a System Administrator, I want to create and manage custom AI agents with specific system prompts so that PIs can use domain-specific AI personas during audits.

**Acceptance Criteria:**
- [ ] Given the Administration page, when the user creates a new agent, then they provide a name and system prompt
- [ ] Given the agent list, when agents exist, then each shows name, creation date, and system prompt preview (truncated)
- [ ] Given an existing agent, when the user edits it, then they can update the name and/or system prompt
- [ ] Given an existing agent, when the user deletes it, then it is removed from the available agents list
- [ ] Given a custom agent is created, when a PI uses the AI chat, then the agent appears in the @-mention picker
- [ ] Given the agent form, when the user submits, then both name and system prompt are required

**Business Rules:**
- Name and system prompt are required fields
- Agents are available to all users in AI chat
- Empty state UI with prompt to create first agent

**Dependencies:** None
**Notes:** Design shows CRUD interface with large textarea for system prompts. Admin-set prompts define audit-specific AI behaviour.

---

### FR-030: Document Tagging Prompt Management
**Priority:** Medium
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Status:** 📋 Draft

**User Story:**
As a System Administrator, I want to create and manage document tagging prompts so that I can define the criteria AI uses for automatic document categorization.

**Acceptance Criteria:**
- [ ] Given the Administration page, when the user creates a tagging prompt, then they provide a name and prompt text
- [ ] Given the tagging prompt list, when prompts exist, then each shows name, creation date, and prompt preview
- [ ] Given an existing prompt, when the user edits it, then they can update the name and/or prompt text
- [ ] Given an existing prompt, when the user deletes it, then it is removed
- [ ] Given tagging prompts exist, when documents are uploaded, then the configured prompt guides AI tag generation

**Business Rules:**
- Name and prompt text are required fields
- Tagging prompts influence AI document categorization

**Dependencies:** None
**Notes:** Derived from Administration.tsx design component and Confluence source (admin-set prompts for tags).

---

## 14. Workspace Layout

### FR-031: Multi-Panel Resizable Workspace
**Priority:** High
**Source:** [Discovery: AI Document Audit — Design](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Status:** 📋 Draft

**User Story:**
As a PI, I want to resize and toggle workspace panels so that I can customize my audit workspace layout for different tasks.

**Acceptance Criteria:**
- [ ] Given the Working Page, when it loads, then it displays 4 panels: Document Tree, PDF Viewer, Annotation Panel, AI Chat Panel
- [ ] Given the workspace panels, when the user drags a panel border, then the panels resize proportionally
- [ ] Given a panel, when the user clicks its toggle button, then the panel can be hidden or shown
- [ ] Given panel preferences, when the user adjusts panels, then the layout is preserved during the session

**Business Rules:**
- 4-panel resizable layout with toggle visibility per panel
- Panel sizes are adjustable via drag

**Dependencies:** FR-013, FR-014
**Notes:** Design uses ResizablePanelGroup. Layout adapts to mobile (stacked) vs desktop (side-by-side).

---

## 15. Navigation

### FR-032: Application Navigation
**Priority:** High
**Source:** [Discovery: AI Document Audit — Design](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Status:** 📋 Draft

**User Story:**
As a PI, I want to navigate between application views so that I can move between dossier home, working page, document management, and administration.

**Acceptance Criteria:**
- [ ] Given the application header, when the user clicks "Dossiers", then they navigate to the Dossiers Home
- [ ] Given the application header, when the user clicks "Administration", then they navigate to the Administration page
- [ ] Given a dossier card, when the user clicks the title, then they navigate to the Working Page
- [ ] Given a dossier card, when the user clicks the document icon, then they navigate to Document Management
- [ ] Given any view, when NUS branding is displayed, then the NUS logo is visible in the header

**Business Rules:**
- Views: Dossiers Home, Working Page, Document Management, Administration
- NUS branding required on all screens

**Dependencies:** FR-025
**Notes:** Design uses view-based routing with NUS logo in header.

---

## 16. Business Process Flow

### FR-033: Preparation Phase Workflow
**Priority:** High
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Status:** 📋 Draft

**User Story:**
As a PI, I want the system to guide me through the preparation phase so that I can set up my audit dossier efficiently.

**Acceptance Criteria:**
- [ ] Given a PI has downloaded documents from EHS360, when they log in, then they can immediately create a new dossier
- [ ] Given a new dossier, when the user uploads documents, then the system initiates the document review pipeline (conversion → tagging → merging)
- [ ] Given the preparation phase, when all uploads are complete, then the system transitions to the review phase automatically

**Business Rules:**
- Documents are sourced from EHS360 (external dependency)
- Pipeline: Upload → Smart Sizing → Conversion → Tagging → Merging

**Dependencies:** FR-001, FR-003, FR-006, FR-007, FR-008, FR-011
**Notes:** Maps to Phase 1 of the Business Process Flow in Confluence source.

---

### FR-034: Document Review Phase Workflow
**Priority:** High
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Status:** 📋 Draft

**User Story:**
As a PI, I want to review documents using navigation, annotation, search, and AI chat so that I can complete my audit efficiently.

**Acceptance Criteria:**
- [ ] Given the review phase, when the dossier is compiled, then the user can view, scroll, and navigate documents
- [ ] Given the review phase, when the user uses annotation tools, then they can mark findings, clarifications, and comments
- [ ] Given the review phase, when the user uses smart search, then they can find content by keywords and tags
- [ ] Given the review phase, when the user chats with AI, then queries are answered based on attached documents
- [ ] Given the review phase, when AI retrieval runs, then tags are used to assist search during chat

**Business Rules:**
- Review phase combines navigation + annotation + search + AI
- AI retrieval leverages tags for search assistance

**Dependencies:** FR-013, FR-017, FR-020, FR-023
**Notes:** Maps to Phase 2 of the Business Process Flow.

---

### FR-035: Post-Review Phase Workflow
**Priority:** High
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Status:** 📋 Draft

**User Story:**
As a PI, I want to insert additional documents and export my final dossier so that I can complete and submit my audit.

**Acceptance Criteria:**
- [ ] Given the post-review phase, when additional documents are needed, then the user can insert them without disrupting existing bookmarks
- [ ] Given the post-review phase, when the audit is complete, then the user can export the dossier with selected aspects
- [ ] Given additional documents, when a decision point is reached, then the system loops back for re-review if needed

**Business Rules:**
- Decision point: additional document needed? → loop back to insertion
- Export with selectable aspects

**Dependencies:** FR-012, FR-004
**Notes:** Maps to Phase 3 of the Business Process Flow.

---

## 17. Multi-Select and Context

### FR-036: Document Multi-Select in Tree
**Priority:** Medium
**Source:** [Discovery: AI Document Audit — Design](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Status:** 📋 Draft

**User Story:**
As a PI, I want to select multiple documents in the tree view so that I can perform bulk actions like tagging or AI context setting.

**Acceptance Criteria:**
- [ ] Given the document tree, when the user Ctrl/Cmd+Clicks, then multiple nodes are selected simultaneously
- [ ] Given multiple selections, when the selection count is shown, then the number of selected items is displayed
- [ ] Given multiple selections, when the user single-clicks without Ctrl, then previous selections are cleared

**Business Rules:**
- Ctrl+Click for additive selection
- Single click replaces selection

**Dependencies:** FR-014
**Notes:** Derived from DocumentTree.tsx design component.

---

## 18. Area Highlight

### FR-037: Area Highlight Annotation
**Priority:** Medium
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Status:** 📋 Draft

**User Story:**
As a PI, I want to highlight areas on the PDF so that I can draw attention to specific regions of a document page.

**Acceptance Criteria:**
- [ ] Given the PDF viewer, when the user selects the area highlight tool, then they can click and drag to highlight a rectangular region
- [ ] Given the area highlight, when the user releases the mouse, then the highlighted area is saved with a semi-transparent color overlay
- [ ] Given an area highlight, when the PDF is exported, then the highlight is embedded in the output

**Business Rules:**
- Area highlights are a form of shape annotation with opacity
- Highlights persist per page

**Dependencies:** FR-018
**Notes:** "Area highlights" mentioned in Confluence source under Annotation (7.2).

---

## 19. Document Search in Management

### FR-038: Document Search in Management View
**Priority:** Low
**Source:** [Discovery: AI Document Audit — Design](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Status:** 📋 Draft

**User Story:**
As a PI Supporting Staff, I want to search documents in the management view so that I can quickly find specific uploaded files.

**Acceptance Criteria:**
- [ ] Given documents are listed in management view, when the user types in the search box, then documents are filtered by name in real-time
- [ ] Given a search query, when no documents match, then an appropriate empty state message is shown

**Business Rules:**
- Search filters by document name
- Real-time filtering as user types

**Dependencies:** FR-003
**Notes:** Derived from DocumentManagement.tsx design component.
