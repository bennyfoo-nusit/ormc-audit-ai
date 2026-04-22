# Non-Functional Requirements — ORMC AI Document Audit

**Source:** [Discovery: AI Document Audit](https://nusinfoplace.atlassian.net/wiki/spaces/nusit/pages/1578860576/Discovery+AI+Document+Audit)
**Extracted:** 2026-04-21

---

### NFR-001: Authentication and Authorization
**Category:** Security
**Priority:** High
**Status:** 📋 Draft

**Requirement:**
The system must authenticate users via Azure Entra ID (OIDC with PKCE flow) using `@azure/msal-react` and enforce role-based data isolation so that users can only access their own dossiers unless explicitly shared.

**Measurement Criteria:**
- Metric: Authentication success rate and unauthorized access attempts
- Target: 100% of requests authenticated; 0 unauthorized data access
- Method: Security audit, penetration testing, access log review

**Rationale:** Data isolation is a core business rule. PIs handle sensitive audit documents that must not leak between users. Azure Entra ID confirmed as identity provider (CLR-001 resolved 2026-04-21).
**Dependencies:** FR-001, FR-002

---

### NFR-002: Performance — Document Conversion
**Category:** Performance
**Priority:** High
**Status:** 📋 Draft

**Requirement:**
Document conversion (DOCX, XLSX, Image → PDF) must complete within 30 seconds for files up to 10MB and must not block the user interface.

**Measurement Criteria:**
- Metric: Conversion time per file
- Target: ≤30s for files ≤10MB; UI remains responsive (no freeze >100ms)
- Method: Performance test with representative file sizes; UI responsiveness profiling

**Rationale:** PIs upload multiple documents in bulk. Slow or blocking conversion would degrade the user experience significantly.
**Dependencies:** FR-006, FR-007

---

### NFR-003: Performance — PDF Rendering
**Category:** Performance
**Priority:** High
**Status:** 📋 Draft

**Requirement:**
PDF pages must render within 2 seconds per page on standard hardware, including text layer and annotation overlays.

**Measurement Criteria:**
- Metric: Time to render a single PDF page with annotations
- Target: ≤2s on standard desktop browser (Chrome/Edge latest)
- Method: Lighthouse performance audit; manual timing on representative PDFs (50+ pages)

**Rationale:** Auditors navigate pages frequently. Slow rendering disrupts the review workflow.
**Dependencies:** FR-013

---

### NFR-004: Performance — AI Response Time
**Category:** Performance
**Priority:** Medium
**Status:** 📋 Draft

**Requirement:**
AI chat responses must begin streaming within 5 seconds of user query submission.

**Measurement Criteria:**
- Metric: Time to first token (TTFT)
- Target: ≤5s for document queries; ≤8s for web search queries
- Method: API response timing; user experience testing

**Rationale:** PIs expect conversational AI to be responsive. Long waits break audit flow.
**Dependencies:** FR-023

---

### NFR-005: Scalability — Document Size
**Category:** Scalability
**Priority:** High
**Status:** 📋 Draft

**Requirement:**
The system must handle dossiers containing up to 100 documents and compiled PDFs up to 500 pages without degradation.

**Measurement Criteria:**
- Metric: Document count per dossier; compiled PDF page count
- Target: 100 documents / 500 pages with <5s compile time
- Method: Load testing with representative document sets

**Rationale:** Large audits may involve extensive document sets. The system must handle real-world audit volumes.
**Dependencies:** FR-003, FR-011

---

### NFR-006: Usability — Responsive Layout
**Category:** Usability
**Priority:** Medium
**Status:** 📋 Draft

**Requirement:**
The application must be usable on desktop (1280px+) and tablet (768px+) screen sizes. Mobile (< 768px) should show a stacked layout.

**Measurement Criteria:**
- Metric: Layout correctness at target breakpoints
- Target: All features functional at 768px+; core features at 375px+
- Method: Responsive design testing across breakpoints

**Rationale:** PIs may use tablets during field audits. Core functionality must adapt to different screens.
**Dependencies:** FR-031

---

### NFR-007: Accessibility
**Category:** Usability
**Priority:** Medium
**Status:** 📋 Draft

**Requirement:**
The application must meet WCAG 2.1 Level AA compliance for all interactive elements.

**Measurement Criteria:**
- Metric: WCAG 2.1 AA conformance
- Target: 100% of interactive elements meet AA standards
- Method: Automated accessibility audit (axe-core); manual screen reader testing

**Rationale:** NUS applications should be accessible to all users. Radix UI primitives provide ARIA support as a baseline.
**Dependencies:** None

---

### NFR-008: Data Persistence and Reliability
**Category:** Reliability
**Priority:** High
**Status:** 📋 Draft

**Requirement:**
All user data (dossiers, documents, annotations, shapes, AI conversations) must be persisted reliably and survive session restarts.

**Measurement Criteria:**
- Metric: Data loss events
- Target: 0 data loss events per 10,000 operations
- Method: Integration testing with session restart scenarios; DB backup verification

**Rationale:** Audit findings are critical compliance artifacts. Data loss would require re-work and is unacceptable.
**Dependencies:** FR-003, FR-017, FR-023

---

### NFR-009: Browser Compatibility
**Category:** Compatibility
**Priority:** Medium
**Status:** 📋 Draft

**Requirement:**
The application must support the latest two major versions of Chrome, Edge, Firefox, and Safari.

**Measurement Criteria:**
- Metric: Cross-browser functional test pass rate
- Target: 100% core features pass on all supported browsers
- Method: Cross-browser testing suite

**Rationale:** NUS staff use various browsers. React 19 + Vite produce modern JS that requires recent browsers.
**Dependencies:** None

---

### NFR-010: NUS Corporate Identity Compliance
**Category:** Compliance
**Priority:** High
**Status:** 📋 Draft

**Requirement:**
The application must comply with NUS corporate identity guidelines including brand colors (NUS Blue #003D7C, NUS Orange #EF7C00), approved typography, and logo usage.

**Measurement Criteria:**
- Metric: Corporate identity compliance checklist
- Target: 100% compliance with NUS brand guidelines
- Method: Visual design review against NUS corporate identity guide

**Rationale:** All NUS applications must reflect NUS brand identity consistently per NUS corporate policy.
**Dependencies:** None

---

### NFR-011: Export Fidelity
**Category:** Reliability
**Priority:** High
**Status:** 📋 Draft

**Requirement:**
Exported PDFs must embed all annotations, shapes, stamps, and bookmarks accurately, matching the on-screen representation within 95% visual fidelity.

**Measurement Criteria:**
- Metric: Visual fidelity score (automated comparison)
- Target: ≥95% match between screen view and exported PDF
- Method: Automated screenshot comparison; manual spot-checking

**Rationale:** Audit exports are compliance deliverables. They must accurately represent audit findings as recorded on-screen.
**Dependencies:** FR-004, FR-017, FR-018, FR-019

---

### NFR-012: Availability
**Category:** Availability
**Priority:** Medium
**Status:** 📋 Draft

**Requirement:**
The system must maintain 99.5% uptime during NUS business hours (8:00–22:00 SGT, Monday–Saturday).

**Measurement Criteria:**
- Metric: Uptime percentage
- Target: ≥99.5% during business hours; planned maintenance outside business hours
- Method: Uptime monitoring; incident tracking

**Rationale:** PIs need reliable access during working hours for audit reviews.
**Dependencies:** None

---

### NFR-013: Document Storage Security
**Category:** Security
**Priority:** High
**Status:** 📋 Draft

**Requirement:**
All uploaded documents and generated artifacts must be encrypted at rest and in transit. Document access must enforce the sharing permission model.

**Measurement Criteria:**
- Metric: Encryption coverage; unauthorized access events
- Target: 100% of stored files encrypted (AES-256 at rest, TLS 1.2+ in transit); 0 permission bypass events
- Method: Security audit; encryption verification; penetration testing

**Rationale:** Audit documents may contain sensitive safety and compliance information. NUS data protection policies require encryption.
**Dependencies:** FR-002, FR-003

---

### NFR-014: AI Content Safety
**Category:** Security
**Priority:** Medium
**Status:** 📋 Draft

**Requirement:**
AI responses must not leak content from other users' documents. AI context must be scoped strictly to the authenticated user's attached documents.

**Measurement Criteria:**
- Metric: Cross-user data leakage events
- Target: 0 cross-user data leakage events
- Method: Security testing with multi-user scenarios; AI context isolation verification

**Rationale:** Human-in-the-loop design requires AI to stay within scope. Cross-user leakage would violate data isolation rules.
**Dependencies:** FR-023, NFR-001

---

### NFR-015: Maintainability
**Category:** Maintainability
**Priority:** Medium
**Status:** 📋 Draft

**Requirement:**
The codebase must maintain >80% unit test coverage for core business logic and use TypeScript strict mode.

**Measurement Criteria:**
- Metric: Test coverage percentage; TypeScript strict mode enabled
- Target: >80% line coverage on core modules; tsconfig strict: true
- Method: Coverage reports (Jest/Vitest); TypeScript compiler configuration check

**Rationale:** Long-term maintainability requires thorough testing and type safety. React 19 + TypeScript stack supports this goal.
**Dependencies:** None
