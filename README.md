# SWE Agents

[![Reference checks](https://github.com/startmeupai/swe-agents/actions/workflows/reference-checks.yml/badge.svg)](https://github.com/startmeupai/swe-agents/actions/workflows/reference-checks.yml)
[![License](https://img.shields.io/github/license/startmeupai/swe-agents)](LICENSE)

A portable reference for organizing AI-assisted software engineering across
Codex, Claude Code, and GitHub Copilot.

SWE Agents separates durable repository instructions, specialist ownership,
reusable skills, deterministic checks, and evidence. Use it to study or adapt an
agentic engineering operating model without importing product code, credentials,
provider accounts, or deployable infrastructure.

This is a teaching reference, not an application starter or a finished software
product.

## What Is Included

- Canonical custom-agent personas and skills for planning, implementation,
  verification, security, UI, testing, CI, and infrastructure work.
- Generated runtime surfaces for Codex and Claude Code, plus native GitHub
  Copilot definitions.
- Portable Node.js checks for catalog consistency, links, provenance,
  sanitization, secrets, runtime parity, and Markdown quality.
- Fictional examples of plans, handoffs, reports, and browser-evidence records.
- Explicit boundaries between automated checks, runtime proof, provider proof,
  deployment proof, and human approval.

## Quick Start

Use Node.js 22.15.0 and the pnpm version pinned in `package.json`.

```bash
git clone https://github.com/startmeupai/swe-agents.git
cd swe-agents
corepack enable
pnpm install --frozen-lockfile
pnpm check:all
```

Open the cloned directory as its own project. The three supported clients use
different discovery surfaces:

| Tool | Instructions | Personas | Skills |
| --- | --- | --- | --- |
| Codex | `AGENTS.md` | `.codex/agents/*.toml` | `.agents/skills/*/SKILL.md` |
| Claude Code | `CLAUDE.md` | `.claude/agents/*.md` | `.claude/skills/*/SKILL.md` |
| GitHub Copilot | `.github/copilot-instructions.md` | `.github/agents/*.agent.md` | `.github/skills/*/SKILL.md` |

Client availability and invocation syntax can vary by product version. Persona
examples such as `@research-agent` express routing intent rather than a command
that is guaranteed to work in every client.

## Canonical and Generated Files

Canonical personas and skills live under `.github/`. The Codex and Claude Code
copies are generated from those files and are committed so a clone works without
an extra setup step.

After editing a canonical persona or skill, run:

```bash
pnpm sync:setup
pnpm check:all
```

Commit the canonical change and every generated change together. Do not edit
`.codex/agents/`, `.claude/agents/`, `.agents/skills/`, or `.claude/skills/`
directly.

## Operating Model

1. A human defines intent, scope, authority, and acceptance criteria.
2. Research establishes repository facts with evidence.
3. Planning turns those facts into staged, reviewable work.
4. Specialists implement only the workstreams they own.
5. Deterministic checks prove static, test, policy, and build claims.
6. Independent review and runtime workflows verify behavior.
7. Provider, deployment, security, and human gates remain explicit.
8. Sanitized evidence informs the next iteration.

Choose the narrowest persona that owns the outcome. Load only the skills needed
for that task. See [agent routing](docs/agent-routing.md), the
[architecture](docs/architecture.md), and the
[verification model](docs/verification-model.md).

## Repository Structure

| Location | Purpose |
| --- | --- |
| `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md` | Runtime entry points |
| `.github/agents/` | Canonical specialist personas |
| `.github/skills/` | Canonical reusable workflows |
| `.github/instructions/` | Durable and path-scoped constraints |
| `.codex/`, `.claude/`, `.agents/` | Generated runtime copies |
| `scripts/checks/` | Deterministic validation |
| `examples/` | Fictional plans, reports, handoffs, and evidence |
| `docs/` | Architecture and operating guidance |

## Adapting the Reference

1. Replace the fictional directory conventions with those of your repository.
2. Keep instructions, personas, skills, tools, and evidence distinct.
3. Remove specialist roles that do not have a real workflow or owner.
4. Add repository-specific deterministic checks before adding prose rules.
5. Define where plans, reports, and runtime evidence are stored.
6. Configure access without embedding credentials or personal information.
7. Update `SOURCE_MAP.md` for every tracked artifact change.
8. Run `pnpm check:all` and record any runtime checks separately.

## Contributing

Issues and pull requests are welcome. Start with
[`CONTRIBUTING.md`](CONTRIBUTING.md), follow the
[`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md), and use
[`SUPPORT.md`](SUPPORT.md) to choose the right support channel.

For a security vulnerability, use the repository's
[private vulnerability reporting](https://github.com/startmeupai/swe-agents/security/advisories/new)
instead of a public issue. See [`SECURITY.md`](SECURITY.md).

## Documentation

- [Architecture](docs/architecture.md)
- [Agent routing](docs/agent-routing.md)
- [Plan lifecycle](docs/plan-lifecycle.md)
- [Verification model](docs/verification-model.md)
- [Security boundaries](docs/security-boundaries.md)
- [Releases and versioning](docs/releases-and-versioning.md)
- [Workshop example](docs/workshop-example.md)
- [Source map](SOURCE_MAP.md)

## License

Licensed under the [Apache License 2.0](LICENSE).
