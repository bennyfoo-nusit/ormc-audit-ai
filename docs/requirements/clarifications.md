# Clarifications — ORMC AI Document Audit

**Generated:** 2026-04-21
**Total:** 15 | **Open:** 12 | **Resolved:** 3

---

### CLR-001: NUS Authentication Provider
**Related Requirement:** FR-001, GAP-001
**Priority:** P0 Critical
**Status:** ✅ Resolved
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)

**Context:**
The discovery document assumes NUS SSO integration but does not confirm which identity provider or protocol. This is a critical architectural decision that blocks all user-facing features.

**Question:**
Which NUS identity provider should be used for authentication? Specifically: (a) NUS CAS/SSO, (b) Azure AD with NUS tenant, or (c) NUS ADFS? And which protocol: SAML 2.0 or OIDC?

**Options:**
- Option A: NUS CAS/SSO (SAML 2.0) — matches existing NUS applications
- Option B: Azure AD (OIDC) — modern protocol, integrates well with Azure hosting
- Option C: NUS ADFS — federated identity

**Assign To:** Tech Lead / NUS ITS
**Answer:** **Option B — Azure Entra ID (formerly Azure AD) using OIDC.** Use `@azure/msal-react` v5.3.0 for browser-based authentication with PKCE flow, and `@azure/msal-node` v5.1.3 for server-side token validation. Requires NUS Azure Entra ID tenant configuration and app registration.
**Answered By:** Stakeholder
**Answered Date:** 2026-04-21
**Impact on Requirement:** FR-001 updated to specify Azure Entra ID (OIDC). NFR-001 updated to reference Azure Entra ID. GAP-001 resolved.

---

### CLR-002: Sharing Permission Matrix
**Related Requirement:** FR-002, GAP-002
**Priority:** P1 High
**Status:** Open
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)

**Context:**
Confluence lists three permission levels (View, Edit, Download) but the design only implements View and Edit. The relationship between these permissions needs clarification.

**Question:**
What is the complete permission matrix? Specifically: (a) Can View users download? (b) Is Download a separate permission or inherent to Edit? (c) Do all permissions include viewing?

**Options:**
- Option A: Two levels — View (read-only) and Edit (read+write+download)
- Option B: Three levels — View (read-only), Edit (read+write), Download (read+export)
- Option C: Additive — View ⊂ Download ⊂ Edit

**Assign To:** Product Owner (ORMC)
**Answer:**
**Answered By:**
**Answered Date:**
**Impact on Requirement:**

---

### CLR-003: File Upload Limits and Constraints
**Related Requirement:** FR-003, GAP-003
**Priority:** P1 High
**Status:** Open
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)

**Context:**
No file size limits or document count limits are specified. These are needed for infrastructure sizing and to prevent abuse.

**Question:**
What are acceptable limits for: (a) Maximum file size per document upload? (b) Maximum total size per dossier? (c) Maximum number of documents per dossier? (d) Maximum ZIP file extraction depth?

**Assign To:** Product Owner (ORMC)
**Answer:**
**Answered By:**
**Answered Date:**
**Impact on Requirement:**

---

### CLR-004: Backend Technology Decision
**Related Requirement:** FR-007, GAP-004
**Priority:** P0 Critical
**Status:** ✅ Resolved
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)

**Context:**
The current prototype is a client-only mockup. A backend is required for authentication, document storage, PPTX conversion, AI integration, and multi-user data persistence.

**Question:**
Which backend technology should be used? Is there a preferred NUS standard or existing framework?

**Options:**
- Option A: Node.js + Express (aligns with React/TypeScript frontend)
- Option B: .NET / C# (common in NUS enterprise applications)
- Option C: Spring Boot / Java (enterprise-grade, well-supported)
- Option D: Python FastAPI (strong AI/ML ecosystem)

**Assign To:** Tech Lead / Architect
**Answer:** **Option A — Node.js + Express 5 (TypeScript).** Full-stack TypeScript eliminates language boundaries. Express 5 server already validated in spike-doc-conversion (LibreOffice, multer, CORS). All 8 Azure production SDKs (@azure/msal-node, @ai-sdk/azure, @azure/search-documents, @azure/storage-blob, @azure/identity, pdf-lib, mammoth, libreoffice-convert) are npm-native with TypeScript types. Vercel AI SDK (@ai-sdk/azure) is JavaScript-only — no equivalent in .NET/Java/Python. Shared types and utilities between frontend and backend. Deploy on Azure App Service (Linux) or Azure Container Apps with custom Docker image for LibreOffice.
**Answered By:** Stakeholder (based on technical feasibility analysis)
**Answered Date:** 2026-04-21
**Impact on Requirement:** GAP-004 resolved. ADR-001 updated. Backend architecture: Node.js + Express 5 + TypeScript. Hosting: Azure App Service or Container Apps.

