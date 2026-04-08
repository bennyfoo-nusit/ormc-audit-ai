---
name: scrum-master-templates
description: "Output templates, field mappings, and reference examples for the scrum-master agent. Use when creating user stories, tasks, GitHub Issues, or grooming stories in Azure DevOps."
---

# Product Owner Output Templates

Use the appropriate template when generating work items. Replace `{placeholders}` with actual values.

## User Story Description Template

**Description (System.Description)** — Rich HTML with all of these sections:
```html
<h3>User Story</h3>
<p>As a {persona from /docs/requirements/personas.md},
I want {capability from FR},
So that {business value / outcome}.</p>

<h3>Context & Background</h3>
<p>{Why this story exists. Business justification. What problem it solves.
Reference to current-state pain points or Phase 1 limitations.}</p>

<h3>Related Requirements</h3>
<table>
  <tr><th>ID</th><th>Name</th><th>Priority</th><th>Status</th></tr>
  <tr><td>FR-001</td><td>Requirement Name</td><td>High</td><td>Draft</td></tr>
</table>

<h3>Business Rules</h3>
<ul>
  <li>BR-001: {Rule description from business-rules.md}</li>
</ul>

<h3>Open Clarifications</h3>
<ul>
  <li>CLR-001: {Question} — Status: {Open/Resolved} — Assumption: {if open}</li>
</ul>

<h3>Assumptions & Constraints</h3>
<ul>
  <li>{Assumptions made due to open clarifications}</li>
  <li>{Technical or organizational constraints}</li>
</ul>

<h3>Personas Impacted</h3>
<ul>
  <li>{Persona name} — {How they interact with this feature}</li>
</ul>

<h3>UX/UI Considerations</h3>
<ul>
  <li>{Key UI elements, wireframe references, interaction patterns}</li>
  <li>{Accessibility requirements (WCAG 2.1 AA)}</li>
</ul>

<h3>Technical Architecture Notes</h3>
<ul>
  <li>Frontend: {React components, state management approach}</li>
  <li>Backend: {API endpoints, services, middleware}</li>
  <li>Database: {Tables, relationships, migrations}</li>
  <li>Infrastructure: {Azure services required}</li>
</ul>

<h3>Security Considerations</h3>
<ul>
  <li>{OWASP threats relevant to this story}</li>
  <li>{Data classification: Public/Internal/Confidential/Restricted}</li>
  <li>{Auth/AuthZ requirements}</li>
</ul>

<h3>Performance Requirements</h3>
<ul>
  <li>{Response time targets from NFRs}</li>
  <li>{Throughput/concurrency requirements}</li>
</ul>

<h3>Risk Assessment</h3>
<table>
  <tr><th>Risk</th><th>Impact</th><th>Probability</th><th>Mitigation</th></tr>
  <tr><td>{Risk}</td><td>High/Med/Low</td><td>High/Med/Low</td><td>{Mitigation strategy}</td></tr>
</table>

<h3>Dependencies</h3>
<ul>
  <li>Blocked by: {Story/Task IDs that must complete first}</li>
  <li>Blocks: {Story/Task IDs waiting on this}</li>
  <li>External: {External system/team dependencies}</li>
</ul>

<h3>Business Value</h3>
<p>Score: {1-100} | Priority: {MoSCoW: Must/Should/Could/Won't}</p>

<h3>Definition of Done</h3>
<ul>
  <li>Code complete and peer-reviewed (PR approved)</li>
  <li>Unit tests written with ≥80% coverage</li>
  <li>Integration tests pass</li>
  <li>No critical/high SonarQube issues</li>
  <li>API documentation updated (OpenAPI spec)</li>
  <li>Security review passed (if applicable)</li>
  <li>Accessibility verified (WCAG 2.1 AA)</li>
  <li>Deployed to staging and smoke tested</li>
  <li>Product Owner demo and acceptance</li>
</ul>
```

## Acceptance Criteria Template

**Acceptance Criteria (Microsoft.VSTS.Common.AcceptanceCriteria)** — SEPARATE field, Given/When/Then format:
```html
<h4>AC-1: {Scenario Name}</h4>
<p><b>Given</b> {precondition/context},<br/>
<b>When</b> {action/trigger},<br/>
<b>Then</b> {expected outcome}.</p>

<h4>AC-2: {Scenario Name}</h4>
<p><b>Given</b> {precondition},<br/>
<b>When</b> {action},<br/>
<b>Then</b> {outcome}.</p>

<h4>AC-N: Error/Edge Case Scenario</h4>
<p><b>Given</b> {error condition},<br/>
<b>When</b> {user attempts action},<br/>
<b>Then</b> {graceful handling with user-friendly message}.</p>

<h4>Non-Functional Acceptance Criteria</h4>
<ul>
  <li>Page load time &lt; {X}s (NFR reference)</li>
  <li>API response time &lt; {X}ms under {Y} concurrent users</li>
  <li>{Security requirement from NFRs}</li>
</ul>
```

## Azure DevOps Field Mapping

