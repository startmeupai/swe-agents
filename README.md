# SWE Agents

[![Reference checks](https://github.com/startmeupai/swe-agents/actions/workflows/reference-checks.yml/badge.svg)](https://github.com/startmeupai/swe-agents/actions/workflows/reference-checks.yml)
[![License](https://img.shields.io/github/license/startmeupai/swe-agents)](LICENSE)

A portable, stack-agnostic **seed** for agentic engineering setups in Codex,
Claude Code, and GitHub Copilot, with Cursor-compatible surfaces through
`.agents/skills` and `.claude/agents`. Copy a stack-neutral core plus the
**stack packs** that match your project (TypeScript, Python, Web UI,
Playwright, Cloudflare, Docker, Supabase) into a repository you already have.

SWE Agents separates durable rules, specialist ownership, reusable skills,
deterministic checks, and evidence, without importing product code,
credentials, provider accounts, or deployable infrastructure.

This is a teaching reference, not an application starter or a finished software
product. Study it, then use it as a seed: install the core and your packs, and
adapt what they write to your repository's own conventions.

## How It Works

| Layer | Location | Contains | Installed |
| --- | --- | --- | --- |
| Core | `core/` | Process personas (research, planning, review, operations, audit, feature, refactor, RBAC, test, CI, security, validation), their skills, and stack-neutral rules | Always |
| Stack pack | `stacks/<pack>/` | Language, framework, platform, or verification personas, skills, rules, and commands | When selected |
| Profile | `profiles/<name>.json` | A named combination of packs | Selects packs |
| Installer | `scripts/stacks/install.mjs` | Copies core and packs into each client's discovery paths and records a lock file | When you run it |

The core never names a pack. Core personas use the commands that the installed
packs declare, so the core works on its own and each pack adds to it.

## Quick Start

Use Node.js 22.15.0 and the pnpm version pinned in `package.json`.

```bash
git clone https://github.com/startmeupai/swe-agents.git
cd swe-agents
corepack enable
pnpm install --frozen-lockfile
pnpm check:all
```

## Seed Your Repository

From the clone, preview and then install a profile into your repository:

```bash
pnpm stacks:install -- --target ../my-repo --profile python-api-docker --dry-run
pnpm stacks:install -- --target ../my-repo --profile python-api-docker
```

The dry run prints the plan and writes nothing. Use `--packs python,docker`
instead of `--profile` for a custom combination. Required packs are added
transitively, and the installer stops on a missing pack, a dependency cycle, a
declared conflict, or a duplicate persona or skill name. The target receives:

```text
AGENTS.md                         # core rules + one "## <Pack> rules" section per pack
.agents/skills/<name>/SKILL.md    # skills for Codex, Copilot, and Cursor
.claude/agents/<name>.md          # personas for Claude Code, Copilot in VS Code, and Cursor
.claude/skills/<name>/SKILL.md    # copy of .agents/skills for Claude Code
.github/agents/<name>.agent.md    # personas for the Copilot cloud agent
.github/copilot-instructions.md   # short pointer to AGENTS.md, created only if absent
.codex/agents/<name>.toml         # personas for Codex
.agents/stacks.lock.json          # source commit, profile, pack versions, file hashes
```

- **Lock file.** `.agents/stacks.lock.json` records the source repository and
  commit, the profile, pack versions, and a SHA-256 hash of every written file.
  Commit it with the installed files.
- **Updates.** Pull a newer SWE Agents checkout and rerun the same command, dry
  run first. Unedited files are refreshed and the lock is rewritten.
- **Local-edit protection.** A file whose hash no longer matches the lock is
  not overwritten unless you pass `--force`. Upstream lasting changes as a pack
  change, or reapply them after a deliberate `--force` update.
- **No `CLAUDE.md`.** Claude Code reads `AGENTS.md` when the repository has no
  `CLAUDE.md`. A `CLAUDE.md` or `CLAUDE.local.md` in the target stops
  `AGENTS.md` from loading by default, so fold its content into `AGENTS.md`.
- **No symlinks.** Skills are copied to both directories, so Windows works.
- **Verify.** In Claude Code, `/memory` (or `/context`) shows `AGENTS.md` and
  `/skills` lists the skills. In Copilot and Cursor, confirm that each skill is
  listed once even though two directories hold it.

## Client Discovery

| Client | Instructions | Personas | Skills |
| --- | --- | --- | --- |
| Codex | `AGENTS.md` | `.codex/agents/*.toml` | `.agents/skills` |
| Claude Code | `AGENTS.md` | `.claude/agents` | `.claude/skills` |
| GitHub Copilot | `AGENTS.md`, plus a short `.github/copilot-instructions.md` | `.github/agents/*.agent.md` (cloud agent), `.claude/agents` (VS Code) | `.github/skills`, `.claude/skills`, `.agents/skills` |

Cursor-compatible clients can use `AGENTS.md`, `.claude/agents`, and
`.agents/skills`. Discovery and invocation syntax vary by product version;
examples such as `@research-agent` express routing intent, not a command that
is guaranteed to work in every client.

## Available Packs

Each pack README lists its skills, rules, commands, and changelog.

| Pack | Kind | Personas added | Requires |
| --- | --- | --- | --- |
| [`typescript`](stacks/typescript/README.md) | language | `typescript-feature-agent`, `typescript-test-agent` | none |
| [`web-ui`](stacks/web-ui/README.md) | framework | `ui-agent`, `ui-sm-agent` | `typescript` |
| [`playwright`](stacks/playwright/README.md) | verification | `playwright-investigator-agent`, `playwright-generator-agent`, `playwright-healer-agent`, `e2e-hardening-agent`, `plan-hv-agent`, `test-and-prove-agent` | `typescript` |
| [`cloudflare`](stacks/cloudflare/README.md) | platform | `cf-agent` | none |
| [`python`](stacks/python/README.md) | language | `python-feature-agent`, `python-test-agent` | none |
| [`docker`](stacks/docker/README.md) | platform | `docker-agent` | none |
| [`supabase`](stacks/supabase/README.md) | platform | `supabase-agent` | none |

## Profiles

- `reference`: every pack; generates this repository's own runtime directories.
- `nextjs-cloudflare`: `typescript`, `web-ui`, `playwright`, `cloudflare`.
- `nextjs-supabase`: `typescript`, `web-ui`, `playwright`, `supabase`.
- `python-api-docker`: `python`, `docker`.

## Canonical and Generated Files

Canonical personas, skills, and rules live under `core/` and `stacks/`.
`.claude/`, `.agents/`, `.codex/`, and `.github/agents/` are generated: they
are this repository's own install of the `reference` profile, committed so a
clone works without an extra setup step.

After editing a canonical persona, skill, rule fragment, or pack manifest, run:

```bash
pnpm sync:setup
pnpm check:all
```

Commit the canonical change and every generated change together. Do not edit
the generated directories directly.

A persona narrows its access with a Claude Code `tools` allowlist. One without
`Edit`, `Write`, and `NotebookEdit` is described as "Read-only" and gets a
read-only Codex sandbox; see [security boundaries](docs/security-boundaries.md).

## Operating Model

1. A human defines intent, scope, authority, and acceptance criteria.
2. Research establishes repository facts with evidence.
3. Planning turns those facts into staged, reviewable work.
4. Core and pack specialists implement only the workstreams they own.
5. Deterministic checks, using the commands each pack declares, prove static,
   test, policy, and build claims.
6. Independent review and runtime workflows verify behavior.
7. Provider, deployment, security, and human gates remain explicit.
8. Sanitized evidence informs the next iteration.

Choose the narrowest persona that owns the outcome and load only the skills it
needs. See [agent routing](docs/agent-routing.md), the
[architecture](docs/architecture.md), and the
[verification model](docs/verification-model.md).

## Repository Structure

| Location | Purpose |
| --- | --- |
| `AGENTS.md`, `.github/copilot-instructions.md` | Rules for working in this repository |
| `.github/AGENTS.md` | Persona catalog for core and packs |
| `core/` | Canonical stack-neutral personas, skills, and rules |
| `stacks/` | Canonical stack packs |
| `profiles/` | Named pack combinations |
| `scripts/checks/` | Deterministic validation of core, packs, and profiles |
| `scripts/stacks/` | Installer for target repositories |
| `scripts/runtime/` | Self-install of the `reference` profile into this repository |
| `.claude/`, `.agents/`, `.codex/`, `.github/agents/` | Generated runtime copies |
| `examples/` | Fictional plans, reports, handoffs, and evidence |
| `docs/` | Architecture and operating guidance |

## Adapting the Seed

1. Install the smallest profile or pack set that matches your stack; leave a
   pack out rather than deleting its files after installation.
2. Replace the fictional plan, report, and evidence locations with your own.
3. Add repository-specific deterministic checks before adding prose rules.
4. Configure access without embedding credentials or personal information.

To add or change a pack, read `stacks/README.md` and the
[stack-pack guide](docs/stack-packs.md), then follow the pack checklist in
[`CONTRIBUTING.md`](CONTRIBUTING.md).

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
- [Stack packs](docs/stack-packs.md)
- [Agent routing](docs/agent-routing.md)
- [Plan lifecycle](docs/plan-lifecycle.md)
- [Verification model](docs/verification-model.md)
- [Security boundaries](docs/security-boundaries.md)
- [Releases and versioning](docs/releases-and-versioning.md)
- [Workshop example](docs/workshop-example.md)
- [Source map](SOURCE_MAP.md)

## License

Licensed under the [Apache License 2.0](LICENSE).