---

### CLR-005: Database Technology Decision
**Related Requirement:** NFR-008, GAP-005
**Priority:** P0 Critical
**Status:** ✅ Resolved
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)

**Context:**
No database technology has been selected. The data model includes structured data (users, dossiers, permissions), semi-structured data (annotations, tags), and potentially vector embeddings for AI.

**Question:**
Which database technology should be used? Should document metadata and AI embeddings use separate stores?

**Options:**
- Option A: PostgreSQL (relational, mature, supports JSON columns)
- Option B: Azure Cosmos DB (NoSQL, scalable, multi-model)
- Option C: MongoDB (NoSQL, document-oriented)
- Option D: PostgreSQL + Azure AI Search (hybrid — relational for metadata, vector store for AI)

**Assign To:** Tech Lead / Architect
**Answer:** **Azure SQL Database (MSSQL).** Team has existing MS SQL expertise, and Azure SQL aligns with the Azure-first stack. Use `mssql` v12.3.1 (MIT, wraps `tedious` v19.2.1 TDS driver) for Node.js connectivity. Azure SQL supports JSON columns (nvarchar with JSON functions) for semi-structured data like annotations and tags. AI vector embeddings will be stored separately in Azure AI Search (not in the relational database). ORM option: Prisma (`@prisma/client` v7.7.0, Apache-2.0) with SQL Server connector, or TypeORM (v0.3.28, MIT) — both support Azure SQL. Azure Entra ID authentication supported via `@azure/identity` for passwordless connections.
**Answered By:** Stakeholder
**Answered Date:** 2026-04-21
**Impact on Requirement:** GAP-005 resolved. ADR-001 updated. Database: Azure SQL Database. Vector store: Azure AI Search (separate). Hybrid architecture: relational for metadata, managed vector search for AI.

---

### CLR-006: Notebook Feature Specification
**Related Requirement:** FR-016, GAP-006
**Priority:** P2 Medium
**Status:** Open
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)

**Context:**
The "Notebook" is referenced as a feature for capturing AI conversations, user notes, and screenshots. The exact UX, format, and workflow are not defined.

**Question:**
(a) Is the Notebook a separate view/panel or an export-only feature? (b) How are screenshots captured — browser screenshot API, manual upload, or region selection? (c) What is the export format — PDF, HTML, DOCX, or all? (d) Can Notebook content be edited after capture?

**Assign To:** Product Owner (ORMC)
**Answer:**
**Answered By:**
**Answered Date:**
**Impact on Requirement:**

---

### CLR-007: AI/RAG Architecture
**Related Requirement:** FR-023, GAP-007
**Priority:** P1 High
**Status:** Open
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)

**Context:**
AI chat, tag-based retrieval, web search, and multi-agent functionality are core features. No AI architecture is defined covering LLM provider, embedding strategy, retrieval method, or token budgets.

**Question:**
(a) Which LLM provider — Azure OpenAI (recommended for NUS) or another? (b) What retrieval strategy — RAG with vector store, full-document-in-context, or hybrid? (c) What embedding model for document indexing? (d) What is the token budget per query?

**Options:**
- Option A: Azure OpenAI + Azure AI Search (RAG) — enterprise, data residency
- Option B: OpenAI API + Pinecone — simpler setup, external data
- Option C: Self-hosted LLM + Elasticsearch — full control, higher ops burden

**Assign To:** Tech Lead / Architect
**Answer:**
**Answered By:**
**Answered Date:**
**Impact on Requirement:**

---

### CLR-008: Default Stamp Set
**Related Requirement:** FR-019, GAP-008
**Priority:** P2 Medium
**Status:** Open
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)

**Context:**
The stamp annotation feature requires a default stamp library. No stamp definitions are provided.

**Question:**
What stamps should be included in the default set? Examples might include: "Reviewed", "Approved", "Action Required", "Non-Conformance", "Satisfactory", NUS logo stamp.

**Assign To:** Product Owner (ORMC)
**Answer:**
**Answered By:**
**Answered Date:**
**Impact on Requirement:**

---

### CLR-009: Concurrent Edit Strategy
**Related Requirement:** FR-002, GAP-009
**Priority:** P2 Medium
**Status:** Open
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)

**Context:**
Dossiers can be shared with Edit permission. Multiple users may annotate the same document simultaneously. No conflict resolution strategy is defined.

**Question:**
What is the expected behavior when two users edit the same dossier simultaneously? (a) Last-write-wins with notification, (b) Real-time collaboration (Google Docs style), (c) Exclusive locking (one editor at a time)?

