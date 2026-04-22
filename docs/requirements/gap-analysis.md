# Gap Analysis — ORMC AI Document Audit

**Generated:** 2026-04-21
**Total Gaps:** 18
**Critical:** 3 | **High:** 6 | **Medium:** 7 | **Low:** 2

---

## Gap Summary

| ID | Category | Issue | Severity | Impact | Status |
|----|----------|-------|----------|--------|--------|
| GAP-001 | Missing Requirement | Authentication mechanism not specified | Critical | Cannot implement login without confirmed identity provider | ✅ Resolved |
| GAP-002 | Ambiguous | Download permission vs. View/Edit permissions unclear | High | Unclear permission model may lead to wrong implementation | Open |
| GAP-003 | Missing Requirement | File size and upload limits not defined | High | No capacity planning; risk of system abuse or failures | Open |
| GAP-004 | Missing Requirement | Backend architecture not decided | Critical | No backend means no API, no database, no AI integration | ✅ Resolved |
| GAP-005 | Missing Requirement | Database technology not selected | Critical | Cannot design data model or persistence layer | ✅ Resolved |
| GAP-006 | Ambiguous | Notebook feature scope unclear | High | Notebook combines chat, notes, screenshots — exact UX undefined | Open |
| GAP-007 | Missing Requirement | AI/RAG architecture not specified | High | No AI integration design (Azure OpenAI, embedding strategy, vector store) | Open |
| GAP-008 | Incomplete | Stamp annotation default set not defined | Medium | Cannot implement stamp feature without knowing the stamp library | Open |
| GAP-009 | Missing Requirement | Concurrent edit behavior not specified | Medium | No conflict resolution strategy for shared dossiers with Edit permission | Open |
| GAP-010 | Ambiguous | EHS360 integration scope unclear | Medium | Is it manual download-upload only, or should there be an API integration? | Open |
| GAP-011 | Missing Requirement | Error handling for large files not specified | Medium | No defined behavior for exceeding storage limits or conversion failures | Open |
| GAP-012 | Ambiguous | DOCX PDF text selectability | Medium | DOCX→PDF conversion produces image-based PDFs (text not selectable) — is this acceptable? | Open |
| GAP-013 | Missing Requirement | User management and roles not defined | High | No RBAC model beyond owner/shared permissions; Admin role unclear | Open |
| GAP-014 | Missing Requirement | Audit logging requirements not specified | Medium | Compliance workflows typically need audit trails | Open |
| GAP-015 | Missing Requirement | Data retention and purge policy not defined | Medium | How long are dossiers kept? Who can delete? What happens to archived data? | Open |
| GAP-016 | Incomplete | Mobile/offline support not addressed | Low | Confluence mentions no exclusions; tablet/field use may imply some offline need | Open |
| GAP-017 | Missing Requirement | Hosting and deployment target not specified | High | No hosting decision (Azure, NUS on-prem, hybrid) | Open |
| GAP-018 | Incomplete | .doc legacy format support | Low | Mammoth only supports .docx; .doc (binary) requires LibreOffice | Open |

---

## Detailed Gaps

### GAP-001: Authentication Mechanism Not Specified
**Category:** Missing Requirement
**Severity:** Critical
**Severity Score:** 10
**Status:** ✅ Resolved (2026-04-21)
**Source Page:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)

**Issue:**
The Confluence source states "[Assumed] Authentication will integrate with existing university identity provider (e.g., NUS SSO)" but this is marked as an assumption. No confirmation of which identity provider, SAML vs OIDC, or whether Azure AD B2C or NUS CAS/SSO will be used.

**Resolution:**
Azure Entra ID (formerly Azure AD) confirmed as identity provider using OIDC protocol with PKCE flow. Use `@azure/msal-react` v5.3.0 for browser auth and `@azure/msal-node` v5.1.3 for server-side validation. Requires NUS tenant ID and app registration.

**Related Requirements:** FR-001, FR-002, NFR-001
**Clarification Generated:** CLR-001 (✅ Resolved)

---

### GAP-002: Download Permission vs View/Edit
**Category:** Ambiguous
**Severity:** High
**Severity Score:** 7
**Source Page:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)

