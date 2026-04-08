# Prompt Templates for AI-Assisted SDLC

This directory contains reusable prompt templates for various scenarios in the AI-assisted SDLC workflow.

## Template Structure

Each template includes:
- **Purpose:** What the prompt accomplishes
- **When to Use:** Scenarios for this prompt
- **Template:** The actual prompt text with placeholders
- **Example:** Filled-in example
- **Tips:** Best practices for using the prompt

---

## Prototyping / Tech Stack Validation Prompts

### Template: Initialize Prototype
**Purpose:** Validate a proposed tech stack through proof-of-concept prototyping

**When to Use:** Starting a new project, before committing to a technology stack

**Template:**
```
@2-technical-feasibility I'm starting a new project called {PROJECT_NAME}.

Description: {HIGH_LEVEL_DESCRIPTION}

Proposed Tech Stack:
  Frontend: {FRONTEND_FRAMEWORK}
  Backend: {BACKEND_FRAMEWORK}
  Database: {DATABASE}
  Infrastructure: {CLOUD_PROVIDER / DEPLOYMENT_TARGET}

Target Platform: {web | mobile | desktop | API-only}

Key Capabilities to Validate:
1. {RISKIEST_CAPABILITY_1}
2. {RISKIEST_CAPABILITY_2}
3. {RISKIEST_CAPABILITY_3}

Constraints:
- {CONSTRAINT_1}
- {CONSTRAINT_2}

Please scaffold the project, run capability spikes, and produce a go/no-go recommendation.
```

**Example:**
```
@2-technical-feasibility I'm starting a new project called Customer Portal.

Description: A self-service portal where customers can view invoices, manage subscriptions, and contact support.

Proposed Tech Stack:
  Frontend: React 18 with TypeScript
  Backend: FastAPI (Python 3.12)
  Database: PostgreSQL 16
  Infrastructure: Azure App Service + Azure Container Apps

Target Platform: web

Key Capabilities to Validate:
1. Real-time notification delivery via WebSockets
2. PDF invoice generation and download
3. Azure AD B2C authentication integration

Constraints:
- Must deploy to Azure (organizational mandate)
- WCAG 2.1 AA accessibility compliance required
- Team has limited Python backend experience

Please scaffold the project, run capability spikes, and produce a go/no-go recommendation.
```

### Template: Modify Prototype Configuration
**Purpose:** Change one or more prototype inputs without re-running the full init

**When to Use:** After init, when you need to change the tech stack, add capabilities, or update constraints

**Template:**
```
@2-technical-feasibility modify {FIELD}
```

**Fields:** `name`, `desc`, `stack`, `platform`, `capabilities`, `constraints`, `deployment`

**Examples:**
```
@2-technical-feasibility modify stack

# Change from React + Express to Angular + .NET 8
```

```
@2-technical-feasibility modify capabilities

# Add "real-time notifications" as a new spike capability
```

```
@2-technical-feasibility modify stack, constraints

# Update multiple fields at once
```

### Template: Check Prototype Status
**Purpose:** View current prototype configuration and progress at a glance

**When to Use:** Anytime you want to see what's configured and what's been completed

**Template:**
```
@2-technical-feasibility status
```

### Template: Extend Prototype Scope
**Purpose:** Add new capabilities, integrations, constraints, or compare against an alternative stack

**When to Use:** After init, when you discover additional things to validate

**Add a New Spike:**
```
@2-technical-feasibility extend spike {CAPABILITY_NAME}
```

**Add a New Integration Target:**
```
@2-technical-feasibility extend integration {SERVICE_NAME}
```

**Add a New Constraint:**
```
@2-technical-feasibility extend constraint {DESCRIPTION}
```

**Compare Against Alternative Stack:**
```
@2-technical-feasibility extend compare {ALT_STACK}
```

**Examples:**
```
@2-technical-feasibility extend spike real-time-notifications
```

```
@2-technical-feasibility extend integration Stripe
```

```
@2-technical-feasibility extend constraint "Must support offline mode for mobile users"
```

```
@2-technical-feasibility extend compare "Vue 3 + FastAPI + PostgreSQL"
```

### Template: Generate Executive Summary
**Purpose:** Produce a 1-page non-technical brief for CTO, PMO, or Finance stakeholders

**When to Use:** After completing most or all prototype checks, before the go/no-go meeting

**Template:**
```
@2-technical-feasibility summary
```

**Notes:**
- Works best after running: `init`, `spike`, `check-integrations`, `benchmark`, `security-check`, `estimate-cost`
- Handles partial data gracefully — missing checks shown as `⏳ Pending`
- Produces `/docs/prototype/executive-summary.md`