| Field | API Path | Notes |
|-------|----------|-------|
| `System.Title` | Title | Story or task title |
| `System.Description` | Description | Structured HTML with ALL sections from Description template |
| `Microsoft.VSTS.Common.AcceptanceCriteria` | Acceptance Criteria | **SEPARATE field!** Given/When/Then format. Never inside Description! |
| `Microsoft.VSTS.Scheduling.StoryPoints` | Story Points | Fibonacci: 1, 2, 3, 5, 8, 13, 21 |
| `Microsoft.VSTS.Common.Priority` | Priority | 1=Critical, 2=High, 3=Medium, 4=Low |
| `System.IterationPath` | Sprint assignment | e.g. `project\Sprint 1` |
| `System.Tags` | Tags | Comma-separated |
| `Microsoft.VSTS.Scheduling.OriginalEstimate` | Original Estimate | Hours (tasks only) |
| `Microsoft.VSTS.Common.Activity` | Activity | Development, Testing, Documentation, Design (tasks only) |

### API Patch Example (JSON Patch for work item creation)
```json
[
  {"op": "add", "path": "/fields/System.Title", "value": "F1: Authentication & SSO"},
  {"op": "add", "path": "/fields/System.Description", "value": "<h3>User Story</h3><p>As a university user...</p><h3>Context</h3>..."},
  {"op": "add", "path": "/fields/Microsoft.VSTS.Common.AcceptanceCriteria", "value": "<h4>AC-1: Unified Login</h4><p><b>Given</b>...<b>When</b>...<b>Then</b>...</p>..."},
  {"op": "add", "path": "/fields/Microsoft.VSTS.Scheduling.StoryPoints", "value": 22},
  {"op": "add", "path": "/fields/Microsoft.VSTS.Common.Priority", "value": 1},
  {"op": "add", "path": "/fields/System.IterationPath", "value": "project\\Sprint 1"},
  {"op": "add", "path": "/fields/System.Tags", "value": "authentication; sso; mfa; security; must-have"}
]
```

## Task Description Template

**Task Description (System.Description)** — Rich HTML with these sections:
```html
<h3>Summary</h3>
<p>{What this task accomplishes. One paragraph.}</p>

<h3>Technical Specification</h3>
<h4>API Endpoints (if applicable)</h4>
<table>
  <tr><th>Method</th><th>Path</th><th>Auth</th><th>Description</th></tr>
  <tr><td>POST</td><td>/api/resource</td><td>JWT + RBAC</td><td>Create resource</td></tr>
</table>

<h4>Request/Response Schema (if API task)</h4>
<pre>
// Request Body
{
  "field": "type — validation rules"
}
// Success Response (200/201)
{
  "id": "uuid",
  "field": "value"
}
// Error Response (4xx)
{
  "error": { "code": "ERROR_CODE", "message": "Human-readable message" }
}
</pre>

<h4>Database Changes (if applicable)</h4>
<ul>
  <li>Table: {table_name} — {CREATE/ALTER/INDEX}</li>
  <li>Migration file: {migration_name}</li>
</ul>

<h4>UI Components (if frontend task)</h4>
<ul>
  <li>Component: {ComponentName} — {description}</li>
  <li>State management: {local state / context / store}</li>
  <li>Routing: {route path}</li>
</ul>

<h3>Implementation Steps</h3>
<ol>
  <li>{Step 1 — specific action, not vague}</li>
  <li>{Step 2}</li>
  <li>{Step N}</li>
</ol>

<h3>Files to Create/Modify</h3>
<table>
  <tr><th>Action</th><th>File Path</th><th>Description</th></tr>
  <tr><td>Create</td><td>src/controllers/authController.ts</td><td>Auth controller with register/login</td></tr>
  <tr><td>Modify</td><td>src/routes/index.ts</td><td>Add auth routes</td></tr>
</table>

<h3>Security Checklist</h3>
<ul>
  <li>☐ Input validation (whitelist, length limits, type checks)</li>
  <li>☐ Output encoding (XSS prevention)</li>
  <li>☐ SQL injection prevention (parameterized queries)</li>
  <li>☐ Authentication check (JWT validation)</li>
  <li>☐ Authorization check (RBAC middleware)</li>
  <li>☐ Sensitive data handling (no PII in logs, mask in responses)</li>
  <li>☐ Rate limiting (if public-facing endpoint)</li>
</ul>

<h3>Testing Strategy</h3>
<table>
  <tr><th>Type</th><th>Coverage Target</th><th>Key Scenarios</th></tr>
  <tr><td>Unit</td><td>≥80%</td><td>{List key unit test scenarios}</td></tr>
  <tr><td>Integration</td><td>Happy + Error paths</td><td>{List integration scenarios}</td></tr>
  <tr><td>E2E</td><td>Critical path</td><td>{If applicable}</td></tr>
</table>

<h3>Dependencies</h3>
<ul>
  <li>Requires: {Task IDs / external systems}</li>
  <li>Blocks: {Task IDs waiting on this}</li>
</ul>

<h3>Edge Cases & Error Handling</h3>
<ul>
  <li>{Edge case 1} → {Expected behavior}</li>
  <li>{Edge case 2} → {Expected behavior}</li>
  <li>{Concurrent access scenario} → {Handling}</li>
</ul>

<h3>Definition of Done</h3>
<ul>
  <li>☐ Implementation complete</li>
  <li>☐ Unit tests pass (≥80% coverage)</li>
  <li>☐ No lint errors / warnings</li>
  <li>☐ PR created with description</li>
  <li>☐ Code review approved</li>
  <li>☐ CI pipeline green</li>
</ul>
```

