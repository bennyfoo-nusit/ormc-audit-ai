# Playwright Web Skill

Playwright + TypeScript framework conventions for web test automation. Covers locator strategy, auto-wait, web-first assertions, page object patterns, fixture extension, spec file scaffolding, environment config, execution commands, and quality checks.

This skill is the single source of truth for all Playwright-specific guidance. It is loaded when framework detection identifies Playwright (`@playwright/test` in `package.json` + `playwright.config.ts` exists). Referenced by instructions files and `copilot-instructions.md` as the active framework skill.

---

## 0. Auto-Wait & Web-First Assertions

Playwright auto-waits for elements before performing actions. Leverage this:

- **Never** use `waitForTimeout` — always use condition-based waits (URL change, load state, element state).
- Prefer web-first assertions that auto-retry until the condition is met:
  - `await expect(locator).toBeVisible()`
  - `await expect(locator).toHaveText('...')`
  - `await expect(page).toHaveURL('...')`
  - `await expect(locator).toBeEnabled()`
  - `await expect(locator).toHaveCount(n)`
- Keep waits condition-based: `waitForURL`, `waitForLoadState`, `waitForSelector` with state option.
- Prefer per-test isolation; avoid shared mutable state.

---

## 1. Workspace Context Files

When the Playwright framework is detected, read these workspace files to gather generation context:

| Path | Purpose |
|------|---------|
| `src/fixtures/base.fixture.ts` | Available fixtures and custom test function |
| `src/pages/*.page.ts` | Existing page objects and locator patterns |
| `src/pages/base.page.ts` | Shared base page helpers and assertions |
| `src/config/*.ts` | Environment config (URLs, timeouts, browser settings) |
| `src/utils/*.ts` | Reusable utilities (date, excel, json) |
| `tests/*.spec.ts` | Existing tests (avoid duplication, match conventions) |
| `playwright.config.ts` | Projects, reporters, global settings |
| `tsconfig.json` | Path aliases (`@pages/*`, `@fixtures/*`, etc.) |
| `.github/copilot-instructions.md` | Locator priority order and Playwright guidelines |

---

## 2. Smart Locator Strategy

Source of truth for locator priority. All agents and instructions files defer to this table.

**Priority order:**

| Priority | Locator | Use When |
|----------|---------|----------|
| 1 | `getByRole(role, { name })` | Interactive elements, headings with accessible names |
| 2 | `getByLabel(text)` | Form controls with visible labels |
| 3 | `getByPlaceholder(text)` | Inputs without stable labels |
| 4 | `getByText(text)` | Static content, non-interactive assertions |
| 5 | `getByTestId(id)` | Element has `data-testid` attribute |
| 6 | `locator('[data-*="..."]')` | App exposes stable custom attributes |
| 7 | `locator('css=...')` | No semantic locator exists |
| 8 | `locator('xpath=...')` | Last resort for legacy DOMs |

**Selector rules:**
- Prefer stable, intention-revealing, readable locators
- Avoid brittle chains (`nth-child`, deep DOM paths, style-driven classes)
- Scope locators to unique parent context when multiple matches exist
- Prefer maintainability/readability over shortest selector
- Use `exact: true` when text matching risks ambiguity

---

## 3. Page Object & Fixture Strategy

Before creating new files, always search existing page objects and fixtures for reusable methods.

**Decision framework:**

| Scenario | Action |
|----------|--------|
| Existing page object covers the target page | Add new methods to the existing page object |
| Shared behavior useful across multiple pages | Add method to `BasePage` (`src/pages/base.page.ts`) |
| New page with no existing page object | Create `src/pages/<feature>.page.ts` extending `BasePage` |
| Login page needed but missing | Create `src/pages/login.page.ts` following POM conventions |

**Page object creation rules:**
- Define locators as `get` accessors for lazy evaluation (existing convention)
- Use `PascalCase` for class names, `camelCase` for methods
- Keep methods small, single-purpose, and intention-revealing
- Use path aliases (`@pages/*`, `@config/*`, `@utils/*`)
- Never duplicate methods already available in `BasePage`
- Follow locator priority from Section 2