### Template: Run a Single Capability Spike
**Purpose:** Test feasibility of a specific technical capability in the chosen stack

**When to Use:** After prototype initialization, to validate individual high-risk features

**Template:**
```
@2-technical-feasibility spike {CAPABILITY_NAME}

Details:
- What it needs to do: {DESCRIPTION}
- External systems involved: {APIS_OR_SERVICES}
- Success criteria: {WHAT_PROVES_IT_WORKS}
```

**Example:**
```
@2-technical-feasibility spike websocket-notifications

Details:
- What it needs to do: Push real-time notifications from server to browser
- External systems involved: Azure Service Bus (message source)
- Success criteria: Browser receives a pushed message within 2 seconds of server event
```

### Template: Security & Compliance Check
**Purpose:** Scan prototype dependencies for vulnerabilities, license issues, and compliance gaps

**When to Use:** After scaffolding the project, before making a go/no-go decision

**Template:**
```
@2-technical-feasibility security-check

Compliance standards: {STANDARDS}
Corporate license policy: {APPROVED_LICENSES_OR_LINK}
Data residency requirements: {REGIONS}
```

**Example:**
```
@2-technical-feasibility security-check

Compliance standards: SOX, GDPR
Corporate license policy: Only MIT, Apache 2.0, BSD allowed. No copyleft.
Data residency requirements: Data must stay in EU West (Ireland) and US East (Virginia)
```

### Template: Cost Estimation
**Purpose:** Estimate monthly/annual infrastructure and licensing costs for the proposed stack

**When to Use:** After scaffolding, before getting budget approval

**Template:**
```
@2-technical-feasibility estimate-cost

Expected users: {USER_COUNT}
Data volume: {ESTIMATED_STORAGE}
Cloud provider: {PROVIDER}
Budget ceiling: {MAX_MONTHLY_BUDGET}
```

**Example:**
```
@2-technical-feasibility estimate-cost

Expected users: 200 internal users, 50 concurrent
Data volume: ~50GB of invoices per year, ~10GB database
Cloud provider: Azure
Budget ceiling: $2,000/month for production
```

---

## Connectivity Setup Prompts

### Template: Initial Connection Setup
**Purpose:** Set up all integration connections for a new project

**When to Use:** Starting a new project with the framework

**Template:**
```
@connectivity-agent I'm starting a new project called {PROJECT_NAME}. Please set up connections to:

GitHub Repository: {GITHUB_REPO_URL}
Azure DevOps:
  Organization: {DEVOPS_ORG}
  Project: {DEVOPS_PROJECT}
Confluence:
  Space URL: {CONFLUENCE_SPACE_URL}
  Space Key: {CONFLUENCE_KEY}

Please validate all connections and create the configuration documentation.
```

**Example:**
```
@connectivity-agent I'm starting a new project called Customer Portal. Please set up connections to:

GitHub Repository: https://github.com/acme-corp/customer-portal
Azure DevOps:
  Organization: acme-corp
  Project: CustomerPortal
Confluence:
  Space URL: https://acme.atlassian.net/wiki/spaces/CP
  Space Key: CP

Please validate all connections and create the configuration documentation.
```

---

## Requirements Analysis Prompts

### Template: Confluence Requirements Analysis
**Purpose:** Analyze requirements from Confluence documentation

**Template:**
```
@3-requirement-analyst Please analyze the technical requirements from our Confluence documentation:

URL: {CONFLUENCE_PAGE_URL}

Focus on:
- Extracting all functional requirements as user stories
- Identifying non-functional requirements with measurable criteria
- Noting any ambiguities or missing information
- Generating clarification questions for unclear requirements

Priority areas: {LIST_PRIORITY_AREAS}
```

**Example:**
```
@3-requirement-analyst Please analyze the technical requirements from our Confluence documentation:

URL: https://acme.atlassian.net/wiki/spaces/CP/pages/123456/Technical+Specs

Focus on:
- Extracting all functional requirements as user stories
- Identifying non-functional requirements with measurable criteria
- Noting any ambiguities or missing information
- Generating clarification questions for unclear requirements

Priority areas: User authentication, payment processing, data privacy compliance
```

### Template: Multi-Page Requirements Analysis
**Purpose:** Analyze requirements split across multiple Confluence pages

**Template:**
```
@3-requirement-analyst Please analyze requirements from the following Confluence pages:

Main Specification: {URL_1}
API Specifications: {URL_2}
Security Requirements: {URL_3}
UI/UX Requirements: {URL_4}

Please consolidate all requirements into a unified set of documentation, removing any duplicates and noting any contradictions for clarification.
```

---

## Screen Design Analysis Prompts

### Template: Analyze Design Mockups
**Purpose:** Extract UI specifications from design files

