---
applyTo: '{test,tests,playwright-tests}/**/*.{ts,tsx}'
---

# Testing Rules

- Prefer deterministic assertions over timing thresholds and arbitrary sleeps.
- Test behavior at the narrowest useful layer.
- Use accessible browser selectors and explicit state cleanup.
- Separate unit, integration, browser, provider, and human evidence.
- Authorization changes require both allowed and denied cases.
- A skipped or unconfigured profile is not a pass.