### Task Fields
```
Title: {TASK-ID} - {Descriptive Task Name}
System.Description: {Full HTML from template above}
Microsoft.VSTS.Scheduling.OriginalEstimate: {hours}
Microsoft.VSTS.Common.Activity: {Development|Testing|Documentation|Design}
Microsoft.VSTS.Common.Priority: {1-4}
System.IterationPath: {sprint path}
System.Tags: {relevant tags}
Parent Link: {story work item ID}
```

## Refined Story Template (Story Grooming Output)

```markdown
# Story Refinement: {Work-Item-ID} - {Title}

> **Version:** v{number} | **Refined:** {YYYY-MM-DD} | **Original Story Points:** {n} | **Suggested Story Points:** {n}

## Original Story
| Field | Value |
|-------|-------|
| ID | {work-item-id} |
| Title | {title} |
| State | {state} |
| Priority | {priority} |
| Story Points | {story-points} |
| Iteration | {iteration-path} |
| Tags | {tags} |

### Description
{original description from Azure DevOps}

### Acceptance Criteria (Original)
{original acceptance criteria}

## Requirement Traceability
| Requirement ID | Description | Source Document | Coverage |
|---------------|-------------|-----------------|----------|
| FR-xxx | {description} | {file path or Confluence link} | Full / Partial / Gap |
| NFR-xxx | {description} | {file path or Confluence link} | Full / Partial / Gap |

## Impact Analysis

### Code Impact
| File / Module | Change Type | Description |
|--------------|-------------|-------------|
| {path/to/file} | Create / Modify / Delete | {what changes} |

### Dependencies
| Dependency | Type | Status | Impact |
|-----------|------|--------|--------|
| {work-item or system} | Blocking / Related / External | {status} | {description} |

### Risk Assessment
| Risk | Severity | Mitigation |
|------|----------|------------|
| {risk description} | High / Medium / Low | {mitigation approach} |

## Refined Story

### Description (Enhanced)
{refined description with technical context}

### Acceptance Criteria (Refined)
- [ ] {specific, testable criterion}
- [ ] {specific, testable criterion}
- [ ] ...

### Suggested Task Breakdown
| Task | Estimate | Activity | Files |
|------|----------|----------|-------|
| {task description} | {hours}h | Development / Testing / Documentation | {file paths} |

## Open Questions
| # | Question | Stakeholder | Priority |
|---|----------|-------------|----------|
| 1 | {question} | {who can answer} | High / Medium / Low |

## Change Log
| Version | Date | Changes |
|---------|------|---------|
| v{n} | {date} | {summary of refinements} |
```

## GitHub Issue Template (for Copilot Assignment)

```markdown
Title: {TASK-ID} - {Descriptive Task Name}

Labels: {comma-separated: tech-area, sprint, story-points}

## Summary
{What this task accomplishes. 2-3 sentences.}

**Azure DevOps Work Item:** [TASK-ID](https://dev.azure.com/{org}/{project}/_workitems/edit/{id})
**Parent Story:** {Story Title} (#{story-id})
**Sprint:** {Sprint name}
**Estimate:** {SP} SP / {hours} hours

---

## Implementation Checklist
- [ ] {Step 1 — specific action}
- [ ] {Step 2}
- [ ] ...

## Security Requirements
- [ ] {Security item 1}
- [ ] {Security item 2}
- [ ] ...

## Testing Requirements
- [ ] {Test 1}
- [ ] {Test 2}
- [ ] ...

## Files to Create/Modify

| Action | Path |
|--------|------|
| Create | `{file path}` |
| Modify | `{file path}` |

## Dependencies
- **Requires:** #{task-ids}
- **Blocks:** #{task-ids}
- **External:** {external dependencies}

## Edge Cases
- {Edge case} → {Expected behavior}

## Environment Variables Needed
```env
{VAR_NAME}=
```

/cc @copilot
```

## Full Examples

### Azure DevOps User Story Example: Authentication & SSO

