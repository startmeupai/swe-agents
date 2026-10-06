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
| Core | `core/` | Process personas (research, planning, review, operations, audit, feature, refactor, RBAC, test, CI, security, validation, upstream sync), their skills, and stack-neutral rules | Always |
| Stack pack | `stacks/<pack>/` | Language, framework, platform, or verification personas, skills, rules, and commands | When selected |
| Profile | `profiles/<name>.json` | A named combination of packs | Selects packs |
| CLI | `scripts/stacks/cli.mjs` (`swe-agents`) | Detects packs, installs core and packs into each client's discovery paths, merges upstream updates, and bundles local improvements for upstream | When you run it |

The core never names a pack. Core personas use the commands that the installed
packs declare, so the core works on its own and each pack adds to it.

## Quick Start

### Start From Any Repository

Run this from the root of the repository you want to equip. It needs Node.js
22 and Git, and no clone or global install.

```bash
npx --yes github:startmeupai/swe-agents init
```

`init` resolves a source checkout, then:

1. **Detects** which packs fit by matching each pack's `detect` patterns
   against your files.
2. **Suggests** a selection: each pack, its kind, the files that matched, and
   the required packs it pulls in.
3. **Confirms** with a y/N prompt. `--yes` accepts without prompting; without
   a terminal and without `--yes`, it prints the plan and exits with code 2.
4. **Installs** the core and the selected packs, and writes the lock file.
5. **Prints next steps**: how to verify discovery in each client, how to run
   `update` and `contribute`, and that the installed `upstream-agent` can
   drive both.

Pass `--packs python,docker` or `--profile python-api-docker` to skip
detection, and `--dry-run` to print the plan without writing. Under `npx`, the
CLI keeps a source clone in `$SWE_AGENTS_HOME/source`, by default
`.swe-agents/source` in your home directory, and records its exact commit in
the lock.

In this README, `swe-agents <command>` means
`npx --yes github:startmeupai/swe-agents <command>` from your repository, or
`pnpm swe-agents <command> --target <dir>` from a clone.

### Work From a Clone

Use Node.js 22.15.0 and the pnpm version pinned in `package.json`.

```bash
git clone https://github.com/startmeupai/swe-agents.git
cd swe-agents
corepack enable
pnpm install --frozen-lockfile
pnpm check:all
```

A clone or a fork is used as the source as it is: the lock records its
`origin` URL and `HEAD` commit. Preview and then install a profile into your
repository:

```bash
pnpm swe-agents install --target ../my-repo --profile python-api-docker --dry-run
pnpm swe-agents install --target ../my-repo --profile python-api-docker
```

`pnpm stacks:install -- <options>` runs the same installer with the same
options.

## What the Installer Writes

