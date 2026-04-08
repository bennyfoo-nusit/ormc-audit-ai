# GitHub Copilot Custom Agents

This directory contains custom agents for the AI-Assisted SDLC Framework. These agents appear in the GitHub Copilot agent dropdown menu in VS Code.

## Available Agents

### 1. @2-technical-feasibility
**Description:** Validate tech stack choices through rapid proof-of-concept prototyping before full SDLC commitment  
**Usage:** `@2-technical-feasibility init`, `@2-technical-feasibility modify {field}`, `@2-technical-feasibility status`, `@2-technical-feasibility extend {type} {name}`, `@2-technical-feasibility spike {capability}`, `@2-technical-feasibility check-integrations`, `@2-technical-feasibility benchmark`, `@2-technical-feasibility security-check`, `@2-technical-feasibility estimate-cost`, `@2-technical-feasibility decide`, `@2-technical-feasibility summary`

### 2. @connectivity-agent
**Description:** Configure and validate integrations to GitHub, Azure DevOps, and Confluence  
**Usage:** `@connectivity-agent setup` or `@connectivity-agent validate`

### 3. @3-requirement-analyst
**Description:** Transform Confluence requirements into structured, machine-parseable documentation  
**Usage:** `@3-requirement-analyst analyze [confluence-url]`

### 4. @screen-design-agent
**Description:** Analyze UI/UX designs and extract technical requirements and assets  
**Usage:** `@screen-design-agent analyze [design-url]`

### 5. @4-project-planning
**Description:** Create development plans, task breakdowns, and implementation roadmaps  
**Usage:** `@4-project-planning create-plan`

### 6. @5-product-owner
**Description:** Create user stories and tasks in Azure DevOps and GitHub Issues  
**Usage:** `@5-product-owner create-stories`

### 7. @code-review-agent
**Description:** Automated code review for coding standards, security, and best practices  
**Usage:** `@code-review-agent review [tech-stack]`

### 8. @docs-agent
**Description:** Generate operational documentation, deployment guides, and API docs  
**Usage:** `@docs-agent generate`

## How to Use

1. **Reload VS Code** after any changes to agent files:
   - `Cmd+Shift+P` → "Developer: Reload Window"

2. **Open Copilot Chat** and type `@` to see the agent dropdown

3. **Select an agent** and provide your request

4. **Follow the prompts** as the agent guides you through the process

## Agent File Structure

Each agent file follows this structure:
```markdown
---
name: agent-name
description: Brief description of the agent
---

# Agent Title

## Identity
[Agent's role and responsibilities]

## Purpose
[What the agent does]

## Capabilities
[List of what the agent can do]

## Instructions
[Detailed workflow and commands]
```

## Workflow Sequence

Follow this recommended sequence when starting a new project:

1. **@2-technical-feasibility** - Validate tech stack via proof-of-concept
2. **@connectivity-agent** - Set up all integrations
3. **@3-requirement-analyst** - Analyze requirements from Confluence and manage clarifications
4. **@screen-design-agent** - Extract UI/UX requirements
5. **@4-project-planning** - Create development plan
6. **@5-product-owner** - Create work items and issues
7. **@code-review-agent** - Review code during development
8. **@docs-agent** - Generate documentation

## Troubleshooting

**Agents not appearing in dropdown:**
- Ensure you've reloaded VS Code window
- Verify YAML frontmatter is present in each agent file
- Check that files are in `.github/copilot/` directory

**Agent not responding correctly:**
- Check the agent's instructions in its `.md` file
- Ensure all prerequisites are met (e.g., integrations configured)
- Verify MCP tools are properly installed (if needed)

## Maintenance

**Original agent files location:** `.github/agents/{agent-name}/`  
**Active agent files:** `.github/copilot/{agent-name}.md`

When updating agents, edit both locations to maintain consistency:
1. Update the source in `.github/agents/{agent-name}/agent.md`
2. Copy to `.github/copilot/{agent-name}.md`
3. Reload VS Code

## References

- [CREDENTIAL_SETUP.md](../CREDENTIAL_SETUP.md) - Integration setup guide
- [WORKFLOW_GUIDE.md](../WORKFLOW_GUIDE.md) - Complete workflow documentation
- [PROMPT_TEMPLATES.md](../PROMPT_TEMPLATES.md) - Example prompts for each agent