```markdown
Title: User Authentication & SSO

## Description (System.Description field):
<h3>User Story</h3>
<p>As a <b>university user</b> (staff, student, or visitor),
I want to <b>securely authenticate via Microsoft Entra ID SSO with MFA</b>,
So that <b>I can access ProctorX with my NUS credentials without managing separate passwords</b>.</p>

<h3>Context & Background</h3>
<p>ProctorX Phase 2 replaces Phase 1's multi-URL access with a single unified login.
Authentication must use Microsoft Entra ID (formerly Azure AD) as mandated by NUS IT policy.
MFA is required for all staff accounts. The system must support 3 account types
(Staff, Student, Visitor) with different access levels. This is a prerequisite for
all other features — nothing works without auth.</p>

<h3>Related Requirements</h3>
<table>
  <tr><th>ID</th><th>Name</th><th>Priority</th><th>Status</th></tr>
  <tr><td>FR-001</td><td>Unified Login URL</td><td>High</td><td>Draft</td></tr>
  <tr><td>FR-002</td><td>SSO with Microsoft Entra ID</td><td>High</td><td>Draft</td></tr>
  <tr><td>FR-003</td><td>Multi-Factor Authentication</td><td>High</td><td>Draft</td></tr>
  <tr><td>NFR-001</td><td>Security (OWASP Top 10)</td><td>High</td><td>Draft</td></tr>
</table>

<h3>Business Rules</h3>
<ul>
  <li>BR-001: Only one login URL shall exist for all user types</li>
  <li>BR-002: Authentication protocol must be OIDC</li>
  <li>BR-003: Must support NUS Staff, Student, and Visitor account types</li>
  <li>BR-004: Session token expiry must follow university security policy</li>
  <li>BR-005: MFA must be enforced for all staff accounts</li>
</ul>

<h3>Open Clarifications</h3>
<ul>
  <li>CLR-003: What is the session timeout duration? — Assumption: 30 minutes</li>
  <li>CLR-004: Concurrent session policy? — Assumption: Single active session per user</li>
</ul>

<h3>Assumptions & Constraints</h3>
<ul>
  <li>Azure Entra ID tenant is pre-configured by NUS IT</li>
  <li>Symantec VIP and Microsoft Authenticator are the approved MFA methods</li>
  <li>Session timeout assumed 30 min until CLR-003 is resolved</li>
</ul>

<h3>Personas Impacted</h3>
<ul>
  <li><b>University Admin</b> — Full system access after auth</li>
  <li><b>Faculty Admin</b> — Faculty-scoped access after auth</li>
  <li><b>Examiner</b> — Assessment-scoped access after auth</li>
  <li><b>Proctor</b> — Monitoring access after auth</li>
  <li><b>Student</b> — Read-only exam access after auth</li>
</ul>

<h3>UX/UI Considerations</h3>
<ul>
  <li>Single "Sign in with NUS" button → Microsoft Entra redirect</li>
  <li>NUS branding on login page (logo, colors, typography)</li>
  <li>Loading spinner during SSO redirect</li>
  <li>Clear error messages for auth failures (expired account, MFA failure, etc.)</li>
  <li>Accessible: keyboard-navigable, screen-reader compatible</li>
</ul>

<h3>Technical Architecture Notes</h3>
<ul>
  <li>Frontend: Login page component, AuthContext provider, ProtectedRoute HOC</li>
  <li>Backend: /api/auth/* routes, passport-azure-ad strategy, JWT middleware</li>
  <li>Database: users table, sessions table, audit_logs for auth events</li>
  <li>Infrastructure: Azure Entra ID app registration, redirect URIs, certificate</li>
</ul>

<h3>Security Considerations</h3>
<ul>
  <li>OWASP A07:2021 — Authentication Failures: brute-force protection, account lockout</li>
  <li>OWASP A02:2021 — Cryptographic Failures: tokens over HTTPS only, secure cookie flags</li>
  <li>Data Classification: Credentials = Restricted (never stored/logged)</li>
  <li>JWT: signed with RS256, short-lived access (15min), refresh token (7d)</li>
  <li>CSRF protection on auth endpoints</li>
</ul>

<h3>Performance Requirements</h3>
<ul>
  <li>Login page load: &lt;2s (NFR-002)</li>
  <li>SSO redirect round-trip: &lt;3s (excluding Entra ID latency)</li>
  <li>Token validation: &lt;50ms per request</li>
</ul>

<h3>Risk Assessment</h3>
<table>
  <tr><th>Risk</th><th>Impact</th><th>Prob</th><th>Mitigation</th></tr>
  <tr><td>Entra ID tenant not ready</td><td>High</td><td>Med</td><td>Coordinate with NUS IT early; mock auth for dev</td></tr>
  <tr><td>MFA integration complexity</td><td>Med</td><td>Med</td><td>Use Entra conditional access policies (no custom MFA)</td></tr>
  <tr><td>Session timeout UX confusion</td><td>Low</td><td>High</td><td>Show countdown warning at 5min; silent token refresh</td></tr>
</table>

<h3>Dependencies</h3>
<ul>
  <li>Blocked by: Azure subscription provisioned (T-004), DB schema (T-002)</li>
  <li>Blocks: F2 (RBAC), F3 (Monitoring), all authenticated features</li>
  <li>External: NUS IT — Entra ID app registration</li>
</ul>

<h3>Business Value</h3>
<p>Score: 95 | Priority: Must Have | This is the single prerequisite for all features.</p>

<h3>Definition of Done</h3>
<ul>
  <li>☐ Code complete and PR approved</li>
  <li>☐ Unit tests ≥80% coverage on auth logic</li>
  <li>☐ Integration test: full SSO flow (mock Entra)</li>
  <li>☐ Security review: no credentials in logs, secure cookies, CSRF protection</li>
  <li>☐ Accessibility: login page WCAG 2.1 AA compliant</li>
  <li>☐ API docs updated (OpenAPI auth endpoints)</li>
  <li>☐ Deployed to staging, smoke tested</li>
  <li>☐ PO demo and sign-off</li>
</ul>

## Acceptance Criteria (Microsoft.VSTS.Common.AcceptanceCriteria field):
⚠️ This MUST be a SEPARATE API field, NOT inside Description!

<h4>AC-1: Unified Login Page</h4>
<p><b>Given</b> any user navigates to the ProctorX login URL,<br/>
<b>When</b> the page loads,<br/>
<b>Then</b> a single unified login page with NUS branding is displayed with a "Sign in with NUS" button.</p>

<h4>AC-2: SSO Authentication (Staff)</h4>
<p><b>Given</b> a user with a valid NUS Staff account clicks "Sign in with NUS",<br/>
<b>When</b> they complete Microsoft Entra ID authentication,<br/>
<b>Then</b> they are redirected back to ProctorX with a valid session and staff-level role assigned.</p>

<h4>AC-3: SSO Authentication (Student)</h4>
<p><b>Given</b> a user with a valid NUS Student account clicks "Sign in with NUS",<br/>
<b>When</b> they complete Microsoft Entra ID authentication,<br/>
<b>Then</b> they are redirected back to ProctorX with student-level access.</p>

<h4>AC-4: MFA Enforcement</h4>
<p><b>Given</b> a staff user has successfully authenticated via Entra ID,<br/>
<b>When</b> MFA is required by conditional access policy,<br/>
<b>Then</b> the user must complete MFA (Symantec VIP or Microsoft Authenticator) before session is established.</p>

<h4>AC-5: Session Management</h4>
<p><b>Given</b> a user has an active session,<br/>
<b>When</b> 30 minutes of inactivity pass,<br/>
<b>Then</b> the session expires and the user is redirected to the login page with a "Session expired" message.</p>

<h4>AC-6: Token Refresh</h4>
<p><b>Given</b> a user has an active session with an expiring access token,<br/>
<b>When</b> the token is within 5 minutes of expiry and the user is active,<br/>
<b>Then</b> the token is silently refreshed without interrupting the user.</p>

<h4>AC-7: Invalid Credentials</h4>
<p><b>Given</b> a user with an invalid or expired NUS account,<br/>
<b>When</b> they attempt to authenticate via Entra ID,<br/>
<b>Then</b> access is denied with a clear, user-friendly error message (no technical details leaked).</p>

<h4>AC-8: Concurrent Session Prevention</h4>
<p><b>Given</b> a user has an active session on Device A,<br/>
<b>When</b> they log in on Device B,<br/>
<b>Then</b> the session on Device A is invalidated and Device B becomes the active session.</p>

<h4>Non-Functional Acceptance Criteria</h4>
<ul>
  <li>Login page loads in &lt;2 seconds on 3G connection</li>
  <li>JWT validation middleware adds &lt;50ms to each request</li>
  <li>Auth endpoints pass OWASP ZAP scan with no High/Critical findings</li>
  <li>Login page scores ≥90 on Lighthouse accessibility audit</li>
</ul>

Story Points: 22
Priority: 1 (Critical)
Tags: authentication, sso, mfa, security, high-priority, must-have
```