**Issue:**
The Confluence source mentions three permission levels: View, Edit, Download. The design prototype only implements View and Edit. Is Download a separate permission, or does it mean Edit includes Download? Can View users download?

**Impact:**
Incorrect permission model implementation. Users may get more or less access than intended.

**Recommendation:**
Clarify the permission matrix: what can View/Edit/Download users each do? Is Download additive to View, or a standalone permission?

**Related Requirements:** FR-002, BR-002
**Clarification Generated:** CLR-002

---

### GAP-003: File Size and Upload Limits
**Category:** Missing Requirement
**Severity:** High
**Severity Score:** 7
**Source Page:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)

**Issue:**
No maximum file size per upload, no maximum total dossier size, and no maximum number of documents per dossier is specified. Bulk upload and ZIP handling further complicate limits.

**Impact:**
Risk of system abuse, storage exhaustion, or conversion timeouts with very large files. No basis for infrastructure sizing.

**Recommendation:**
Define: max file size per upload (e.g., 50MB), max dossier size (e.g., 500MB), max documents per dossier, max ZIP extraction depth.

**Related Requirements:** FR-003, NFR-005
**Clarification Generated:** CLR-003

---

### GAP-004: Backend Architecture Not Decided
**Category:** Missing Requirement
**Severity:** Critical
**Severity Score:** 10
**Status:** ✅ Resolved (2026-04-21)
**Source Page:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)

**Issue:**
The current prototype is a client-only mockup with no backend. The detected stack shows "Backend: None" and "Database: None". A real application needs an API layer, document storage, and processing pipeline.

**Resolution:**
Node.js + Express 5 (TypeScript) selected as backend technology. Full-stack TypeScript with shared types. Express 5 already validated in spike-doc-conversion. All Azure SDKs are npm-native. Vercel AI SDK is JavaScript-only. Deploy on Azure App Service (Linux) or Azure Container Apps.

**Related Requirements:** FR-007 (PPTX), FR-023 (AI), FR-003 (storage), NFR-001 (auth)
**Clarification Generated:** CLR-004 (✅ Resolved)

---

### GAP-005: Database Technology Not Selected
**Category:** Missing Requirement
**Severity:** Critical
**Severity Score:** 9
**Status:** ✅ Resolved (2026-04-21)
**Source Page:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)

**Issue:**
No database technology is selected. The prototype uses GitHub Spark's ephemeral KV store. Production needs a proper database for dossiers, documents, annotations, user data, AI conversations.

**Resolution:**
Azure SQL Database (MSSQL) selected. Team has existing MS SQL expertise and it aligns with Azure-first stack. Use `mssql` v12.3.1 for Node.js. JSON columns for semi-structured data. AI vector embeddings stored in Azure AI Search (separate managed service). Hybrid architecture: relational DB for metadata + vector search service for AI.

**Related Requirements:** NFR-008, FR-003
**Clarification Generated:** CLR-005 (✅ Resolved)

---

### GAP-006: Notebook Feature Scope Unclear
**Category:** Ambiguous
**Severity:** High
**Severity Score:** 7
**Source Page:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)

**Issue:**
The "Notebook" concept appears in both Display/Navigation (6.4) and Document Download (2.2). It includes "one-click capture of AI chat conversations, manual user notes, and screenshots." The design prototype does not implement this feature. The exact UX for capturing screenshots, organizing notes, and the Notebook format is undefined.

**Impact:**
Cannot scope or estimate Notebook feature. Risk of misaligned expectations between stakeholders and implementation.

**Recommendation:**
Define: Is the Notebook a separate view? What is the capture mechanism for screenshots? What format is the exported Notebook (PDF, HTML, DOCX)?

**Related Requirements:** FR-016, FR-004
**Clarification Generated:** CLR-006

---

### GAP-007: AI/RAG Architecture Not Specified
**Category:** Missing Requirement
**Severity:** High
**Severity Score:** 8
**Source Page:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)