**Template:**
```
@screen-design-agent Please analyze the following screen designs:

Design files location: {PATH_OR_URL}

Please:
1. Identify all unique screens and components
2. Extract design tokens (colors, typography, spacing)
3. List all required assets (images, icons, fonts)
4. Document responsive behavior
5. Generate component specifications
6. Cross-reference with functional requirements in /docs/requirements/

Focus on: {SPECIFIC_SCREENS_OR_FEATURES}
```

**Example:**
```
@screen-design-agent Please analyze the following screen designs:

Design files location: /docs/designs/customer-portal-mockups.fig

Please:
1. Identify all unique screens and components
2. Extract design tokens (colors, typography, spacing)
3. List all required assets (images, icons, fonts)
4. Document responsive behavior
5. Generate component specifications
6. Cross-reference with functional requirements in /docs/requirements/

Focus on: Dashboard, user profile, payment checkout flow
```

---

## Clarification Management Prompts

### Template: Initialize Clarification Tracking
**Purpose:** Set up clarification management for a project

**Template:**
```
@3-requirement-analyst clr-init

Review clarifications from:
- Requirement Analyst: /docs/requirements/clarifications/clarifications-needed.md
- Screen Design Agent: /docs/requirements/screens/design-clarifications.md
- Additional manual clarifications: {IF_ANY}

Please:
1. Consolidate all clarifications
2. Prioritize by impact (Critical/High/Medium/Low)
3. Assign to appropriate stakeholders
4. Create clarification tracker
5. Suggest meeting schedule for resolution

Known stakeholders:
- Product Owner: {NAME}
- Tech Lead: {NAME}
- Design Lead: {NAME}
```

### Template: Resolve Specific Clarification
**Purpose:** Document resolution of a clarification

**Template:**
```
@3-requirement-analyst clr-resolve CLR-{NUMBER}

Answer: {STAKEHOLDER_ANSWER}
Decided by: {STAKEHOLDER_NAME}
Date: {DATE}

Please update all affected requirements and document the decision rationale.
```

**Example:**
```
@3-requirement-analyst clr-resolve CLR-007

Answer: User session timeout is 30 minutes of inactivity for standard login, 30 days for "Remember Me" option. All sessions show "extend session" prompt at 25 minutes.
Decided by: Sarah Johnson (Product Owner)
Date: 2026-01-28

Please update all affected requirements and document the decision rationale.
```

---

## Development Planning Prompts

### Template: Create Initial Development Plan
**Purpose:** Generate comprehensive development plan from requirements

**Template:**
```
@4-project-planning Please create a development plan for this project.

Requirements location: /docs/requirements/
Team size: {NUMBER} developers
Sprint duration: {WEEKS} weeks
Preferred tech stack: {STACK}

Please:
1. Break down all features into implementable tasks
2. Estimate effort in story points
3. Identify dependencies between tasks
4. Sequence tasks for optimal development
5. Group tasks into {NUMBER_OF_SPRINTS} sprints
6. Identify technical risks and mitigation strategies
7. Specify testing requirements (unit, integration, mocks needed)

Focus MVP on: {MVP_FEATURES}
```

**Example:**
```
@4-project-planning Please create a development plan for this project.

Requirements location: /docs/requirements/
Team size: 3 developers (2 full-stack, 1 frontend specialist)
Sprint duration: 2 weeks
Preferred tech stack: Node.js/Express backend, React frontend, PostgreSQL database

Please:
1. Break down all features into implementable tasks
2. Estimate effort in story points
3. Identify dependencies between tasks
4. Sequence tasks for optimal development
5. Group tasks into 4 sprints
6. Identify technical risks and mitigation strategies
7. Specify testing requirements (unit, integration, mocks needed)

Focus MVP on: User authentication, basic dashboard, profile management
```

---

## Product Owner Prompts

### Template: Create User Stories and Tasks
**Purpose:** Generate work items in Azure DevOps and GitHub

**Template:**
```
@5-product-owner Please create user stories and tasks based on the development plan.

Development plan: /docs/planning/development-plan.md
Azure DevOps Project: {PROJECT}
GitHub Repository: {REPO}

Please:
1. Create sprints/iterations for the next {NUMBER} sprints
2. Create user stories with acceptance criteria
3. Create tasks under each story with estimates
4. Assign to appropriate sprints
5. Create corresponding GitHub issues for Copilot assignment
6. Link all items to requirements documentation

Tag strategy: {TAGS_TO_USE}
```

---

## Code Review Agent Prompts

### Template: Comprehensive PR Review
**Purpose:** Review a pull request for quality, security, and standards

