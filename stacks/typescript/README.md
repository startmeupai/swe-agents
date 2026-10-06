# TypeScript Pack

Language pack for strictly typed TypeScript codebases that run their project
commands through `pnpm`.

## Scope

The pack owns TypeScript-specific delivery and testing: type and domain
modeling, schema-validated boundaries, import hygiene, typed errors, and
deterministic type-checked tests. Stack-neutral procedure, such as layer
sequencing and test-layer choice, stays in the core `feature-implementation`
and `test-generation` skills, which the pack personas load alongside their own.

## What It Adds

| Kind | Name | Purpose |
| --- | --- | --- |
| Rules | [`AGENTS.md`](AGENTS.md) | Strict mode, `unknown` boundaries, imports, typed errors, and `pnpm` |
| Persona | [`typescript-feature-agent`](agents/typescript-feature-agent.md) | Strictly typed feature delivery with exhaustive domain models |
| Persona | [`typescript-test-agent`](agents/typescript-test-agent.md) | Deterministic, type-checked unit, component, and integration tests |
| Skill | [`typescript-feature-implementation`](skills/typescript-feature-implementation/SKILL.md) | Unions, schema-parsed boundaries, `satisfies`, imports, and errors |
| Skill | [`typescript-testing`](skills/typescript-testing/SKILL.md) | Typed fixtures and fakes, fake timers, and compile-time assertions |

Routes added to the routing table:

| Outcome | Owner | Related skills |
| --- | --- | --- |
| Build TypeScript behavior | `typescript-feature-agent` | `typescript-feature-implementation`, `typescript-testing`, `feature-implementation`, `test-generation` |
| Create TypeScript tests | `typescript-test-agent` | `typescript-testing`, `test-generation` |

Commands that pack personas and skills reference:

| Purpose | Command |
| --- | --- |
| Install | `pnpm install --frozen-lockfile` |
| Lint | `pnpm lint` |
| Typecheck | `pnpm typecheck` |
| Test | `pnpm test` |

## Prerequisites

- Node.js 22 and `pnpm`, preferably pinned through the `packageManager` field
  in `package.json`.
- A committed `pnpm-lock.yaml`, so the install command can run frozen.
- `package.json` scripts named `lint`, `typecheck`, and `test`. A typical
  `typecheck` script runs `tsc --noEmit` over a program that includes tests.
- A `tsconfig.json` with `strict` enabled.
- A Vitest- or Jest-style runner for unit, component, and integration tests.

## Detection

The manifest's `detect` patterns are `tsconfig.json`, `**/*.ts`, and
`**/*.tsx`; a repository with a matching file is a candidate for this pack.

## Combining With Other Packs

- `web-ui` requires this pack and adds UI personas, skills, and rules.
  `typescript-feature-agent` hands visual work to `ui-agent` when it is
  installed.
- `playwright` requires this pack and adds browser specs and browser evidence.
  Pack personas hand browser journeys and proof to its owners.
- `cloudflare` and `supabase` add platform personas for edge deployment or
  database, authentication, and storage work.
- The `nextjs-cloudflare` and `nextjs-supabase` profiles include this pack.

Preview an installation before writing files:

```bash
node scripts/stacks/install.mjs --target ../example-app --packs typescript --dry-run
```

## Changelog

### 0.1.0

- Initial pack. Folded the TypeScript instructions into [`AGENTS.md`](AGENTS.md)
  and added the `pnpm` command rule that core no longer carries.
- Added `typescript-feature-agent`, `typescript-test-agent`,
  `typescript-feature-implementation`, and `typescript-testing`.
