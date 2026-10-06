# Web UI Pack

Framework pack for accessible, token-driven, responsive web interfaces built
from TypeScript components, such as `app/` and `components/` trees styled with
Tailwind CSS or another semantic-token system.

## Scope

The pack owns visual delivery: replicating approved references, keeping
components accessible and themeable, repairing small-screen behavior, and
comparing implemented UI with references. Data, service, and API behavior stay
with the `typescript` pack, and durable browser coverage stays with an
installed verification pack.

## What It Adds

| Kind | Name | Purpose |
| --- | --- | --- |
| Rules | [`AGENTS.md`](AGENTS.md) | Component, accessibility, responsive, and token rules |
| Persona | [`ui-agent`](agents/ui-agent.md) | Reference-driven, accessible, tokenized UI delivery |
| Persona | [`ui-sm-agent`](agents/ui-sm-agent.md) | Small-screen repair and authenticated mobile verification |
| Skill | [`ui-replication`](skills/ui-replication/SKILL.md) | Recreate an approved reference with semantic tokens |
| Skill | [`ui-sm-verification`](skills/ui-sm-verification/SKILL.md) | Verify small-screen routes and interactions |
| Skill | [`ui-visual-verification`](skills/ui-visual-verification/SKILL.md) | Compare implemented UI with references |

Routes added to the routing table:

| Outcome | Owner | Related skills |
| --- | --- | --- |
| Build or compare UI | `ui-agent` | `ui-replication`, `ui-visual-verification` |
| Repair small-screen behavior | `ui-sm-agent` | `ui-sm-verification`, `ui-visual-verification` |

The pack declares no commands of its own; it uses the `typescript` pack's
lint, typecheck, and test commands.

## Prerequisites

- The `typescript` pack, which `requires` installs automatically, with its
  Node.js 22 and `pnpm` prerequisites.
- Components under `app/` or `components/` and a semantic design-token source,
  such as CSS custom properties or a Tailwind theme.
- For the verification skills: a browser automation runner, a non-production
  environment, and test accounts referenced through configured access
  profiles. The `playwright` pack provides the runner and its owners.

## Detection

The manifest's `detect` patterns are `app/**/*.tsx`, `components/**/*.tsx`,
and `tailwind.config.*`; a repository with a matching file is a candidate for
this pack.

## Combining With Other Packs

- `typescript` (required): rules, feature and test personas, and commands.
  `typescript-feature-agent` hands visual work to `ui-agent`.
- `playwright`: durable browser specs and browser evidence. UI personas hand
  committed coverage to `playwright-generator-agent`.
- `cloudflare` or `supabase`: platform packs for edge deployment or database,
  authentication, and storage; the `nextjs-cloudflare` and `nextjs-supabase`
  profiles combine them with this pack.

Preview an installation before writing files:

```bash
node scripts/stacks/install.mjs --target ../example-app --packs typescript,web-ui --dry-run
```

## Changelog

### 0.1.0

- Initial pack. Moved `ui-agent`, `ui-sm-agent`, `ui-replication`,
  `ui-sm-verification`, and `ui-visual-verification` from the single reference
  catalog into this pack.
- Converted the personas to the Claude Code persona format with a `skills:`
  list, and made their browser-coverage handoffs name the installed
  verification pack instead of assuming Playwright.
- Folded the component and responsive Tailwind instructions into
  [`AGENTS.md`](AGENTS.md).
- `ui-replication` now names the `typescript` pack's typecheck and lint
  commands.
