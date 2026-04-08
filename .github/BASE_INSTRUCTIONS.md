# Base Instructions for AI-Assisted SDLC Framework

## Overview
This framework provides a complete AI-assisted Software Development Life Cycle (SDLC) workflow from requirements gathering to deployment documentation. These assets are reusable across any new project.

## Project Organization Standards

### Repository Structure
Every project using this framework should follow this standardized structure:

```
{project-root}/
├── .github/
│   ├── agents/                    # Copied from reusable framework
│   ├── copilot-instructions.md    # Project-specific Copilot instructions
│   └── workflows/                 # CI/CD workflows
├── docs/
│   ├── requirements/
│   │   ├── functional/           # Functional requirements (AI-readable)
│   │   ├── non-functional/       # Non-functional requirements
│   │   ├── clarifications/       # Questions and clarifications
│   │   └── screens/              # Screen design analysis
│   ├── architecture/
│   │   ├── decisions/            # Architecture Decision Records (ADRs)
│   │   ├── diagrams/             # Architecture diagrams
│   │   └── tech-stack.md         # Technology stack documentation
│   ├── planning/
│   │   ├── development-plan.md   # Overall development plan
│   │   ├── tasks/                # Task breakdowns by feature/module
│   │   └── estimates.md          # Effort estimates
│   ├── operations/
│   │   ├── setup.md              # Setup instructions
│   │   ├── deployment.md         # Deployment guide
│   │   └── troubleshooting.md    # Common issues and solutions
│   └── integrations/
│       ├── connections.md        # Integration connection details
│       ├── github-config.md      # GitHub repository configuration
│       ├── devops-config.md      # Azure DevOps configuration
│       └── confluence-config.md  # Confluence space configuration
├── src/
│   ├── {tech-stack-specific}/    # Source code organized by tech stack standards
│   ├── tests/                    # Unit tests (TDD approach)
│   └── mocks/                    # Mock implementations for external interfaces
├── assets/
│   ├── images/                   # Image assets from screen designs
│   ├── fonts/                    # Font assets
│   ├── icons/                    # Icon assets
│   └── styles/                   # Style guides and themes
└── README.md                     # Project overview
```

### Documentation Standards