**Issue:**
The Confluence source describes AI chat, tag-based retrieval, web search, and multi-agent functionality, but no AI architecture is defined. Questions: Which LLM provider? How are documents embedded/indexed? What retrieval strategy (RAG with vector store, full document in context, hybrid)? What about token limits?

**Impact:**
Cannot implement AI features. Architectural decisions affect cost, performance, and accuracy of AI responses.

**Recommendation:**
Define AI stack: LLM provider (Azure OpenAI recommended for NUS), embedding model, vector store (Azure AI Search), retrieval strategy, token budget per query.

**Related Requirements:** FR-023, FR-024, FR-010, NFR-004
**Clarification Generated:** CLR-007

---

### GAP-008: Stamp Annotation Default Set
**Category:** Incomplete
**Severity:** Medium
**Severity Score:** 5
**Source Page:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)

**Issue:**
The Confluence source mentions "Default set plus customised to individual users" for stamps, but does not define what the default stamp set contains. No stamp images or descriptions are provided.

**Impact:**
Cannot implement stamp feature without knowing what stamps to include. Design work needed for stamp assets.

**Recommendation:**
Get the list of default stamps from ORMC (e.g., "Reviewed", "Approved", "Action Required", "Non-Conformance", NUS logo stamp). Define image format and size.

**Related Requirements:** FR-019, BR-018
**Clarification Generated:** CLR-008

---

### GAP-009: Concurrent Editing Behavior
**Category:** Missing Requirement
**Severity:** Medium
**Severity Score:** 6
**Source Page:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)

**Issue:**
Dossiers can be shared with Edit permission. The PRD mentions "Timestamp-based conflict resolution if multiple annotations created" but no detailed concurrency model is defined. What happens if two users annotate the same document simultaneously?

**Impact:**
Risk of data conflicts, lost annotations, or inconsistent state in shared dossiers.

**Recommendation:**
Define concurrency model: last-write-wins, merge strategy, or real-time collaboration (like Google Docs). For MVP, timestamp-based last-write-wins with conflict notification may suffice.

**Related Requirements:** FR-002, FR-017, NFR-008
**Clarification Generated:** CLR-009

---

### GAP-010: EHS360 Integration Scope
**Category:** Ambiguous
**Severity:** Medium
**Severity Score:** 5
**Source Page:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)

**Issue:**
The Confluence source lists "EHS360" as a dependency and states "users download source documents from EHS360 before uploading." Is EHS360 integration limited to manual download → upload, or should there be API-level integration for pulling documents directly?

**Impact:**
API integration would add scope, dependencies, and timeline. Manual workflow is simpler but more error-prone.

**Recommendation:**
Confirm with ORMC: is manual download-upload acceptable for v1, with potential API integration in a future phase?

**Related Requirements:** FR-033, BR-013
**Clarification Generated:** CLR-010

---

### GAP-011: Error Handling for Large Files
**Category:** Missing Requirement
**Severity:** Medium
**Severity Score:** 5
**Source Page:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)

**Issue:**
No defined behavior for: conversion failures, files exceeding size limits, unsupported file formats, corrupt files, or timeout during processing.

**Impact:**
Users may encounter silent failures or confusing error states during document upload and conversion.

**Recommendation:**
Define error handling UX: informative error messages, retry options, skip-and-continue for batch uploads, maximum retry count.

**Related Requirements:** FR-003, FR-007, NFR-002
**Clarification Generated:** None (can use default error handling patterns)

---

### GAP-012: DOCX Conversion Text Selectability
**Category:** Ambiguous
**Severity:** Medium
**Severity Score:** 5
**Source Page:** [Discovery: AI Document Audit — Spike](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)

**Issue:**
The document conversion spike confirmed that DOCX→PDF via mammoth + html2canvas produces image-based PDFs (text not selectable). FR-013 specifies that PDF text should be selectable and searchable. This is a conflict for converted DOCX files.

**Impact:**
Users cannot select text in converted DOCX files for annotation or search. DOCX content would not be searchable via keyword search.

**Recommendation:**
Accept image-based for MVP (content accuracy > text selection), or use server-side LibreOffice for text-selectable DOCX→PDF. Document trade-off for stakeholder decision.

