# GitHub Copilot Instructions for AI-Assisted SDLC Framework

## Project Overview
This workspace contains a comprehensive AI-assisted SDLC framework with 9 specialized agents designed to guide projects from tech stack validation through deployment, with full integration to GitHub, Azure DevOps, and Confluence.

## Available Agents
- `@2-technical-feasibility` - Validate tech stack via proof-of-concept
- `@connectivity-agent` - Setup and validate integrations
- `@3-requirement-analyst` - Analyze requirements from Confluence and manage clarifications
- `@screen-design-agent` - Extract UI specs from designs
- `@4-project-planning` - Create development plans and task breakdowns
- `@5-product-owner` - Create Azure DevOps stories and GitHub issues
- `@6-developer` - Implement features with test-driven coverage loops and PR creation
- `@code-review-agent` - Automated code review (tech-stack specific)
- `@docs-agent` - Generate operational documentation
- `@evaluation-agent` - Evaluate agents and outputs against industry standards (ISO 25010, IEEE 830, PMBOK, OWASP, CMMI)

## Getting Started
1. Review [Credential Setup Guide](./.github/CREDENTIAL_SETUP.md) to configure authentication
2. Follow [Workflow Guide](./.github/WORKFLOW_GUIDE.md) for end-to-end process
3. Use [Prompt Templates](./.github/PROMPT_TEMPLATES.md) for common scenarios

## Key Patterns
- All documentation generated in markdown format
- Requirements follow user story format with acceptance criteria
- Architecture decisions documented as ADRs (Architecture Decision Records)
- Technology stack selections include justification and references

## Development Workflow
1. Validate tech stack with prototyping agent
2. Initialize agent with repository and project URLs
3. Follow guided requirements gathering process
4. Document architecture decisions and technology choices
5. Generate comprehensive project documentation
6. Link all artifacts to appropriate tools (GitHub, Azure DevOps, Confluence)

## File Conventions
- Agent definitions: `{agent-name}.agent.md` in `/.github/agents/`
- Templates: `/.github/ISSUE_TEMPLATE/` directory
- Generated docs: `docs/` directory, follow standard markdown formatting