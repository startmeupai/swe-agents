# Playwright Pack

Browser verification for projects that run Playwright. The pack adds owners for
reproducing browser defects, writing and repairing durable specs, sweeping
feature claims across access profiles, closing browser-observable plan gates,
and packaging redacted evidence bundles.

## Scope

- Kind: `verification`.
- Covers browser specifications, live-browser debugging, access-profile
  matrices, plan-gate verification, and step-level browser evidence.
- Does not cover unit, component, or integration tests; those stay with the
  core `test-agent` and the language pack's testing skill.
- Does not prove provider configuration, deployment, or human acceptance; see
  the [verification model](../../docs/verification-model.md).

## What It Adds

| Type | Name | Purpose |
| --- | --- | --- |
| Persona | [`playwright-investigator-agent`](agents/playwright-investigator-agent.md) | Reproduce a browser defect and fix its application cause |
| Persona | [`playwright-generator-agent`](agents/playwright-generator-agent.md) | Add durable, accessible browser coverage |
| Persona | [`playwright-healer-agent`](agents/playwright-healer-agent.md) | Repair a failing or flaky spec when the product is correct |
| Persona | [`e2e-hardening-agent`](agents/e2e-hardening-agent.md) | Sweep feature claims across access profiles |
| Persona | [`plan-hv-agent`](agents/plan-hv-agent.md) | Close browser-observable plan gates with fresh evidence |
| Persona | [`test-and-prove-agent`](agents/test-and-prove-agent.md) | Package a redacted browser evidence bundle |
| Skill | [`playwright-testing`](skills/playwright-testing/SKILL.md) | Deterministic Playwright journeys |
| Skill | [`e2e-hardening`](skills/e2e-hardening/SKILL.md) | Claim-by-profile sweeps with bounded fixes |
| Skill | [`plan-hv-automation`](skills/plan-hv-automation/SKILL.md) | Browser-observable plan-gate closure |
| Skill | [`test-and-prove`](skills/test-and-prove/SKILL.md) | Step-level evidence bundle and manifest |
| Rules | [`AGENTS.md`](AGENTS.md) | Browser verification rules merged into the target `AGENTS.md` |

Routes are declared in [`pack.json`](pack.json) and summarized in
[agent routing](../../docs/agent-routing.md).

## Commands

| Key | Default command | Use |
| --- | --- | --- |
| `e2e` | `pnpm exec playwright test` | Run browser specs; append a spec path for a focused run |
| `e2e_ui` | `pnpm exec playwright test --ui` | Debug specs interactively |
| `report` | `pnpm exec playwright show-report` | Inspect the last run's report and traces |

Adjust the commands in `pack.json` when the project wraps Playwright in its own
scripts.

## Prerequisites

- The `typescript` pack, which this pack requires.
- `@playwright/test` installed as a development dependency, with its browsers
  installed.
- A non-production environment and named access profiles whose credentials are
  supplied by the environment, never committed.

The pack is suggested when a repository contains `playwright.config.*`,
`playwright-tests/`, or `e2e/`.

## Combining With Other Packs

- Install it with the `typescript` pack; the installer resolves `requires`
  automatically.
- Add the `web-ui` pack when the project also owns reference-driven or
  small-screen UI work.
- Add a platform pack, such as `cloudflare` or `supabase`, for provider and
  deployment gates; browser evidence never substitutes for those gates.
- The `nextjs-cloudflare` and `nextjs-supabase` profiles include this pack.

Example installation into another repository:

```bash
node scripts/stacks/install.mjs --target ../example-app --packs typescript,playwright --dry-run
```

## Evidence Examples

- [Browser evidence manifest template](../../examples/browser-evidence/manifest.json)
- [Browser evidence manifest schema](../../examples/browser-evidence/browser-evidence-manifest.schema.json)

A template manifest keeps every step `not-run`; only a collected `evidence`
manifest records `pass` or `fail` with a redacted artifact per step.

## Changelog

### 0.1.0

- Initial pack. Moved the six browser personas and four browser skills from
  the former `.github/agents/` and `.github/skills/` catalog, and the
  browser-specific testing and evidence rules from the former
  `.github/instructions/` files.
- Converted personas to the Claude Code format with `skills:` lists and
  name-only related skills.
- Skills now name the pack's `e2e` and `report` commands.