### Azure DevOps Task Example: Entra ID OIDC Integration

```markdown
Title: T-009 - Integrate Microsoft Entra ID OIDC

## Description (System.Description field):
<h3>Summary</h3>
<p>Implement server-side OIDC authentication flow with Microsoft Entra ID using
passport-azure-ad. This includes app registration configuration, callback handling,
user profile extraction, JWT token issuance, and session establishment.</p>

<h3>Technical Specification</h3>

<h4>API Endpoints</h4>
<table>
  <tr><th>Method</th><th>Path</th><th>Auth</th><th>Description</th></tr>
  <tr><td>GET</td><td>/api/auth/login</td><td>None</td><td>Initiate OIDC flow → redirect to Entra</td></tr>
  <tr><td>POST</td><td>/api/auth/callback</td><td>None</td><td>OIDC callback → validate token → issue JWT</td></tr>
  <tr><td>POST</td><td>/api/auth/refresh</td><td>Refresh Token</td><td>Issue new access token</td></tr>
  <tr><td>POST</td><td>/api/auth/logout</td><td>JWT</td><td>Invalidate session → redirect to Entra logout</td></tr>
  <tr><td>GET</td><td>/api/auth/me</td><td>JWT</td><td>Return current user profile + role</td></tr>
</table>

<h4>Request/Response Schemas</h4>
<pre>
// POST /api/auth/callback (handled by passport)
// Success Response (200)
{
  "accessToken": "eyJhbG...",
  "refreshToken": "dGhpcy...",
  "expiresIn": 900,
  "user": {
    "id": "uuid",
    "email": "user@nus.edu.sg",
    "displayName": "John Doe",
    "accountType": "Staff|Student|Visitor",
    "roles": ["examiner"]
  }
}
// Error Response (401)
{
  "error": {
    "code": "AUTH_FAILED",
    "message": "Authentication failed. Please try again."
  }
}
</pre>

<h4>Database Changes</h4>
<ul>
  <li>Table: users — INSERT on first login (upsert by Entra OID)</li>
  <li>Table: sessions — INSERT on login, UPDATE on refresh, DELETE on logout</li>
  <li>Table: audit_logs — INSERT auth events (login, logout, failure)</li>
</ul>

<h3>Implementation Steps</h3>
<ol>
  <li>Install passport, passport-azure-ad, jsonwebtoken packages</li>
  <li>Create src/config/auth.ts with Entra ID configuration (tenant, clientId, redirectUri from env)</li>
  <li>Create src/strategies/entraId.ts with OIDCStrategy configuration</li>
  <li>Create src/controllers/authController.ts with login, callback, refresh, logout, me handlers</li>
  <li>Create src/services/tokenService.ts — JWT sign/verify with RS256, token rotation</li>
  <li>Create src/services/sessionService.ts — session CRUD, concurrent session invalidation</li>
  <li>Create src/middleware/authenticate.ts — JWT validation middleware for protected routes</li>
  <li>Add auth routes to src/routes/auth.ts and register in main router</li>
  <li>Add user upsert logic: find by Entra OID, create if not exists, update lastLogin</li>
  <li>Implement audit logging for all auth events</li>
  <li>Write unit tests for tokenService, sessionService</li>
  <li>Write integration test for complete auth flow (mock Entra responses)</li>
</ol>

<h3>Files to Create/Modify</h3>
<table>
  <tr><th>Action</th><th>File Path</th><th>Description</th></tr>
  <tr><td>Create</td><td>src/config/auth.ts</td><td>Entra ID OIDC config (env vars)</td></tr>
  <tr><td>Create</td><td>src/strategies/entraId.ts</td><td>Passport OIDC strategy</td></tr>
  <tr><td>Create</td><td>src/controllers/authController.ts</td><td>Auth route handlers</td></tr>
  <tr><td>Create</td><td>src/services/tokenService.ts</td><td>JWT sign/verify/refresh</td></tr>
  <tr><td>Create</td><td>src/services/sessionService.ts</td><td>Session management</td></tr>
  <tr><td>Create</td><td>src/middleware/authenticate.ts</td><td>JWT auth middleware</td></tr>
  <tr><td>Create</td><td>src/routes/auth.ts</td><td>Auth route definitions</td></tr>
  <tr><td>Modify</td><td>src/routes/index.ts</td><td>Register auth routes</td></tr>
  <tr><td>Modify</td><td>package.json</td><td>Add passport dependencies</td></tr>
  <tr><td>Create</td><td>tests/unit/tokenService.test.ts</td><td>Token service unit tests</td></tr>
  <tr><td>Create</td><td>tests/unit/sessionService.test.ts</td><td>Session service unit tests</td></tr>
  <tr><td>Create</td><td>tests/integration/auth.test.ts</td><td>Full auth flow integration test</td></tr>
  <tr><td>Create</td><td>tests/mocks/entraId.mock.ts</td><td>Mock Entra ID responses</td></tr>
</table>

<h3>Security Checklist</h3>
<ul>
  <li>☐ OIDC state parameter validated (CSRF protection)</li>
  <li>☐ JWT signed with RS256 (asymmetric), not HS256</li>
  <li>☐ Access token short-lived (15 min), refresh token longer (7 days)</li>
  <li>☐ Refresh token rotation (invalidate old on use)</li>
  <li>☐ Secure cookie flags: HttpOnly, Secure, SameSite=Strict</li>
  <li>☐ No credentials, tokens, or PII in server logs</li>
  <li>☐ Rate limiting on /auth/login and /auth/callback (10 req/min/IP)</li>
  <li>☐ Redirect URI whitelist (no open redirects)</li>
</ul>

<h3>Testing Strategy</h3>
<table>
  <tr><th>Type</th><th>Coverage</th><th>Key Scenarios</th></tr>
  <tr><td>Unit</td><td>≥80%</td><td>Token creation, validation, expiry; session CRUD; user upsert logic</td></tr>
  <tr><td>Integration</td><td>All paths</td><td>Login → callback → JWT issued; refresh flow; logout; expired token; invalid token</td></tr>
  <tr><td>Security</td><td>OWASP</td><td>CSRF on callback; open redirect; token leakage; brute force</td></tr>
</table>

<h3>Dependencies</h3>
<ul>
  <li>Requires: T-002 (DB schema — users, sessions tables), T-004 (Azure provisioning)</li>
  <li>Blocks: T-010 (Session management), T-011 (Auth middleware), T-014 (RBAC engine)</li>
  <li>External: NUS IT must provide Entra ID app registration (clientId, tenantId, clientSecret)</li>
</ul>

<h3>Edge Cases & Error Handling</h3>
<ul>
  <li>Entra ID down → Show friendly error page, retry with exponential backoff</li>
  <li>User exists in Entra but not in ProctorX DB → Auto-create with default role (Student)</li>
  <li>Concurrent login from 2 devices → Invalidate older session, notify user</li>
  <li>Token refresh with revoked refresh token → Force re-login</li>
  <li>Callback with tampered state parameter → Reject with 403, log incident</li>
</ul>

<h3>Definition of Done</h3>
<ul>
  <li>☐ All 5 auth endpoints implemented and functional</li>
  <li>☐ Unit tests pass (≥80% coverage on auth services)</li>
  <li>☐ Integration test passes (mock Entra OIDC flow)</li>
  <li>☐ Security checklist all items checked</li>
  <li>☐ No lint errors, CI green</li>
  <li>☐ PR reviewed and approved</li>
</ul>

Original Estimate: 16 hours
Activity: Development
Priority: 1
Tags: backend, auth, oidc, entra-id, security
```