**Related Requirements:** FR-007, FR-013, FR-020
**Clarification Generated:** CLR-011

---

### GAP-013: User Management and Roles
**Category:** Missing Requirement
**Severity:** High
**Severity Score:** 7
**Source Page:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)

**Issue:**
The System Administrator persona is marked as "[Assumed]". No RBAC model is defined beyond owner/shared permissions. Who has admin access? Is it a separate role or a superuser flag? Can admins see all dossiers?

**Impact:**
Cannot implement admin features without knowing who is an admin and what they can access. Security model incomplete.

**Recommendation:**
Define roles: Regular User (PI/Staff), System Administrator. Define admin capabilities and whether admins have access to all dossiers or only administration settings.

**Related Requirements:** FR-029, FR-030, NFR-001
**Clarification Generated:** CLR-012

---

### GAP-014: Audit Logging Requirements
**Category:** Missing Requirement
**Severity:** Medium
**Severity Score:** 5
**Source Page:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)

**Issue:**
Compliance workflows typically require audit trails (who did what, when). No audit logging requirements are specified for document access, annotation changes, AI queries, or export actions.

**Impact:**
May not meet compliance requirements. Difficult to investigate data access issues without audit logs.

**Recommendation:**
Define audit logging scope: user authentication events, document access, annotation CRUD, export events, admin actions. Consider NUS IT Logging guidelines.

**Related Requirements:** NFR-001, NFR-013
**Clarification Generated:** CLR-013

---

### GAP-015: Data Retention and Purge Policy
**Category:** Missing Requirement
**Severity:** Medium
**Severity Score:** 5
**Source Page:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)

**Issue:**
No data retention policy defined. How long are dossiers kept? Can they be archived? Is there a purge process? What happens when a PI leaves NUS?

**Impact:**
Uncontrolled data growth. Potential PDPA compliance issues. Orphaned dossiers when users leave.

**Recommendation:**
Define retention policy: default retention period, archive mechanism, purge process, data ownership on user departure.

**Related Requirements:** FR-003, NFR-008
**Clarification Generated:** CLR-014

---

### GAP-016: Mobile/Offline Support
**Category:** Incomplete
**Severity:** Low
**Severity Score:** 3
**Source Page:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)

**Issue:**
The Confluence source states "Nothing explicitly excluded at this stage" for out of scope. Field audits may benefit from offline document viewing, but this is not addressed.

**Impact:**
Low — primarily a future enhancement question. Core workflow is online-first.

**Recommendation:**
Confirm: online-only for v1 is acceptable. Consider offline viewing as a future enhancement.

**Related Requirements:** NFR-006
**Clarification Generated:** None

---

### GAP-017: Hosting and Deployment Target
**Category:** Missing Requirement
**Severity:** High
**Severity Score:** 8
**Source Page:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)

**Issue:**
No hosting platform decision has been made. Options include Azure (NUS has Azure subsidies), NUS on-premise infrastructure, or hybrid. This affects architecture, security posture, cost, and compliance.

**Impact:**
Cannot design infrastructure, CI/CD pipeline, or estimate hosting costs. Affects NFR decisions (availability, security, data residency).

**Recommendation:**
Confirm hosting target with NUS ITS. Azure is likely given NUS's existing Azure subscriptions. Define resource group, subscription, and region (Southeast Asia).

**Related Requirements:** NFR-012, NFR-013, GAP-004
**Clarification Generated:** CLR-015

---

### GAP-018: Legacy .doc Format Support
**Category:** Incomplete
**Severity:** Low
**Severity Score:** 3
**Source Page:** [Discovery: AI Document Audit — Spike](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)

**Issue:**
The mammoth library only supports .docx (Office Open XML). Legacy .doc (binary) format is not supported client-side and requires LibreOffice.

**Impact:**
Low — most modern documents are .docx. Legacy .doc files from older EHS360 exports may fail conversion.

**Recommendation:**
Accept .docx-only for v1 with graceful error message for .doc files. Add .doc support via server-side LibreOffice in a future phase if needed.

**Related Requirements:** FR-007
**Clarification Generated:** None