**Page object scaffolding template:**

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class <FeatureName>Page extends BasePage {
  // Locators defined as getters for lazy evaluation and auto-wait
  get <elementName>(): Locator {
    return this.page.getByRole('<role>', { name: '<accessible name>' });
  }

  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.navigate('<path>');
    await this.waitForPageLoad();
  }

  async <actionMethod>(): Promise<void> {
    // Single-purpose action method
  }

  async expect<AssertionMethod>(): Promise<void> {
    // Web-first assertion
  }
}
```

**Rules:**
- Class name: `PascalCase` matching the feature (e.g., `LoginPage`, `ChatPage`)
- File name: `kebab-case` (e.g., `login.page.ts`, `ai-chat.page.ts`)
- Locators: `get` accessors only — lazy evaluation is mandatory
- Locator strategy: follow priority order from Section 2
- Methods: `camelCase`, small, single-purpose, intention-revealing
- Return types: explicit on all exported methods
- Imports: use path aliases (`@pages/*`, `@config/*`)

---

## 4. Fixture Extension Pattern

When a new page object requires a fixture, add it to `src/fixtures/base.fixture.ts`:

```typescript
// Add to PageFixtures type
<pageName>: <PageClass>;

// Add fixture definition
<pageName>: async ({ managedPage }, use) => {
  await use(new <PageClass>(managedPage));
},
```

**Rules:**
- Add the import for the new page class at the top of the file
- Add the type to the `PageFixtures` interface
- Follow the existing `managedPage` pattern
- Use `storageStatePath` fixture option when authenticated context is needed
- Do not create separate fixture files — extend the centralized fixture

---

## 5. Spec File Generation Rules

**Framework alignment rules:**
- Keep reusable UI actions in page objects under `src/pages/`
- Keep business assertions in spec files under `tests/`
- Import `test, expect` from `@fixtures/base.fixture` — never from `@playwright/test` directly
- Reuse existing helpers/utilities before introducing new ones
- Use path aliases from `tsconfig.json`
- Do not create parallel patterns if the workspace already has an approach

**Spec file scaffolding template:**

```typescript
import { expect, test } from '@fixtures/base.fixture';

test.describe('<Feature Name>', () => {
  test('[<ADO-ID>] <descriptive behavior> @<tag>', async ({ <fixtures> }) => {
    // Step 1: Navigate / setup
    await <page>.open();

    // Step 2: Perform action (mapped from ADO test step)
    await <page>.<actionMethod>();

    // Step 3: Assert expected outcome (mapped from ADO expected result)
    await expect(<locator>).toBeVisible();
  });
});
```

**Naming and traceability:**
- Include test case ID in test title: `[<id>] <descriptive title> @tag`
- File naming: `<feature-slug>.spec.ts` (kebab-case)
- Describe block: `Feature Name` matching the functional area
- Maintain clear mapping: ADO case ID → test function → optional data file

**Design rules:**
- One business behavior per generated test
- Use deterministic, condition-based waits (never `waitForTimeout`)
- Prefer web-first assertions (`toBeVisible`, `toHaveURL`, `toHaveText`)
- Keep code strict (`strict: true` TypeScript), readable, and maintainable
- Tags: `@smoke` for critical-path flows, `@regression` for comprehensive coverage
- Use page object methods — no raw locator chains in specs
- Comments map to ADO test steps for traceability

---

## 6. Hover-Revealed Elements

When MCP inspection shows an element only appears on hover (e.g., action icons in list rows, context menu triggers):

1. Implement the interaction using `page.mouse.move()` to the parent element's bounding box coordinates.
2. Follow with `page.mouse.click()` at the icon's position.
3. Do not use `.hover()` followed by `.click()` on a child element — `.hover()` moves the mouse to the parent center, then `.click()` moves the mouse to the child which collapses the hover state before the click is registered.
4. Document hover-dependent elements in the page object with a comment explaining the interaction pattern.

---

## 7. Environment & Configuration

- Config loaded from `src/config/env.config.ts` using `dotenv`.
- `.env` keys: `BASE_URL_SIT`, `TIMEOUT`, `RETRIES`, `WORKERS`.
- Runtime env vars: `ENV`, `BROWSER`, `HEADED`, `HEADLESS`, `PW_FIREFOX`.
- `playwright.config.ts` defines projects, reporters, global settings.
- Allure reporter: `resultsDir: artifacts/allure-results`.
- Do not hardcode URLs/timeouts/retries in tests.

---

## 8. Execution Commands

| Command | Purpose |
|---------|--------|
| `npm test` | Run all tests |
| `npm run test:headed` | Run headed |
| `npm run test:smoke` | Smoke suite |
| `npm run test:regression` | Regression suite |
| `npm run test:chrome` | Chrome only |
| `npm run test:firefox` | Firefox only |
| `npm run clean` | Clean artifacts |
| `npx playwright test tests/<file>.spec.ts --retries=0 --headed --project=chrome` | Single spec verification |

**Verification run rules:**
- Always use `--retries=0` for verification (single-attempt execution)
- Use `--headed` for MCP correlation and visual debugging
- Target the specific spec file — never run the full suite during verification
- Use `--project=chrome` as the default project (or as configured in `playwright.config.ts`)

---

## 9. Framework-Specific Quality Checks

Before marking any test case as `Automated`, verify these Playwright-specific checks in addition to the generic checks in the agent:

- ✅ Imports use `@fixtures/base.fixture` — not `@playwright/test`
- ✅ All locators follow the priority order from Section 2
- ✅ No `waitForTimeout` calls in generated code
- ✅ Page object methods are used in spec — no raw locator chains in test files
- ✅ New page objects extend `BasePage` and use `get` accessor pattern for locators
- ✅ Path aliases are used (`@pages/*`, `@fixtures/*`, etc.) — no deep relative imports
- ✅ Explicit return types on all exported methods
- ✅ Locators use `exact: true` where ambiguity is possible
- ✅ Locator strategy is stable and accessible-first
- ✅ Path aliases are used (`@pages/*`, `@fixtures/*`, etc.) — no deep relative imports
- ✅ Explicit return types on all exported methods
- ✅ Locators use `exact: true` where ambiguity is possible

---

## 9. Framework-Specific Error Handling

| Error Condition | Response |
|---|---|
| Page object conflict (duplicate class name) | Extend existing page object instead of creating a new file |
| Fixture conflict (duplicate fixture name) | Reuse existing fixture; do not duplicate |
| Import path resolution failure | Verify `tsconfig.json` path aliases match filesystem |
| Playwright config missing projects | Default to `chrome` project; warn if config has no matching project |
| `playwright.config.ts` not found | Stop. Report: framework was detected but config is missing |