### GitHub Issue Example: Entra ID OIDC (for Copilot)

```markdown
Title: T-009 - Integrate Microsoft Entra ID OIDC

Labels: backend, auth, oidc, security, story-points-8, sprint-1

## Summary
Implement server-side OIDC authentication flow with Microsoft Entra ID. This task
creates the complete auth backend: login initiation, OIDC callback handling, JWT
token issuance, session management, and user profile extraction.

**Azure DevOps Work Item:** [T-009](https://dev.azure.com/{org}/{project}/_workitems/edit/{id})
**Parent Story:** F1: Authentication & SSO (#83380)
**Sprint:** Sprint 1 - Auth
**Estimate:** 8 SP / 16 hours

---

## API Endpoints to Implement

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/auth/login` | None | Initiate OIDC → redirect to Entra |
| POST | `/api/auth/callback` | None | OIDC callback → validate → issue JWT |
| POST | `/api/auth/refresh` | Refresh Token | Issue new access token |
| POST | `/api/auth/logout` | JWT | Invalidate session |
| GET | `/api/auth/me` | JWT | Return current user profile |

## Implementation Checklist
- [ ] Install `passport`, `passport-azure-ad`, `jsonwebtoken`
- [ ] Create `src/config/auth.ts` — Entra ID config from env vars
- [ ] Create `src/strategies/entraId.ts` — Passport OIDC strategy
- [ ] Create `src/controllers/authController.ts` — 5 route handlers
- [ ] Create `src/services/tokenService.ts` — JWT sign/verify (RS256)
- [ ] Create `src/services/sessionService.ts` — session CRUD + concurrent prevention
- [ ] Create `src/middleware/authenticate.ts` — JWT validation middleware
- [ ] Create `src/routes/auth.ts` — route definitions
- [ ] Modify `src/routes/index.ts` — register auth routes
- [ ] User upsert: find by Entra OID, create if new, update lastLogin
- [ ] Audit log all auth events (login, logout, failure)

