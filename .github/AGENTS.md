# Agent Catalog

Personas answer **who owns the work**. Their related skills answer **how the
workflow runs**.

## Research and Planning

- `research-agent`: read-only, evidence-backed investigation.
- `planning-agent`: staged plans with specialist ownership.
- `plan-critic-agent`: plan readiness and blocking design findings.
- `plan-operations-agent`: execution coordination and truthful writeback.
- `plan-execution-audit`: independent evidence-to-plan audit.

## Delivery Specialists

- `feature-agent`, `refactor-agent`, `rbac-agent`, `ui-agent`, `ui-sm-agent`.
- `test-agent`, `playwright-investigator-agent`,
  `playwright-generator-agent`, `playwright-healer-agent`.

## Verification and Operations

- `e2e-hardening-agent`, `plan-hv-agent`, `test-and-prove-agent`.
- `github-actions-agent`, `cf-agent`, `security-auditor-agent`.
- `subagents-validator-agent`.

Every persona is stored in [`agents/`](agents/) and references only skills that
exist in [`skills/`](skills/). Use the
[routing guide](../docs/agent-routing.md) for skill selection.

Canonical Copilot profiles use `*.agent.md`. Run `pnpm sync:setup` after changes
to regenerate Codex TOML profiles, Claude subagents, and both skill copies.
`pnpm check:setup` verifies these runtime surfaces without changing files.