**Options:**
- Option A: Last-write-wins + conflict notification (simple, MVP-friendly)
- Option B: Real-time collaboration (complex, best UX)
- Option C: Exclusive lock (simple but restrictive)

**Assign To:** Product Owner (ORMC) / Tech Lead
**Answer:**
**Answered By:**
**Answered Date:**
**Impact on Requirement:**

---

### CLR-010: EHS360 Integration Model
**Related Requirement:** FR-033, GAP-010
**Priority:** P2 Medium
**Status:** Open
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)

**Context:**
Current workflow has users manually downloading documents from EHS360, then uploading to this system. An API integration could automate this but adds scope.

**Question:**
Is manual download → upload from EHS360 acceptable for v1? Should API integration with EHS360 be planned for a future phase?

**Options:**
- Option A: Manual only for v1 (simpler, faster delivery)
- Option B: API integration in v1 (adds scope but better UX)
- Option C: Manual for v1, API integration as v1.1 enhancement

**Assign To:** Product Owner (ORMC)
**Answer:**
**Answered By:**
**Answered Date:**
**Impact on Requirement:**

---

### CLR-011: DOCX Conversion Fidelity
**Related Requirement:** FR-007, GAP-012
**Priority:** P2 Medium
**Status:** Open
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)

**Context:**
Client-side DOCX→PDF conversion (mammoth + html2canvas) produces image-based PDFs where text is not selectable. Server-side LibreOffice produces text-selectable PDFs but requires additional infrastructure.

**Question:**
Is image-based (non-selectable text) DOCX→PDF conversion acceptable for v1? Or is text selectability a hard requirement for all converted documents?

**Options:**
- Option A: Accept image-based for v1 (faster delivery, client-side only)
- Option B: Require text-selectable (need server-side LibreOffice)
- Option C: Image-based for v1, text-selectable as v1.1 upgrade

**Assign To:** Product Owner (ORMC)
**Answer:**
**Answered By:**
**Answered Date:**
**Impact on Requirement:**

---

### CLR-012: Admin Role Definition
**Related Requirement:** FR-029, GAP-013
**Priority:** P1 High
**Status:** Open
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)

**Context:**
The System Administrator persona is marked "[Assumed]". No RBAC model exists beyond owner/shared permissions.

**Question:**
(a) Who are the system administrators — ORMC staff, NUS IT admins, or designated PIs? (b) What can admins do beyond managing agents and tagging prompts — can they see all dossiers? (c) Is admin a separate login role or a flag on regular user accounts?

**Assign To:** Product Owner (ORMC)
**Answer:**
**Answered By:**
**Answered Date:**
**Impact on Requirement:**

---

### CLR-013: Audit Logging Requirements
**Related Requirement:** NFR-001, GAP-014
**Priority:** P2 Medium
**Status:** Open
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)

**Context:**
Compliance workflows typically require audit trails. No logging requirements are specified.

**Question:**
Is audit logging required for this application? If yes, what events should be logged: authentication, document access, annotation changes, AI queries, export actions, admin changes?

**Assign To:** Product Owner (ORMC) / Compliance Team
**Answer:**
**Answered By:**
**Answered Date:**
**Impact on Requirement:**

---

### CLR-014: Data Retention Policy
**Related Requirement:** NFR-008, GAP-015
**Priority:** P2 Medium
**Status:** Open
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)

**Context:**
No data retention or archival policy is defined. Audit dossiers may have compliance-driven retention requirements.

**Question:**
(a) How long should completed dossiers be retained? (b) Is there an archive mechanism needed? (c) What happens to dossiers when a PI leaves NUS? (d) Is there a PDPA consideration for data stored?

**Assign To:** Product Owner (ORMC) / Compliance Team
**Answer:**
**Answered By:**
**Answered Date:**
**Impact on Requirement:**

---

### CLR-015: Hosting and Deployment Target
**Related Requirement:** NFR-012, GAP-017
**Priority:** P1 High
**Status:** Open
**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)

**Context:**
No hosting platform has been decided. This affects architecture, security, cost estimation, and CI/CD pipeline design.

**Question:**
Where will this application be hosted? (a) Azure (NUS has existing subscriptions), (b) NUS on-premise data center, (c) Hybrid (frontend on Azure, backend on-prem)?

**Options:**
- Option A: Azure (Southeast Asia region) — scalable, managed services, AI integration
- Option B: NUS on-premise — data control, existing infrastructure
- Option C: Hybrid — cloud frontend, on-prem backend for data sensitivity

**Assign To:** Tech Lead / NUS ITS
**Answer:**
**Answered By:**
**Answered Date:**
**Impact on Requirement:**
