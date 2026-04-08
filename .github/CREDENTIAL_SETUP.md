# Credential Setup Guide

This guide provides step-by-step instructions for setting up Personal Access Tokens (PATs) for GitHub, Azure DevOps, and Confluence.

## Overview

The AI-Assisted SDLC framework requires API access to:
- **GitHub** - Repository management, issue tracking, PR creation
- **Azure DevOps** - Work item management, sprint planning, pipelines
- **Confluence** - Requirements documentation, technical specs

## Security Best Practices

⚠️ **Important Security Notes:**
- Never commit tokens to version control
- Store tokens in environment variables or secure vaults
- Use minimum required permissions
- Rotate tokens regularly (every 90 days recommended)
- Keep tokens confidential - treat like passwords

---

## GitHub Personal Access Token (PAT)

### Step 1: Generate Token

1. **Navigate to GitHub Settings**
   - Go to https://github.com/settings/tokens
   - Or: Click your profile picture → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Create New Token**
   - Click "Generate new token" → "Generate new token (classic)"
   - Enter note: `AI-SDLC Framework - NUSIT`
   - Set expiration: 90 days (recommended) or custom

3. **Select Required Scopes**
   
   ✅ **Required Scopes:**
   - `repo` (Full control of private repositories)
     - `repo:status` - Access commit status
     - `repo_deployment` - Access deployment status
     - `public_repo` - Access public repositories
     - `repo:invite` - Access repository invitations
     - `security_events` - Read and write security events
   
   - `write:packages` (Upload packages to GitHub Package Registry)
   
   - `read:org` (Read org and team membership)
   
   - `project` (Full control of projects)

4. **Generate and Copy Token**
   - Click "Generate token"
   - **⚠️ Copy immediately** - you won't see it again!
   - Store securely (see Storage Options below)

### Step 2: Verify Token

```bash
# Test GitHub token
curl -H "Authorization: token YOUR_GITHUB_TOKEN" https://api.github.com/user

# Expected response: Your GitHub user information
```

### Token Permissions Explained

| Permission | Why Needed | Used By |
|------------|-----------|----------|
| `repo` | Create/update issues, PRs, manage repository | All agents |
| `write:packages` | Deploy packages if needed | Documentation Agent |
| `read:org` | Access organization repositories | Connectivity Agent |
| `project` | Manage GitHub Projects for tracking | Product Owner |

---

## Azure DevOps Personal Access Token (PAT)

### Step 1: Generate Token

1. **Navigate to Azure DevOps**
   - Go to https://dev.azure.com/{your-organization}
   - Click on User Settings (icon) in top-right
   - Select "Personal access tokens"

2. **Create New Token**
   - Click "+ New Token"
   - Name: `AI-SDLC Framework - {Project Name}`
   - Organization: Select your organization
   - Expiration: 90 days (recommended) or custom

3. **Select Required Scopes**
   
   ✅ **Required Scopes:**
   
   **Work Items:**
   - `Work Items` - Read, write, & manage
   
   **Code:**
   - `Code` - Read & write
   
   **Build:**
   - `Build` - Read & execute
   
   **Release:**
   - `Release` - Read, write, & execute
   
   **Project and Team:**
   - `Project and Team` - Read, write, & manage
   
   **Graph:**
   - `Graph` - Read
   
   **Test Management:**
   - `Test Management` - Read & write
   
   **Wiki:**
   - `Wiki` - Read & write

4. **Create and Copy Token**
   - Click "Create"
   - **⚠️ Copy immediately** - you won't see it again!
   - Store securely

### Step 2: Verify Token

```bash
# Test Azure DevOps token
curl -u :YOUR_AZURE_DEVOPS_TOKEN \
  https://dev.azure.com/{organization}/_apis/projects?api-version=6.0

# Expected response: List of your projects
```

### Token Scopes Explained

| Scope | Why Needed | Used By |
|-------|-----------|---------|
| Work Items | Create stories, tasks, bugs | Product Owner, Project Planning |
| Code | Access repositories, commits | All agents |
| Build | Trigger builds, get build status | Documentation Agent |
| Release | Deploy and track releases | Documentation Agent |
| Project and Team | Access project structure, iterations | Product Owner |
| Test Management | Create test plans, test cases | Project Planning |
| Wiki | Access Azure DevOps wikis | Requirement Analyst (if used instead of Confluence) |

---

## Confluence API Token

### Step 1: Generate Token

1. **Navigate to Atlassian Account Settings**
   - Go to https://id.atlassian.com/manage-profile/security/api-tokens
   - Or: Click your profile → Manage account → Security → API tokens

