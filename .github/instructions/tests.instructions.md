---
applyTo: "tests/**"
---

# Test Spec Instructions

When editing or creating files in `tests/`:
- Keep one business behavior per test.
- Use tags in test titles: `@smoke`, `@regression`.
- Follow naming: `describe('Feature Name', ...)` and `test('@tag expected behavior', ...)`.
- Call business-level page object methods — never use raw locator/selector chains in specs.
- Use deterministic, condition-based waits; never use hard-coded delays.
- Prefer assertions that auto-wait for expected state.
- Keep specs deterministic and retry-safe.
- Include ADO test case ID in test title when applicable (e.g., `[82118] Download conversation`).
- For framework-specific import rules, locator strategy, and assertion APIs, refer to the active framework skill (e.g., `test-generator-playwright-web`).
