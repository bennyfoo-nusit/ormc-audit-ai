# Business Rules — ORMC AI Document Audit

**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Extracted:** 2026-04-21

---

## Data Access and Sharing

| ID | Rule | Source |
|----|------|--------|
| BR-001 | Users can only see their own documents/dossiers by default (data isolation) | Confluence: Business Rules |
| BR-002 | Documents/dossiers can be shared with varying permission levels: View, Edit, Download | Confluence: Business Rules |
| BR-003 | Only dossier owners can manage sharing permissions | Design: ShareProjectDialog |
| BR-004 | Duplicate sharing to the same user is prevented (case-insensitive username check) | Design: ShareProjectDialog |

## AI Behavior

| ID | Rule | Source |
|----|------|--------|
| BR-005 | Human in the loop — AI assists but humans always remain in control | Confluence: Business Rules |
| BR-006 | Admin-set prompts define the criteria for tags and AI agent behaviour | Confluence: Business Rules |
| BR-007 | AI context must be scoped to the authenticated user's attached documents only | Implied: Data isolation + AI |
| BR-008 | AI uses document tags to assist in filtering its search during chat | Confluence: Module 4.2 |
| BR-009 | Default Document Agent is always available; custom agents activated via @-mention | Confluence: Module 9.3 |

## Document Management

| ID | Rule | Source |
|----|------|--------|
| BR-010 | All documents are converted to PDF separately before compilation | Confluence: Module 3.2 |
| BR-011 | Bookmarks are auto-generated at separation points and named after original file names | Confluence: Module 5.1 |
| BR-012 | Inserting documents must not disrupt existing bookmarks | Confluence: Module 5.2 |
| BR-013 | Documents are sourced from EHS360 (external system) — users download then upload | Confluence: Dependencies |
| BR-014 | ZIP file uploads should be handled smartly preserving internal folder structure | Confluence: Module 2.1 |

## Annotation

| ID | Rule | Source |
|----|------|--------|
| BR-015 | Tagged comments (with bookmark tags) form a bookmark in the document tree | Confluence: Module 7.1 |
| BR-016 | At least one comment or tag is required to save an annotation | Design: AnnotationPanel |
| BR-017 | Preconfigured annotation tag types: FIND (Finding), CLAR (Clarification), COMM (Comment) | Design: AnnotationPanel |
| BR-018 | Stamps include a default set plus stamps customised to individual users | Confluence: Module 7.3 |

## Export

| ID | Rule | Source |
|----|------|--------|
| BR-019 | User selects which aspects to download: findings, comments, annotations, AI conversations | Confluence: Module 2.2 |
| BR-020 | Notebook export includes screenshots and AI chat conversations | Confluence: Module 2.2 |
| BR-021 | Bookmarks must be preserved in exported PDFs | Confluence: Module 2.2 |

## Search

| ID | Rule | Source |
|----|------|--------|
| BR-022 | Keyword search results highlight matching documents on the bookmarks bar | Confluence: Module 8.1 |
| BR-023 | Tag search results highlight matching documents on the bookmarks bar | Confluence: Module 8.2 |
| BR-024 | Tag filtering uses AND logic (documents must match all selected tags) | Design: WorkingPage |

## Dossier

| ID | Rule | Source |
|----|------|--------|
| BR-025 | Dossier title is required for creation; description is optional | Design: DossiersHome |
| BR-026 | Session reset clears only the current project's session data (annotations + chat) | Design: App.tsx |
| BR-027 | Session reset requires user confirmation (destructive action) | Design: App.tsx |
