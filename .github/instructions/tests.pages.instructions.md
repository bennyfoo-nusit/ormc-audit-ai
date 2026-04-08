---
applyTo: "src/pages/**"
---

# Page Object Instructions

When editing or creating files in `src/pages/`:
- Define locators/selectors as lazy-evaluated accessors (existing convention).
- Prefer stable, user-centric locator strategies — role-based > label > text > test-id > CSS > XPath.
- Keep methods small, single-purpose, and intention-revealing (`open`, `loginAs`, `expectRedirectTo...`).
- Add shared actions/assertions to the base page class first if broadly useful across pages.
- Use `PascalCase` for class names, `camelCase` for methods/variables.
- Use path aliases (`@pages/*`, `@config/*`, `@utils/*`) — avoid deep relative imports.
- Never add hard-coded delays — use condition-based waits.
- For framework-specific locator APIs, assertion helpers, and wait mechanisms, refer to the active framework skill (e.g., `test-generator-playwright-web`).