## Security Requirements
- [ ] OIDC state parameter validated (CSRF)
- [ ] JWT signed RS256 (not HS256)
- [ ] Access token: 15min TTL, Refresh token: 7d with rotation
- [ ] Cookies: HttpOnly, Secure, SameSite=Strict
- [ ] No credentials/tokens/PII in logs
- [ ] Rate limit: 10 req/min/IP on auth endpoints
- [ ] Redirect URI whitelist (no open redirects)

## Testing Requirements
- [ ] Unit tests for tokenService (create, validate, expire, refresh)
- [ ] Unit tests for sessionService (create, find, invalidate, concurrent)
- [ ] Integration test: full login → callback → JWT → me flow
- [ ] Integration test: token refresh flow
- [ ] Integration test: expired/invalid token → 401
- [ ] Integration test: logout → session invalidated
- [ ] Mock: Entra ID OIDC responses

## Files to Create/Modify

| Action | Path |
|--------|------|
| Create | `src/config/auth.ts` |
| Create | `src/strategies/entraId.ts` |
| Create | `src/controllers/authController.ts` |
| Create | `src/services/tokenService.ts` |
| Create | `src/services/sessionService.ts` |
| Create | `src/middleware/authenticate.ts` |
| Create | `src/routes/auth.ts` |
| Modify | `src/routes/index.ts` |
| Create | `tests/unit/tokenService.test.ts` |
| Create | `tests/unit/sessionService.test.ts` |
| Create | `tests/integration/auth.test.ts` |
| Create | `tests/mocks/entraId.mock.ts` |

## Dependencies
- **Requires:** #T-002 (DB schema), #T-004 (Azure provisioning)
- **Blocks:** #T-010, #T-011, #T-014
- **External:** NUS IT → Entra ID app registration (clientId, tenantId, clientSecret)

## Edge Cases
- Entra ID unavailable → friendly error + retry with backoff
- User in Entra but not in DB → auto-create with Student role
- Concurrent login → invalidate older session
- Refresh with revoked token → force re-login
- Tampered state parameter → 403 + audit log

## Environment Variables Needed
```env
ENTRA_TENANT_ID=
ENTRA_CLIENT_ID=
ENTRA_CLIENT_SECRET=
ENTRA_REDIRECT_URI=
JWT_PRIVATE_KEY_PATH=
JWT_PUBLIC_KEY_PATH=
SESSION_SECRET=
```

/cc @copilot
```

## Agent Usage Examples

Reference examples showing expected agent output format for common commands.

### create-stories (Full Backlog)
```
User: @5-product-owner create-stories

Agent: Creating user stories in Azure DevOps...

📋 Loaded development plan: 9 features, 70 tasks, 265 SP
📋 Loaded 28 FRs, 10 NFRs, 27 business rules, 14 clarifications
📋 Loaded 7 personas
📋 No sprint filter — creating ALL features and tasks

Creating in Azure DevOps project: copilot-poc-repo
✅ Story #1001: F1: Authentication & SSO (22 SP)
   → Description: User Story + Context + 4 FRs + 5 BRs + 2 CLRs + 5 Personas + Security + DoD
   → Acceptance Criteria: 8 scenarios (Given/When/Then) + NFR criteria
   ✅ Task #1002: T-008 - Login page UI (3 SP, 6h) — 12 files, security checklist
   ✅ Task #1003: T-009 - Entra ID OIDC (8 SP, 16h) — 13 files, 5 endpoints, 7 tests
   ...

