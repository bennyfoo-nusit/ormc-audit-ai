# test-planning-explore Skill

This skill contains the Playwright MCP exploration workflow for the Test Planning Agent. Load this skill when the user invokes the `explore` command.

---

## Explore Command — Discover User Flows via Playwright MCP

### Purpose
The `explore` command navigates to the application URL (from `docs/projectassetlocation`), discovers all visible user flows by interacting with the live application via Playwright MCP, and generates a test plan covering every discovered flow.

### Command Syntax

| Command | Description |
|---------|-------------|
| `explore` | Explore the application and generate a test plan for all discovered user flows |

### Inputs
- `docs/projectassetlocation`: read to obtain **Application Name** and **Application URL**
- Credentials: check `.env` for `TEST_USERNAME` and `TEST_PASSWORD`; prompt if absent

### Pre-Exploration Setup

1. Read `docs/projectassetlocation` to obtain **Application Name** and **Application URL**. If the file does not exist, stop:
   > `docs/projectassetlocation` was not found. Please run `@connectivity-agent setup` to configure project assets, then retry.
2. Write (or update) the Application URL to `.env` as `BASE_URL_SIT=<value>`.

### Session Isolation Requirement
Every MCP exploration session must start with a clean browser context. The agent must never reuse, load, or cache any SSO session, storage state, cookies, or authentication tokens between exploration runs.

### Mandatory MCP Browser Launch Sequence
Follow exactly in this order:
1. `pkill -x "Google Chrome" || true` — wait for exit code 0 (kills user's Chrome; does NOT clear the MCP browser session)
2. `mcp_microsoft_pla_browser_close` — shuts down the MCP's own browser process and discards its accumulated page/tab state
3. `mcp_microsoft_pla_browser_navigate` → `about:blank` — launches a fresh browser instance

Mandatory browser launch rules:
- Always launch the browser with a fresh, empty context (no `storageState`, no saved cookies, no session storage).
- Do not call `mcp_microsoft_pla_browser_install` or any equivalent command that loads a pre-authenticated state.
- Do not save or persist context state at any point during or after exploration.

### Credential Handling for MCP Sessions
- Check `.env` for `TEST_USERNAME` first; if absent, prompt the user for username.
- Check `.env` for `TEST_PASSWORD` first; if absent, prompt the user for password.
- If both are missing, prompt in strict order: username first, then password.
- After collecting credentials, persist them in `.env` (`TEST_USERNAME=<value>`, `TEST_PASSWORD=<value>`).
- If either key already exists in `.env`, update its value instead of duplicating keys.
- Never invent, hardcode, or reuse guessed credentials.
- Never log credentials in execution notes, test plans, reports, or console output.

### Multi-Step Auth Flow Completeness Rule
Walk the full credential login end-to-end — including every post-authentication prompt (e.g., "Stay signed in?", MFA, consent screens, account pickers). Do not stop at the first successful credential entry. Document every intermediate page or dialog in the auth chain.

### Exploration Workflow

1. Navigate to the Application URL using `mcp_microsoft_pla_browser_navigate`.
2. Take a snapshot (`mcp_microsoft_pla_browser_snapshot`) to capture the landing page state.
3. If the landing page is a login page:
   - Complete authentication using credentials from `.env` or prompted from user.
   - Walk through all auth prompts (see Multi-Step Auth Flow Completeness Rule).
   - Take a snapshot after successful authentication.
4. **Discover navigation structure:**
   - Inspect the main navigation (menus, sidebars, tabs, breadcrumbs) via snapshot.
   - List all discoverable navigation links and sections.
5. **Systematically explore each navigation item:**
   - For each top-level navigation item:
     a. Click/navigate to the section using `mcp_microsoft_pla_browser_click`.
     b. Take a snapshot to capture the page state.
     c. Identify interactive elements (forms, buttons, tables, filters, dialogs).
     d. Record the user flow: what actions are available, what inputs are expected, what transitions occur.
     e. Explore sub-navigation if present (repeat a-d).
   - For each discovered form or interactive flow:
     a. Document the fields, required/optional indicators, validation messages.
     b. Attempt a positive flow (valid data) and record the outcome.
     c. Attempt a negative flow (invalid/empty data) and record validation behavior.
6. **Document each discovered flow** with:
   - Flow name and description
   - Page URL and title
   - Step-by-step interaction sequence
   - Observed validation rules and error messages
   - Observed state transitions
7. Close the browser: `mcp_microsoft_pla_browser_close`.

### Post-Exploration Browser Close
Once exploration is complete, close the Playwright MCP browser immediately using `mcp_microsoft_pla_browser_close`. Do not leave the browser open. This prevents accumulated browser state from polluting subsequent sessions.

### Test Plan Generation from Exploration

After exploration is complete:
1. Group discovered flows by functional area.
2. For each flow, generate test cases (Positive, Negative, Edge) grounded in **observed behavior only**.
3. Load the **test-planning-templates** skill (`/.github/skills/test-planning-templates/SKILL.md`) for the explore output template.
4. Generate `test-plan/explore-<app-slug>-test-plan.md` using the Explore Mode template.
5. All test case steps must reflect actions and expected results that were **actually observed** during MCP exploration — do not invent steps not grounded in observed behavior.

### Guardrails for Explore
- Do not invent user flows that were not observed during MCP exploration.
- Do not assume functionality exists behind disabled or hidden elements.
- Document inaccessible sections with the reason (e.g., permission denied, feature disabled).
- Credential rules from the agent's Section 6 apply — never expose credentials in the test plan.
- If the application is unreachable or login fails after reasonable attempts, stop and report the blocker.

### Error Handling for Explore

| Error Condition | Agent Response |
|---|---|
| Application URL unreachable | Stop. Report URL and error. Suggest checking `docs/projectassetlocation`. |
| Login fails (invalid credentials) | Prompt user to re-enter credentials. Retry once. If still failing, stop and report. |
| MCP browser fails to launch | Stop. Suggest closing all Chrome windows and retrying. |
| Page loads but is empty/broken | Take screenshot as evidence. Record in Risks/Gaps. Continue with other flows. |
| Navigation element not clickable | Record as blocked flow. Continue with remaining navigation items. |
