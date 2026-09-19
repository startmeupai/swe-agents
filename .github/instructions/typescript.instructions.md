---
applyTo: '**/*.{ts,tsx,mts,cts}'
---

# TypeScript Rules

- Use strict typing and avoid `any`.
- Define boundary and domain types before implementation.
- Import from definitive source files; avoid pass-through re-export modules.
- Validate untrusted data before treating it as a typed domain value.
- Keep transport, business logic, and persistence boundaries explicit.
- Use typed, sanitized errors at external boundaries.
