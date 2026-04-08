# Test Generator — Playwright MCP Web Skill

Playwright MCP exploration workflow for web applications. Covers session isolation, browser lifecycle, credential handling, live application analysis, and conflict resolution.

This skill is loaded when the Test Generator Agent needs to inspect a web application via Playwright MCP before generating automation code. It is framework-agnostic in intent (observing the app) but uses Playwright MCP as the browser automation tool for exploration.

---

## 1. Session Isolation Requirement

Every MCP exploration session must start with a clean browser context. The agent must never reuse, load, or cache any SSO session, storage state, cookies, or authentication tokens between exploration runs. This ensures the observed login flow and application state reflect what a new user experiences, not a previously authenticated session.

---

## 2. Pre-Launch Chrome Cleanup (Mandatory)

Before initiating any Playwright MCP browser session, execute this 3-step sequence in exact order. All steps are mandatory — do not skip any.

**Step 1:** Close all existing Chrome browser instances on the machine:
```
pkill -x "Google Chrome" || true
```
Wait for exit code 0. This kills the user's regular Chrome but does **not** terminate the Playwright MCP's separate Chromium process or clear its profile.

**Step 2:** Call `mcp_microsoft_pla_browser_close` to shut down the MCP's own browser process. This is the critical step for session isolation — without it, the MCP browser will reopen with its prior cookies, storage, and authenticated session state intact.

**Step 3:** Call `mcp_microsoft_pla_browser_navigate` → `about:blank` to launch a fresh browser instance with an empty context.

Wait for all three steps to complete before proceeding to application navigation.

---

## 3. Mandatory Browser Launch Rules

- Always launch the browser with a fresh, empty context (no `storageState`, no saved cookies, no session storage).
- Do not call `mcp_microsoft_pla_browser_install` or any equivalent command that loads a pre-authenticated state.
- Do not save or persist context state (cookies, local storage, session storage) at any point during or after exploration.
- If the MCP browser retains state from a prior session, close and relaunch before navigating.

---

## 4. Login-Page Implementation Trigger

During MCP analysis, if the flow lands on a login page and no login page object exists in the workspace:

1. Create `src/pages/login.page.ts` extending `BasePage`, following repository POM conventions.
2. Use stable, accessible-first locators per `.github/copilot-instructions.md` (locator priority order).
3. Keep login interactions in the login page object — do not inline login locator chains in specs.
4. Add a `loginPage` fixture in `src/fixtures/base.fixture.ts` following the existing fixture pattern.
5. Document the login flow steps observed during MCP exploration (page transitions, prompts, redirects).

---

## 5. Credential Handling for MCP Sessions

When a flow requires authentication:

1. Check `.env` for `TEST_USERNAME` first; if absent, explicitly prompt the user for username.
2. Check `.env` for `TEST_PASSWORD` first; if absent, explicitly prompt the user for the password.
3. If both are missing, prompt in strict order: username first, then password.
4. After collecting credentials from the user, persist them in the workspace `.env` file for reuse:
   - Store as `TEST_USERNAME=<value>` and `TEST_PASSWORD=<value>`
   - If either key already exists in `.env`, update its value instead of duplicating keys
5. Do not invent, hardcode, or reuse guessed credentials.
6. Do not log credentials in execution notes, test data, reports, or console output.

---

## 6. Required MCP Activities

For each test case, perform the following analysis before writing code:

| Activity | Purpose |
|----------|---------|
| Navigate to application URL (from `docs/projectassetlocation`) | Establish starting state |
| Walk through the test case flow step by step | Validate navigation and interaction sequence |
| Inspect DOM/ARIA structure at each key step | Identify stable locator candidates |
| Validate element visibility, enabled state, loading behavior | Avoid flaky selectors |
| Confirm URL transitions and content state changes | Validate assertion targets |
| Capture evidence of dynamic behavior (loading spinners, conditional elements) | Inform wait strategy |
| Take snapshots at critical interaction points | Document observed state for code generation |

Do not rely solely on static test-plan text when live inspection is available.

---

## 7. Post-Exploration Browser Close (Mandatory)

Once MCP exploration is complete for a test case (all required page states, selectors, and flow transitions have been captured):

1. Close the Playwright MCP browser immediately using `mcp_microsoft_pla_browser_close`.
2. Do not leave the MCP browser open between test case generations.
3. This prevents accumulated browser state from polluting subsequent exploration sessions and frees system resources.

---

## 8. Multi-Step Auth Flow Completeness

When the test case flow requires authentication, the MCP exploration must walk through the full credential login end-to-end:

- Walk through every post-authentication prompt (e.g., "Stay signed in?", MFA, consent screens, account pickers).
- Do not stop at the first successful credential entry.
- Document every intermediate page or dialog in the auth chain.
- If any step was reached via a shortcut (e.g., cached account picker), re-attempt from a fully unauthenticated state to capture all prompts.
- Record the complete auth flow sequence for generating the login page object.

---

## 9. MCP vs. Plan Conflict Resolution

When MCP observations conflict with test plan text:

| Situation | Action |
|-----------|--------|
| App behavior differs from plan steps but intent is clear | Implement according to validated live behavior |
| App behavior differs and intent is ambiguous | Record discrepancy, mark as blocker, do not guess |
| App has additional steps not in the plan (e.g., new confirmation dialog) | Include the observed steps in automation, note the addition |
| Plan describes elements that no longer exist | Report as a potential feature removal, mark as blocker |

**Rule:** Treat the plan as intent and the app as current truth. Implement according to validated behavior when safe; record discrepancies in execution notes.

---

## 10. Hover-Revealed Elements

When MCP inspection shows an element only appears on hover (e.g., action icons in list rows, context menu triggers):

1. Implement the interaction using `page.mouse.move()` to the parent element's bounding box coordinates.
2. Follow with `page.mouse.click()` at the icon's position.
3. Do not use `.hover()` followed by `.click()` on a child element — `.hover()` moves the mouse to the parent center, then `.click()` moves the mouse to the child which collapses the hover state before the click is registered.
4. Document hover-dependent elements in the page object with a comment explaining the interaction pattern.
