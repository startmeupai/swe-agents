# TypeScript Rules

Apply these rules to TypeScript sources and tests (`**/*.{ts,tsx,mts,cts}`).

- Use `pnpm` for project commands: `pnpm install --frozen-lockfile`,
  `pnpm lint`, `pnpm typecheck`, and `pnpm test`.
- Keep compiler `strict` mode on; never loosen compiler or lint settings to make
  a change pass.
- Use strict typing and avoid `any`; type untrusted values as `unknown` and
  narrow them.
- Define boundary and domain types before implementation.
- Validate untrusted data at the boundary with a schema before treating it as a
  typed domain value.
- Do not silence the checker with `@ts-ignore`, `@ts-nocheck`, or unchecked
  casts; fix the type or the code.
- Import from definitive source files; avoid pass-through re-export modules.
- Keep transport, business logic, and persistence boundaries explicit.
- Use typed, sanitized errors at external boundaries.
- Test files typecheck under the same compiler settings as production code.