2. **Create API Token**
   - Click "Create API token"
   - Label: `AI-SDLC Framework - {Project Name}`
   - Click "Create"

3. **Copy Token**
   - **⚠️ Copy immediately** - you won't see it again!
   - Store securely

### Step 2: Get Your Confluence Details

You'll also need:
- **Email Address**: Your Atlassian account email
- **Site URL**: Your Confluence site (e.g., `https://yourcompany.atlassian.net`)
- **Space Key**: The key of your Confluence space (e.g., "PROJ")

To find your Space Key:
1. Go to your Confluence space
2. Click "Space settings" in sidebar
3. Space key is shown at the top

### Step 3: Verify Token

```bash
# Test Confluence token
curl -u your-email@example.com:YOUR_CONFLUENCE_TOKEN \
  https://yourcompany.atlassian.net/wiki/rest/api/space

# Expected response: List of spaces you have access to
```

### Authentication Method

Confluence uses **Basic Authentication** with:
- **Username**: Your Atlassian account email
- **Password**: Your API token (not your account password)

---

## Token Storage Options

### Option 1: Environment Variables (Recommended for Local Development)

Create a `.env` file in your project root:

```bash
# .env file
# ⚠️ Add .env to .gitignore to prevent committing!

# GitHub
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_REPOSITORY=your-org/your-repo

# Azure DevOps
AZURE_DEVOPS_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AZURE_DEVOPS_ORG=your-organization
AZURE_DEVOPS_PROJECT=YourProject

# Confluence
CONFLUENCE_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
CONFLUENCE_URL=https://yourcompany.atlassian.net/wiki
CONFLUENCE_EMAIL=your-email@example.com
CONFLUENCE_SPACE_KEY=PROJ
```

**Load environment variables:**

```bash
# On Linux/Mac
source .env

# Or use dotenv
npm install dotenv
# Then in your code: require('dotenv').config()
```

### Option 2: Azure Key Vault (For Production)

```bash
# Store secrets in Azure Key Vault
az keyvault secret set \
  --vault-name your-keyvault \
  --name github-token \
  --value "your-token"

# Retrieve in application
az keyvault secret show \
  --vault-name your-keyvault \
  --name github-token \
  --query value -o tsv
```

### Option 4: VS Code Settings (User-Level)

For personal VS Code usage:

1. Open VS Code Settings (Cmd/Ctrl + ,)
2. Search for "terminal.integrated.env"
3. Edit settings.json:

```json
{
  "terminal.integrated.env.osx": {
    "GITHUB_TOKEN": "your-token",
    "AZURE_DEVOPS_TOKEN": "your-token"
  },
  "terminal.integrated.env.linux": {
    "GITHUB_TOKEN": "your-token",
    "AZURE_DEVOPS_TOKEN": "your-token"
  },
  "terminal.integrated.env.windows": {
    "GITHUB_TOKEN": "your-token",
    "AZURE_DEVOPS_TOKEN": "your-token"
  }
}
```

---

## MCP Extension Setup for VS Code

After generating your Personal Access Tokens, install and configure the Model Context Protocol (MCP) extension in VS Code to enable AI-powered integration tools.

### Step 1: Install MCP Extension

1. **Open VS Code**

2. **Open Extensions Marketplace:**
   - Click Extensions icon in sidebar (or press `Cmd+Shift+X` / `Ctrl+Shift+X`)
   - In the search box, type: `@mcp`
   - Find "Github", "Atlassian" & "Azure DevOps" extension
   - Click "Install" for each extension

3. **Restart VS Code** after installation

### Step 2: Configure GitHub MCP Server

1. **Access MCP Settings in VS Code:**
   - Click the Extensions icon in the sidebar
   - Find "Model Context Protocol" extension
   - Click the gear icon ⚙️ next to the extension
   - Select "Extension Settings"
   - Or press `Cmd+Shift+P` / `Ctrl+Shift+P` and type "MCP: Edit Configuration"