#### Markdown Format
- All documentation must be in Markdown format (.md)
- Use consistent heading levels (# for title, ## for sections, ### for subsections)
- Include table of contents for documents > 200 lines
- Use code blocks with language specification: ```language

#### AI-Readable Format
Documents should follow these conventions for AI parsing:

**Functional Requirements:**
```markdown
## Feature: {Feature Name}

**User Story:** As a {user type}, I want to {action} so that {benefit}.

**Acceptance Criteria:**
- [ ] Given {context}, when {action}, then {expected outcome}
- [ ] Given {context}, when {action}, then {expected outcome}

**Dependencies:**
- {System/Service/Component}

**Priority:** {High|Medium|Low}

**Complexity:** {High|Medium|Low}
```

**Non-Functional Requirements:**
```markdown
## NFR: {Requirement Name}

**Category:** {Performance|Security|Scalability|Usability|Reliability|Maintainability}

**Requirement:** {Detailed description}

**Acceptance Criteria:**
- {Measurable criterion}

**Impact:** {High|Medium|Low}
```

**Clarifications:**
```markdown
## Clarification {ID}

**Status:** {Open|In Progress|Resolved}

**Context:** {Where this clarification is needed}

**Question:** {Specific question}

**Stakeholder:** {Who can answer this}

**Answer:** {Resolution when available}

**Impact:** {What depends on this answer}
```

### Integration Configuration

#### Connection Details Storage
All integration connection details must be documented in `/docs/integrations/connections.md`:

```markdown
## GitHub Repository
- **Repository URL:** {url}
- **Default Branch:** {branch}
- **Access Token:** Stored in environment variable `GITHUB_TOKEN`

## Azure DevOps
- **Organization:** {org-name}
- **Project:** {project-name}
- **Access Token:** Stored in environment variable `AZURE_DEVOPS_TOKEN`

## Confluence
- **Space URL:** {url}
- **Space Key:** {key}
- **Access Token:** Stored in environment variable `CONFLUENCE_TOKEN`
```

### Coding Standards

#### Domain-Specific Standards
Each tech stack should have a coding standards document in `/docs/architecture/coding-standards-{tech}.md`:

**Python:**
- Follow PEP 8
- Use type hints
- Maximum line length: 100 characters
- Use docstrings (Google style)

**JavaScript/TypeScript:**
- Follow Airbnb style guide
- Use ESLint and Prettier
- Prefer functional programming patterns
- Use TypeScript strict mode

**Java:**
- Follow Google Java Style Guide
- Use meaningful variable names
- Maximum method length: 50 lines
- Use Javadoc for public APIs

#### Test-Driven Development (TDD)
- Write tests before implementation
- Minimum 80% code coverage
- Unit tests in `/src/tests/` directory
- Test file naming: `{module}.test.{ext}`
- Use appropriate testing frameworks:
  - Python: pytest
  - JavaScript/TypeScript: Jest
  - Java: JUnit 5

#### External Interface Mocking
- All external API calls must have mock implementations
- Mocks stored in `/src/mocks/` directory
- Mock naming: `{service}.mock.{ext}`
- Use dependency injection for testability
- Document mock behavior in comments

## Workflow Process

### Phase 1: Setup & Connection
1. Clone this reusable asset repository
2. Copy `.github/agents/` to your new project
3. Run Connectivity Setup Agent to configure all integrations
4. Document all connection details in `/docs/integrations/`

### Phase 2: Requirements Analysis
1. Functional user creates Technical Design Specs in Confluence
2. Run Requirements Analysis Agent to:
   - Parse Confluence specs
   - Convert to AI-readable markdown
   - Identify missing information
   - Generate clarification questions

### Phase 3: Clarification Resolution
1. Review generated clarifications in `/docs/requirements/clarifications/`
2. Run Clarification Management Agent to:
   - Track clarification status
   - Schedule stakeholder meetings
   - Document resolutions

### Phase 4: Development Planning
1. Run Development Project Planning to:
   - Analyze all requirements
   - Break down into tasks
   - Estimate effort
   - Identify dependencies
   - Create development roadmap

### Phase 5: Task Creation
1. Run Product Owner to:
   - Create user stories in Azure DevOps
   - Create tasks with estimates
   - Link to requirements documentation
   - Create corresponding GitHub issues

### Phase 6: Development
1. Assign GitHub issues to Copilot
2. Copilot generates code following domain standards
3. Copilot creates unit tests (TDD)
4. Copilot creates mocks for external interfaces
5. Copilot creates Pull Request

### Phase 7: Code Review
1. Run Code Review Agent (tech-stack specific) to:
   - Verify coding standards compliance
   - Check test coverage
   - Review architecture patterns
   - Identify security issues
   - Provide improvement suggestions

### Phase 8: Human Review & Merge
1. Engineer reviews agent feedback
2. Makes necessary adjustments
3. Approves and merges PR

### Phase 9: Documentation
1. Run Documentation Agent to:
   - Generate setup instructions
   - Document deployment steps
   - Create troubleshooting guide
   - Update API documentation

## Agent Invocation Patterns

### Using Agents
Agents are invoked using the `@{agent-name}` pattern in GitHub Copilot:

```
@connectivity-agent setup connections for this project
@3-requirement-analyst analyze confluence doc at {url}
@3-requirement-analyst clr-init
@4-project-planning create development plan
@5-product-owner create user stories in DevOps
@code-review-agent review PR #{number}
@docs-agent generate deployment guide
```

### Agent Context
Agents will automatically:
- Read relevant documentation from `/docs/`
- Follow project structure standards
- Maintain consistency across documents
- Link related artifacts
- Update tracking documents

## Version Control Guidelines

### Branch Strategy
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/{feature-name}` - Feature development
- `bugfix/{bug-name}` - Bug fixes
- `release/{version}` - Release preparation

### Commit Messages
Follow Conventional Commits:
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types: feat, fix, docs, style, refactor, test, chore

### Pull Request Requirements
- All tests passing
- Code review approved (by agent and human)
- Documentation updated
- No merge conflicts
- Linked to issue/task

## Environment Variables

Required environment variables for framework operation.

**📖 SETUP GUIDE:** See [CREDENTIAL_SETUP.md](./CREDENTIAL_SETUP.md) for detailed instructions on:
- Creating Personal Access Tokens (PATs)
- Required permission scopes
- Token storage best practices
- Verification and troubleshooting

**Quick Setup:**
```bash
# 1. Copy template
cp .env.example .env

# 2. Get tokens from:
# - GitHub: https://github.com/settings/tokens
# - Azure DevOps: https://dev.azure.com/{org}/_usersSettings/tokens
# - Confluence: https://id.atlassian.com/manage-profile/security/api-tokens

# 3. Edit .env and add your tokens

# 4. Verify (NEVER commit .env!)
@connectivity-agent validate
```

**Required Variables:**
```bash
# GitHub
GITHUB_TOKEN=your_github_token
GITHUB_REPOSITORY=owner/repo

# Azure DevOps
AZURE_DEVOPS_TOKEN=your_devops_token
AZURE_DEVOPS_ORG=your_organization
AZURE_DEVOPS_PROJECT=your_project

# Confluence
CONFLUENCE_TOKEN=your_confluence_token
CONFLUENCE_URL=https://your-domain.atlassian.net/wiki
CONFLUENCE_EMAIL=your-email@example.com
CONFLUENCE_SPACE_KEY=your_space_key
```

**⚠️ Security:**
- NEVER commit `.env` to version control
- `.env` is in `.gitignore` by default
- Rotate tokens every 90 days
- Use minimum required permissions

## Success Criteria

A project successfully using this framework will have:
- ✅ All integrations configured and documented
- ✅ Requirements in AI-readable format with <10% ambiguity
- ✅ Zero unresolved clarifications before development
- ✅ Comprehensive development plan with task breakdown
- ✅ All user stories and tasks in Azure DevOps
- ✅ Code following domain standards (verified by agents)
- ✅ Minimum 80% test coverage
- ✅ All external interfaces mocked
- ✅ Complete documentation for operations team
- ✅ Automated CI/CD pipeline operational

## Continuous Improvement

### Metrics to Track
- Time from requirements to development start
- Requirements clarification resolution time
- Code review agent vs human findings alignment
- Test coverage trends
- Deployment success rate

### Framework Updates
This framework is versioned and should be updated based on:
- Team retrospective feedback
- New AI agent capabilities
- Emerging best practices
- Technology stack changes

Version this framework and document changes in CHANGELOG.md