📊 Summary:
- User Stories: 9 (all with full Description + Acceptance Criteria)
- Tasks: 70 (all with technical specs + file manifests + DoD)
- Total Story Points: 265
- GitHub Issues: 70 (comprehensive specs for Copilot)
- Requirement Coverage: 28/28 FRs traced to stories
```

### create-stories --sprint (Sprint-Scoped)
```
User: @5-product-owner create-stories --sprint 1

Agent: Creating user stories for Sprint 1...

📋 Loaded development plan: 9 features, 70 tasks, 265 SP
📋 Filtered to Sprint 1: 2 features, 8 tasks, 22 SP
📋 Loaded 28 FRs, 10 NFRs, 27 business rules, 14 clarifications

Creating in Azure DevOps project: copilot-poc-repo
✅ Story #1001: F1: Authentication & SSO (22 SP)
   ✅ Task #1002: T-008 - Login page UI (3 SP, 6h)
   ✅ Task #1003: T-009 - Entra ID OIDC (8 SP, 16h)
   ✅ Task #1004: T-010 - Session management (3 SP, 6h)
   ⏭️ Task T-011: Skipped (Sprint 2)
✅ Story #1010: F2: RBAC & Permissions (25 SP) — partial: 5/9 tasks in Sprint 1
   ✅ Task #1011: T-015 - Role model setup (5 SP, 10h)
   ✅ Task #1012: T-016 - Permission middleware (3 SP, 6h)
   ⏭️ 4 tasks skipped (Sprint 2–3)

📊 Sprint 1 Summary:
- User Stories: 2 created (1 full, 1 partial)
- Tasks: 8 created (Sprint 1 scope only)
- Story Points: 22
- GitHub Issues: 8
- Skipped: 62 tasks in other sprints

💡 Run `create-stories --sprint 2` next to continue with Sprint 2 tasks.
   Existing stories will be reused — only new tasks added.
```

### backlog-health
```
User: @5-product-owner backlog-health

Agent: Auditing backlog quality...

📊 Backlog Health Score: 92/100

✅ INVEST Compliance: 9/9 stories pass (100%)
✅ Acceptance Criteria: All stories have Given/When/Then (100%)
✅ Estimation: 79/79 items estimated (100%)
✅ Sprint Balance: All sprints within ±15% velocity target
✅ Requirement Traceability: 28/28 FRs linked to stories
⚠️ DoD Coverage: 7/9 stories have full DoD (78%) — 2 missing security review item
❌ Blocked Items: 3 tasks blocked by external dependency (NUS IT Entra ID setup)

Recommendations:
1. Add security review to DoD of Story #83406 and #83411
2. Escalate Entra ID dependency — blocking 3 tasks in Sprint 1
3. Consider moving T-045 to Sprint 3 (low priority, sprint 2 overloaded by 5 SP)
```

### groom-story {id}
```
User: @5-product-owner groom-story 1042

Agent: Reading User Story #1042 from Azure DevOps...

📖 Story #1042: Implement Document Upload Module
   State: New | Priority: 2 | Story Points: 8

🔍 Analyzing impact against requirements and source code...

📋 Requirement Traceability:
  ✅ FR-MOD-002: Document Upload (Full coverage)
  ⚠️ FR-MOD-002.1: File validation (Partial - missing size limit criteria)
  ❌ NFR-S-003: Upload encryption (Gap - not in acceptance criteria)

💻 Code Impact:
  📝 Modify: src/controllers/documentController.ts (add upload endpoint)
  📝 Create: src/services/documentUploadService.ts
  📝 Create: src/middleware/fileValidation.ts
  📝 Create: tests/unit/documentUpload.test.ts
  ⚠️ Modify: src/routes/api.ts (register new route)

⚠️ Risks:
  - Medium: No encryption requirement in acceptance criteria
  - Low: File size limit not specified

❓ Open Questions:
  1. Maximum file size for uploads? (ask: Product Owner)
  2. Supported file formats beyond PDF? (ask: BA)

📄 Written: dev-ops/user-stories/1042-userstoryname-v1.md

📚 Publishing to Azure DevOps Wiki...
✅ Published: /User-Stories-Grooming/1042-implement-document-upload-v1
🔗 Linked wiki page to Work Item #1042
💡 Suggested: Increase story points from 8 → 13 (encryption + validation gaps)
```

### status
```
User: @5-product-owner status

Agent: 📊 Backlog Status Dashboard

| Metric | Value |
|--------|-------|
| User Stories | 9 |
| Tasks | 70 |
| Total Story Points | 265 |
| Sprints | 13 (S0–S12) |
| GitHub Issues | 70 |

Sprint Allocation:
  Sprint 0: 15 SP (3 tasks) — Project Setup
  Sprint 1: 22 SP (8 tasks) — Auth & SSO
  Sprint 2: 25 SP (9 tasks) — RBAC & Monitoring
  ...

Status Breakdown:
  📋 New: 70 tasks
  ✅ Closed: 0
  🚫 Blocked: 3 (Entra ID dependency)

Requirement Coverage: 28/28 FRs → Stories (100%)
```