2. **Add Node.js-based GitHub MCP Server:**
   
   In the MCP settings, add the following configuration:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_TOKEN": ""
      }
    }
  }
}
```

3. **Add Your GitHub Classic Token:**
   - When prompted or in the `GITHUB_TOKEN` field, paste your GitHub Personal Access Token (classic) generated in earlier steps
   - The token should look like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Ensure no extra spaces before or after the token

4. **Save the Configuration:**
   - Save the settings file
   - Close and reopen VS Code to load the new configuration

### Step 3: Test GitHub MCP Connectivity

1. **Restart VS Code** completely

2. **Test Basic Connection:**
   - Open GitHub Copilot Chat (`Cmd+I` / `Ctrl+I`)
   - Type: `@mcp get my GitHub user info`
   - Expected: Your GitHub username and profile details

3. **Test Repository Access:**
   - In Copilot Chat, type:
     ```
     @mcp can you access the repository https://github.com/sgnus-it/nusit-ai-sdlc?
     ```
   - Expected: Confirmation of repository access with repo details

4. **Verify Full Integration:**
   - Type: `@mcp list repositories for sgnus-it`
   - Expected: List of accessible repositories in the organization

**✅ Success Indicators:**
- GitHub username displayed correctly
- Repository details retrieved successfully
- No authentication errors

**❌ If Connection Fails:**
- Verify token is correctly pasted (no spaces)
- Check token hasn't expired
- Ensure token has `repo` scope enabled
- Restart VS Code completely

### Step 4: Configure and Test Azure DevOps MCP

After GitHub is working, configure Azure DevOps MCP server:

1. **Update MCP Configuration:**

   Add Azure DevOps server to your existing configuration:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "your_github_token_here"
      }
    },
    "azure-devops": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-azure-devops"],
      "env": {
        "AZURE_DEVOPS_TOKEN": "YOUR_AZURE_DEVOPS_PAT_HERE",
        "AZURE_DEVOPS_ORG": "nusit-aat-ad"
      }
    }
  }
}
```

2. **⚠️ Important Configuration Notes:**
   - **Organization Name:** Set to `nusit-aat-ad` (do not change this)
   - Replace `YOUR_AZURE_DEVOPS_PAT_HERE` with your Azure DevOps PAT from earlier steps
   - **No project configuration needed** - MCP will work across all projects in the organization
   - Projects are specified in commands when needed

3. **Save and Restart:**
   - Save the MCP configuration file
   - Close and reopen VS Code completely

4. **Test Azure DevOps MCP Connectivity:**
   
   - Open GitHub Copilot Chat (`Cmd+I` / `Ctrl+I`)
   - Type: `@mcp list Azure DevOps projects for nusit-aat-ad`
   - Expected: List of all accessible projects in the organization

5. **Verify Full Integration:**
   - Test work items access (specify project in the command):
     ```
     @mcp list work items in [your-project-name]
     ```
   - Expected: List of work items or confirmation of access

**✅ Success Indicators:**
- Organization "nusit-aat-ad" recognized
- Projects list displayed correctly
- No authentication errors

**❌ If Connection Fails:**
- Verify token is correctly pasted
- Check token has required scopes (Work Items, Code, Build)
- Ensure organization name is exactly `nusit-aat-ad`
- Restart VS Code completely

### Step 5: Configure Confluence MCP (Optional)

If you need Confluence integration, add the Atlassian MCP server with HTTP type and OAuth 2.0 web-based authentication:

```json
{
  "mcpServers": {
    "github": { /* ... existing config ... */ },
    "azure-devops": { /* ... existing config ... */ },
    "com.atlassian/atlassian-mcp-server": {
      "type": "http",
      "url": "https://mcp.atlassian.com/v1/mcp",
      "gallery": "https://api.mcp.github.com",
      "version": "1.1.1"
    }
  }
}
```

**Configuration Details:**
- **Authentication Type:** HTTP with OAuth 2.0 web-based authentication
- **type:** Set to `http` for cloud-hosted MCP server
- **url:** Atlassian MCP server endpoint
- **version:** MCP server version (1.1.1 or latest)

**Save and Reload:**
1. Save the mcp.json file
2. Reload VS Code window: `Cmd+Shift+P` → "Developer: Reload Window"
3. Follow OAuth 2.0 authentication prompts when first using Copilot Chat

**Test Confluence Connectivity:**

In Copilot Chat, run:
```
@mcp test Confluence connectivity
```

Or test specific operations:
- `@mcp list Confluence spaces`
- `@mcp search Confluence pages`
- `@mcp get Confluence page [page-id]`

### Step 6: Available MCP Tools

Once configured, you can use these tools via Copilot Chat:

**GitHub:**
- `@mcp get my GitHub user info`
- `@mcp create GitHub issue in sgnus-it/nusit-ai-sdlc`
- `@mcp create pull request`
- `@mcp list repositories for sgnus-it`
- `@mcp search code in repository`

**Azure DevOps:**
- `@mcp list Azure DevOps projects for nusit-aat-ad`
- `@mcp create work item`
- `@mcp list work items in [project-name]`
- `@mcp update work item`

**Confluence:**
- `@mcp list Confluence spaces`
- `@mcp get Confluence page`
- `@mcp create Confluence page`
- `@mcp search Confluence pages`