`--dry-run` prints the plan and writes nothing. Use `--packs python,docker`
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
.codex/config.toml                # enables Codex custom agents
.agents/stacks.lock.json          # source repo, ref, and commit; packs; file hashes and origins
```

- **Lock file.** `.agents/stacks.lock.json` (version 2) records the source
  repository URL, ref, and commit; the profile or pack list; pack versions; a
  SHA-256 hash of each installed file as written; and the canonical origin of
  each copied persona and skill file. Commit it with the installed files;
  `update` and `contribute` read it.
- **Local-edit protection.** `install` does not overwrite a file whose hash no
  longer matches the lock unless you pass `--force`. `update` merges such a
  file instead.
- **No `CLAUDE.md`.** By default, Claude Code reads `AGENTS.md` only when no
  `CLAUDE.md`, `.claude/CLAUDE.md`, or `CLAUDE.local.md` exists in the working
  directory or any directory above it, so fold such a file's content into
  `AGENTS.md`.
- **No symlinks.** Skills are copied to both directories, so Windows works.
- **Verify.** In Claude Code, `/memory` (or `/context`) shows `AGENTS.md` and
  `/skills` lists the skills. In Copilot and Cursor, confirm that each skill is
  listed once even though two directories hold it.

## Keep It Updated

```bash
swe-agents update --dry-run
swe-agents update
```

`update` reads the lock, fetches the same source repository at the locked ref
or at `--ref <git-ref>`, and reinstalls the locked profile or pack list.

| File in the lock | Result |
| --- | --- |
| Unchanged since the last install | Refreshed to the new upstream content |
| Edited locally; the edit merges cleanly | `merge`: your edit and the upstream change are both kept |
| Edited locally; the edit overlaps an upstream change | `skip-conflict`: nothing is written; resolve it by hand or pass `--force` |
| No longer part of the selection | Removed when unedited; left in place and unmanaged when edited |

The merge is a three-way `git merge-file`: the base is the file as the
installer rendered it at the lock's `source.commit`, "ours" is your file, and
"theirs" is the new rendered content. The lock records the new upstream hash,
never the merged one, so a merged file stays marked as edited and merges again
next time. The `AGENTS.md` managed block follows the same rules, and text
outside the block is never touched.

Files the lock does not list are yours: `update` never changes or removes them,
and it skips a new upstream file whose path you already use. `--no-merge` keeps
every edited file as it is, and `--force` replaces edited and conflicting files
with upstream content. A lock written before version 2 has no origins, so its
edited files cannot be merged on that run; every `update` or `install` writes
a version 2 lock for the next one.

## Send Improvements Back

When you improve an installed persona or skill, or write a new one, offer it
upstream:

```bash
swe-agents contribute --dry-run
swe-agents contribute
```

`contribute` runs locally and never pushes. It carries each local edit onto
the canonical file at the lock's commit, collects personas and skills the lock
does not list, scans both for secrets, blocked terms, and your project's own
name, and writes a bundle to `.agents/contributions/<slug>/`: patches against
the canonical files, copies of new files, a `manifest.json`, and a
`SUMMARY.md` with a pull request body draft. A secret hit fails the command
and writes nothing. Edits to the `AGENTS.md` managed block are listed but not
bundled. The bundle is a local working artifact; do not commit it.

The core `upstream-agent` persona drives both loops with the `upstream-update`
and `upstream-contribution` skills. Before any outward-facing step, it shows
you the final diff and pull request body and waits for your confirmation. It
then uses your own `gh` login to fork SWE Agents when you cannot push to it,
push a `contrib/<slug>` branch to that fork, and open a pull request against
the `test` branch. It never forks or pushes your project. See
[`CONTRIBUTING.md`](CONTRIBUTING.md#contribution-workflow) for the three ways
to contribute.

## Client Discovery

| Client | Instructions | Personas | Skills |
| --- | --- | --- | --- |
| Codex | `AGENTS.md` | `.codex/agents/*.toml` | `.agents/skills` |
| Claude Code | `AGENTS.md` | `.claude/agents` | `.claude/skills` |
| GitHub Copilot | `AGENTS.md` (cloud agent, CLI, GitHub.com code review, VS Code chat), plus a short `.github/copilot-instructions.md` | `.github/agents/*.agent.md` (cloud agent), `.claude/agents` (VS Code) | `.github/skills`, `.claude/skills`, `.agents/skills` |

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
| `scripts/stacks/` | The `swe-agents` CLI: detection, installation, updates, and contribution bundles |
| `scripts/runtime/` | Self-install of the `reference` profile into this repository |
| `.claude/`, `.agents/`, `.codex/`, `.github/agents/` | Generated runtime copies |
| `examples/` | Fictional plans, reports, handoffs, and evidence |
| `docs/` | Architecture and operating guidance |

## Adapting the Seed

1. Install the smallest profile or pack set that matches your stack; `init`
   suggests one. Leave a pack out rather than deleting its files after
   installation.
2. Replace the fictional plan, report, and evidence locations with your own.
3. Add repository-specific deterministic checks before adding prose rules.
4. Configure access without embedding credentials or personal information.

To add or change a pack, read `stacks/README.md` and the
[stack-pack guide](docs/stack-packs.md), then follow the pack checklist in
[`CONTRIBUTING.md`](CONTRIBUTING.md).

## Contributing

Issues and pull requests are welcome; pull requests target the `test` branch.
Start with [`CONTRIBUTING.md`](CONTRIBUTING.md), follow the
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
