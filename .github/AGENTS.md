# Agent Catalog

Personas answer **who owns the work**. Their related skills answer **how the
workflow runs**. Core personas are always installed. Pack personas are
available only when their stack pack is installed; this repository installs
every pack through the `reference` profile.

## Core

Sources: [`core/agents/`](../core/agents/).

- `research-agent`: read-only, evidence-backed investigation.
- `planning-agent`: staged plans with specialist ownership.
- `plan-critic-agent`: plan readiness and blocking design findings.
- `plan-operations-agent`: execution coordination and truthful writeback.
- `plan-execution-audit`: independent evidence-to-plan audit.
- `feature-agent`: scoped feature delivery across each layer the project has.
- `refactor-agent`: behavior-preserving modernization and debt cleanup.
- `rbac-agent`: roles, membership, and resource authorization.
- `test-agent`: deterministic unit, component, and integration tests.
- `github-actions-agent`: secure, reproducible CI workflows.
- `security-auditor-agent`: read-only, ranked security findings.
- `subagents-validator-agent`: agent-system consistency audit.
- `upstream-agent`: upstream updates and sanitized contributions back to the source.

## TypeScript Pack

Requires nothing. Sources: [`stacks/typescript/agents/`](../stacks/typescript/agents/).

- `typescript-feature-agent`: strictly typed TypeScript feature delivery.
- `typescript-test-agent`: type-checked TypeScript unit, component, and integration tests.

## Web UI Pack

Requires `typescript`. Sources: [`stacks/web-ui/agents/`](../stacks/web-ui/agents/).

- `ui-agent`: reference-driven, accessible, tokenized UI delivery.
- `ui-sm-agent`: small-screen UI repair and authenticated mobile verification.

## Playwright Pack

Requires `typescript`. Sources: [`stacks/playwright/agents/`](../stacks/playwright/agents/).
When installed, these personas own the browser coverage and gates that core
personas hand off.

- `playwright-investigator-agent`: reproduce browser defects and fix application causes.
- `playwright-generator-agent`: durable, accessible browser specifications.
- `playwright-healer-agent`: diagnose and stabilize failing browser specifications.
- `e2e-hardening-agent`: claim-based sweeps across access profiles.
- `plan-hv-agent`: close observable plan gates with fresh browser evidence.
- `test-and-prove-agent`: redacted, reproducible browser proof bundles.

## Cloudflare Pack

Requires nothing. Sources: [`stacks/cloudflare/agents/`](../stacks/cloudflare/agents/).

- `cf-agent`: Cloudflare Workers and edge deployment configuration.

## Python Pack

Requires nothing. Sources: [`stacks/python/agents/`](../stacks/python/agents/).

- `python-feature-agent`: typed Python feature delivery.
- `python-test-agent`: deterministic pytest coverage.

## Docker Pack

Requires nothing. Sources: [`stacks/docker/agents/`](../stacks/docker/agents/).

- `docker-agent`: container image builds, hardening, and local compose configuration.

## Supabase Pack

Requires nothing. Sources: [`stacks/supabase/agents/`](../stacks/supabase/agents/).

- `supabase-agent`: migrations, row-level security, edge functions, and auth configuration.

## Sources and Routing

Each persona references only skills from core, its own pack, or a pack it
requires. Use the [routing guide](../docs/agent-routing.md) for outcome routing
and the [stack-pack guide](../docs/stack-packs.md) for packs and profiles.

The `.github/agents/*.agent.md` files are generated Copilot copies. Edit the
canonical persona under `core/agents/` or `stacks/<pack>/agents/`, then run
`pnpm sync:setup` and `pnpm check:all`.