### Troubleshooting MCP Setup

**"MCP server not responding"**
- Ensure Node.js is installed: `node --version`
- Check internet connection for npx to download packages
- Restart VS Code completely

**"Authentication failed"**
- Verify PAT is correctly copied (no extra spaces)
- Check token hasn't expired
- Ensure token has required scopes

**"Command not found"**
- Install Node.js from https://nodejs.org
- Verify npx is available: `npx --version`

---

## Verification Checklist

After setting up all credentials and MCP, verify everything works:

### 1. Create .env File
```bash
cd your-project
touch .env
# Add all tokens (see template above)
```

### 2. Add .env to .gitignore
```bash
echo ".env" >> .gitignore
```

### 3. Test MCP Integration
```
# In VS Code Copilot Chat
@mcp get my GitHub user info
@mcp list Confluence spaces
@mcp list Azure DevOps projects
```

### 4. Test Connectivity Agent
```
@connectivity-agent validate
```

Expected output:
```
✅ GitHub: Connected to your-org/your-repo
✅ Azure DevOps: Connected to your-org/YourProject
✅ Confluence: Connected to space PROJ
```

### 5. Common Issues

**"401 Unauthorized"**
- Token expired or invalid
- Regenerate token and update .env

**"403 Forbidden"**
- Token lacks required permissions
- Check scopes/permissions above
- Create new token with correct permissions

**"404 Not Found"**
- Wrong organization/project/space name
- Verify URLs and names in .env
- Check you have access to the resource

**"Network Error"**
- Check internet connection
- Verify firewall/proxy settings
- Confirm service URLs are correct

---

## Security Checklist

Before starting development:

- [ ] Created all required tokens (GitHub, Azure DevOps, Confluence)
- [ ] Tokens have minimum required permissions only
- [ ] MCP extension installed in VS Code
- [ ] MCP configuration file created with tokens
- [ ] Tokens stored in .env file
- [ ] .env file added to .gitignore
- [ ] .env file NOT committed to git
- [ ] MCP connection verified for all services
- [ ] Calendar reminder set for token rotation (90 days)
- [ ] Tokens verified with test commands
- [ ] Connectivity agent validation passed
- [ ] Team members have generated their own tokens (never share!)

---

## Token Rotation

### When to Rotate

- Every 90 days (recommended)
- When team member leaves project
- If token potentially compromised
- After security audit

### How to Rotate

1. **Generate new token** (same process as above)
2. **Update .env file** with new token
3. **Test connectivity**: `@connectivity-agent validate`
4. **Revoke old token** in respective platform
5. **Update team members** if using shared environment

---

## Getting Help

### GitHub Token Issues
- Documentation: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
- Support: https://support.github.com

### Azure DevOps Token Issues
- Documentation: https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate
- Support: https://developercommunity.visualstudio.com

### Confluence Token Issues
- Documentation: https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/
- Support: https://support.atlassian.com

---

## Example: Complete Setup Script

```bash
#!/bin/bash
# setup-credentials.sh
# Interactive script to help set up credentials

echo "🔐 AI-SDLC Framework Credential Setup"
echo "======================================"
echo ""

# Create .env file
cat > .env << 'EOF'
# GitHub Configuration
GITHUB_TOKEN=
GITHUB_REPOSITORY=

# Azure DevOps Configuration
AZURE_DEVOPS_TOKEN=
AZURE_DEVOPS_ORG=
AZURE_DEVOPS_PROJECT=

# Confluence Configuration
CONFLUENCE_TOKEN=
CONFLUENCE_URL=
CONFLUENCE_EMAIL=
CONFLUENCE_SPACE_KEY=
EOF

echo "✅ Created .env template"
echo ""
echo "📝 Next Steps:"
echo "1. Edit .env file and add your tokens"
echo "2. Get tokens from:"
echo "   - GitHub: https://github.com/settings/tokens"
echo "   - Azure DevOps: https://dev.azure.com/{org}/_usersSettings/tokens"
echo "   - Confluence: https://id.atlassian.com/manage-profile/security/api-tokens"
echo ""
echo "3. Run: @connectivity-agent validate"
echo ""

# Add .env to .gitignore if not already there
if ! grep -q "^\.env$" .gitignore 2>/dev/null; then
    echo ".env" >> .gitignore
    echo "✅ Added .env to .gitignore"
fi
```

**Usage:**
```bash
chmod +x setup-credentials.sh
./setup-credentials.sh
```

---

**Last Updated:** January 29, 2026  
**Framework Version:** 1.0.0