**Template:**
```
@code-review-agent Please review PR #{PR_NUMBER}

Focus areas:
- {TECH_STACK} coding standards compliance
- Security vulnerabilities (OWASP Top 10)
- Test coverage (minimum 80%)
- Performance considerations
- Mocking of external interfaces
- Documentation completeness

Special attention to: {SPECIFIC_CONCERNS}
```

**Example:**
```
@code-review-agent Please review PR #42

Focus areas:
- Python PEP 8 compliance
- Security vulnerabilities (OWASP Top 10)
- Test coverage (minimum 80%)
- Performance considerations
- Mocking of external interfaces
- Documentation completeness

Special attention to: Database queries and authentication logic - this is security-critical code
```

### Template: Quick Security Scan
**Purpose:** Fast security-focused review

**Template:**
```
@code-review-agent Please perform a security-focused review of PR #{PR_NUMBER}

Priority checks:
- SQL injection vulnerabilities
- XSS vulnerabilities
- Authentication/authorization issues
- Sensitive data exposure
- Hardcoded secrets
- Cryptography misuse

This PR is fast-tracked for {REASON} so please prioritize security issues only.
```

---

## Documentation Agent Prompts

### Template: Complete Documentation Suite
**Purpose:** Generate all operational documentation

**Template:**
```
@docs-agent Please generate complete operational documentation for this project.

Tech stack: {STACK}
Deployment target: {AZURE/AWS/etc}

Please create:
1. Setup guide for local development
2. Deployment guide for {ENVIRONMENT}
3. API documentation with examples
4. Troubleshooting guide
5. Architecture overview
6. Runbooks for common operations

Ensure all documentation is suitable for developers new to the project.
```

**Example:**
```
@docs-agent Please generate complete operational documentation for this project.

Tech stack: Node.js + React + PostgreSQL
Deployment target: Azure App Service

Please create:
1. Setup guide for local development
2. Deployment guide for Azure App Service
3. API documentation with examples
4. Troubleshooting guide
5. Architecture overview
6. Runbooks for common operations

Ensure all documentation is suitable for developers new to the project.
```

### Template: Update Deployment Documentation
**Purpose:** Update docs for infrastructure changes

**Template:**
```
@docs-agent The deployment process has changed. Please update /docs/operations/deployment.md

Changes:
- {CHANGE_1}
- {CHANGE_2}

Please also update:
- Prerequisites section
- Environment variables
- Verification steps

Test the updated instructions against {ENVIRONMENT}.
```

---

## Combined Workflow Prompts

### Template: End-to-End Project Kickoff
**Purpose:** Initialize entire project workflow in sequence

**Template:**
```
I'm starting a new project: {PROJECT_NAME}

Phase 1 - Setup:
@connectivity-agent setup connections for:
  GitHub: {URL}
  Azure DevOps: {ORG}/{PROJECT}
  Confluence: {SPACE_URL}

Phase 2 - Requirements:
@3-requirement-analyst analyze {CONFLUENCE_URL}
@screen-design-agent analyze /docs/designs/

Phase 3 - Clarifications:
@3-requirement-analyst clr-init

{After clarifications resolved}

Phase 4 - Planning:
@4-project-planning create-plan with {NUMBER} developers, {SPRINT_WEEKS} week sprints

Phase 5 - Work Items:
@5-product-owner create-stories

Please execute phases sequentially, waiting for confirmation before proceeding to next phase.
```

---

## Tips for Effective Prompts

### Be Specific
- ✅ "Analyze requirements focusing on authentication and payment features"
- ❌ "Analyze requirements"

### Provide Context
- ✅ "This is a healthcare application, so prioritize HIPAA compliance in security review"
- ❌ "Review for security"

### Set Clear Expectations
- ✅ "Generate development plan for 3 developers over 4 sprints (2 weeks each)"
- ❌ "Create a development plan"

### Reference Existing Work
- ✅ "Based on requirements in /docs/requirements/ and clarifications in clarification-tracker.md"
- ❌ Generic prompts without context

### Specify Output Formats
- ✅ "Create user stories in Azure DevOps with GitHub issues for each task"
- ❌ "Create work items"

### Include Constraints
- ✅ "Must achieve 80% test coverage, follow PEP 8, mock all external APIs"
- ❌ "Write good code"

---

## Custom Prompt Creation

When creating your own prompts:

1. **Start with the goal:** What do you want to accomplish?
2. **Identify the agent:** Which agent has the capability?
3. **Provide context:** What information does the agent need?
4. **Specify outputs:** What artifacts should be created?
5. **Set constraints:** What standards or limits apply?
6. **Test and refine:** Iterate based on results

---

**Last Updated:** January 28, 2026  
**Framework Version:** 1.0.0
