# Stack Pack Authoring Reference

Each directory under `stacks/` is one pack: the personas, skills, rules, and
commands for one language, framework, platform, or verification stack. This
page states the exact format the validators and the installer enforce. For the
design rationale, the core and pack boundary, and versioning policy, read
[Stack Packs](../docs/stack-packs.md).

## Layout

```text
stacks/<pack>/
  pack.json               # manifest
  README.md               # scope, additions, prerequisites, combinations, "## Changelog"
  AGENTS.md               # rules fragment; its H1 names the installed section
  agents/<name>.md        # optional personas
  skills/<name>/SKILL.md  # optional skills, plus any supporting files in that folder
```

Nothing else belongs in a pack directory, and only pack directories and this
README belong in `stacks/`. `pnpm check:stacks` rejects any other entry.

## Manifest

```json
{
  "name": "python",
  "kind": "language",
  "version": "0.1.0",
  "description": "Python language owners, skills, and rules.",
  "requires": [],
  "conflicts": [],
  "detect": ["pyproject.toml", "**/*.py"],
  "commands": { "lint": "ruff check .", "typecheck": "mypy .", "test": "pytest -q" },
  "agents": ["python-feature-agent", "python-test-agent"],
  "skills": ["python-feature-implementation", "python-testing"],
  "routes": [
    {
      "outcome": "Build Python behavior",
      "owner": "python-feature-agent",
      "skills": ["python-feature-implementation", "test-generation"]
    }
  ]
}
```

Every field is required, and no other field is accepted.

| Field | Type | Rule |
| --- | --- | --- |
| `name` | string | Kebab-case; equals the pack directory name |
| `kind` | string | `language`, `framework`, `platform`, or `verification` |
| `version` | string | Semantic version, such as `0.1.0`; record each release in the README changelog |
| `description` | string | One non-empty line |
| `requires` | list | Existing pack names, resolved transitively; never the pack itself; no cycles |
| `conflicts` | list | Existing pack names that must not be installed alongside; never also required |
| `detect` | list | File patterns that suggest the pack fits a repository; informational |
| `commands` | object | Lowercase keys (`a-z`, digits, `_`, `-`) mapped to one-line commands; `lint`, `typecheck`, and `test` are conventional |
| `agents` | list | Exactly the persona names in `agents/`, no more and no fewer |
| `skills` | list | Exactly the skill folder names in `skills/`, no more and no fewer |
| `routes` | list | Objects with exactly `outcome`, `owner`, and `skills` |

A route's `outcome` is one line without `|`. Its `owner` and every name in its
`skills` must come from the core, this pack, or a pack in this pack's
`requires` chain, so the route is valid whenever the pack is installed. The
installer prints every route in its routing table; a persona without a route
appears with its description instead.

The installer writes `commands` into the target's `AGENTS.md` as a
`### <Title> commands` table under the pack's rules section. That table is the
one place an adopter changes a command, so skills refer to commands through the
pack, such as "run the pack's test command (`pytest -q`)".

## Names

- Persona and skill names are kebab-case. A persona's `name` equals its file
  name without `.md`; a skill's `name` equals its folder name.
- New pack personas and skills start with `<pack>-`, such as
  `python-feature-agent` or `docker-ops`. Names that moved from the earlier
  layout, such as `ui-agent` and `playwright-testing`, keep their names; that
  list is fixed in `scripts/checks/check-stacks.mjs`.
- Names are unique across the core and every pack: no two personas, and no two
  skills, share a name. The installer refuses any selection with a collision.

## Rules Fragment

The installer turns `AGENTS.md` into one section of the target's `AGENTS.md`:

- The first H1 becomes the section heading. A trailing "Rules" is dropped and
  " rules" is added, so `# TypeScript Rules` becomes `## TypeScript rules`.
- Every other heading moves down one level, so `##` becomes `###`.
- Relative links are rebased to the target's root. A target holds only the
  installed files, so prefer prose and backticked names; the installer lists
  any link target the target does not have.

Start with one sentence of scope, such as "Apply these rules to Python modules,
`pyproject.toml`, and tests." Keep the fragment short; every client that reads
`AGENTS.md` loads it on every task, and procedures belong in skills.

## Personas

Personas use the Claude Code format. Copy the structure of a core persona such
as [`research-agent`](../core/agents/research-agent.md) (read-only) or a pack
persona such as
[`python-test-agent`](python/agents/python-test-agent.md).

```markdown
---
name: python-test-agent
description: Python QA owner for deterministic pytest coverage.
tools: Read, Grep, Glob, Bash, Edit, Write
skills:
  - python-testing
  - test-generation
---

# Python Test Agent
```

`pnpm check:agents` enforces these rules:

- Frontmatter holds only `name`, `description`, `tools`, and `skills`. Personas
  omit `model`, so the client chooses; Claude Code then uses the per-invocation
  model, `CLAUDE_CODE_SUBAGENT_MODEL`, or the main conversation's model.
- `tools` is optional; omitting it inherits every tool available to subagents.
  When present, it lists Claude Code tool names only: `Read`, `Grep`, `Glob`,
  `Bash`, `Edit`, `Write`, `NotebookEdit`, `WebFetch`, `WebSearch`, and
  `Agent`, with no duplicates.
- The description contains "Read-only" if, and only if, `tools` is declared
  without `Edit`, `Write`, and `NotebookEdit`.
- `skills` is a YAML block list with at least one name. Each name is a core
  skill, a skill of this pack, or a skill of a pack in its `requires` chain.
- The body has these sections: Purpose and Responsibility, When to Use, Inputs,
  Expected Output, Boundaries and Prohibited Actions, Verification
  Expectations, Handoff Expectations, Related Skills, and Example Invocation.
- Related Skills has one bullet per `skills` entry, each starting with the
  backticked name, and no links. Generated Copilot copies link a skill only when
  the target serves it from `.github/skills/`.
- A persona has no Workflow section and at most two numbered lines; procedures
  belong in skills.
- A persona may hand work to another pack's persona when that pack is
  installed, but installed pack content never names a skill outside its
  `requires` chain, and the core never names any pack persona or skill.

## Skills

Skills use the standard sections. Copy the structure of a core skill such as
[`planning-research`](../core/skills/planning-research/SKILL.md).
`pnpm check:skills` enforces these rules:

- Frontmatter holds only `name`, `description`, `license`, `compatibility`,
  `metadata`, and `allowed-tools`. The name is at most 64 characters; the
  description is at most 1024.
- The body has these sections: Trigger Conditions, Required Inputs, Workflow
  with at least three numbered steps, Deterministic Checks, Safety and
  Permission Boundaries, Required Evidence, Completion Condition, and Example.
- A skill contains no persona language, such as a `## Persona` section or
  "You are the" phrasing.
- Supporting files in the skill folder are installed with it, so links between
  them stay relative.

## Profiles

A profile is `profiles/<name>.json` with exactly `name`, `description`, and
`packs`:

```json
{
  "name": "python-api-docker",
  "description": "Python service or API built and run in Docker containers.",
  "packs": ["python", "docker"]
}
```

The `name` equals the file name, `packs` lists at least one pack without
duplicates, and the selection must resolve without a missing pack, a cycle, a
conflict, or a name collision. List only the packs you choose; required packs
are added during resolution. Add every new pack to
[`reference.json`](../profiles/reference.json), which generates this
repository's own runtime directories and must include every pack.

## Check a Pack

Run these from the repository root after any pack change:

```bash
pnpm check:stacks
pnpm check:agents
pnpm check:skills
pnpm sync:setup
pnpm check:all
```

`pnpm check:stacks` validates every manifest field above; matches `agents` and
`skills` against the files present; checks that each pack has `README.md` with
a changelog section and `AGENTS.md`; resolves every pack and every profile for
cycles, conflicts, and name collisions; and checks the core and pack naming
boundary. `pnpm sync:setup` regenerates this repository's tool directories from
the `reference` profile, and `pnpm check:all` confirms they match.

## Install into a Target

Preview, then install, from the root of this repository. The target must be an
existing directory, and it must not be this repository.

```bash
pnpm stacks:install -- --target ../my-repo --profile python-api-docker --dry-run
pnpm stacks:install -- --target ../my-repo --profile python-api-docker
pnpm stacks:install -- --target ../my-repo --packs web-ui,cloudflare
```

| Option | Meaning |
| --- | --- |
| `--target <dir>` | Target repository; required |
| `--profile <name>` | Install `profiles/<name>.json`; use this or `--packs` |
| `--packs a,b,c` | Install an explicit list; required packs are added |
| `--yes` | Apply the plan without asking; without a terminal, nothing is written unless it is set |
| `--dry-run` | Print the plan, link notes, and routing table; write nothing |
| `--force` | Overwrite edited files, files the installer did not create, and an edited managed block; remove edited files the selection no longer installs |

The installer prints one line per planned change, a summary, any skipped
files, relative links the target cannot resolve, a warning when the target has
`CLAUDE.md`, `.claude/CLAUDE.md`, or `CLAUDE.local.md` and none of them
imports `@AGENTS.md`, the merged routing table for the installed
personas, and a final `Result:` line. It asks before writing anything. A second run with the same sources and
selection prints `Result: no changes`.

| Action | Meaning |
| --- | --- |
| `create` | The file is new |
| `update` | The file matches the lock, and the sources changed |
| `unchanged` | The file already has the expected content |
| `restore` | The lock lists the file, but it was deleted |
| `merge` | `update` only: the file was edited locally and the upstream change merged cleanly |
| `skip-conflict` | `update` only: the local edit and the upstream change overlap; kept, resolve by hand |
| `skip-edited` | The file changed since the last install; kept (`install`, or `update --no-merge`) |
| `skip-unowned` | The file exists, but the installer did not create it; kept |
| `overwrite` | A skipped case replaced because `--force` was set |
| `append-block` | An existing `AGENTS.md` received the managed block |
| `update-block` | The managed block in `AGENTS.md` was refreshed |
| `remove` | The selection no longer installs this unedited file |
| `keep-edited` | The selection no longer installs this edited file; it is left unmanaged |
| `forget` | The lock listed a file that is gone and no longer installed; the lock drops it |

### What the Target Receives

| Path | Content |
| --- | --- |
| `AGENTS.md` | Core rules, then one `## <Title> rules` section per pack, inside a managed block |
| `.claude/agents/<name>.md` | Each persona, as authored |
| `.github/agents/<name>.agent.md` | Each persona without its `skills` block |
| `.codex/agents/<name>.toml` | Each persona for Codex; `sandbox_mode = "read-only"` when it cannot edit |
| `.codex/config.toml` | Sets `[agents] enabled = true`, Codex's default for multi-agent tools |
| `.agents/skills/<name>/` | Each skill folder |
| `.claude/skills/<name>/` | A copy of each skill folder; no symlinks |
| `.github/copilot-instructions.md` | A pointer to `AGENTS.md`, created only when absent and never tracked |
| `.agents/stacks.lock.json` | The lock file |

### AGENTS.md Managed Block

The installer owns only the text between `<!-- swe-agents:begin -->` and
`<!-- swe-agents:end -->`.

- When the target has no `AGENTS.md`, the file is the core H1 followed by the
  block.
- When the target already has an `AGENTS.md`, the block is appended at the end,
  and every installed heading moves down one level so the file keeps one H1.
- Add project rules outside the block; reruns never touch them. An edit inside
  the block is protected like any edited file.

### Lock File

`.agents/stacks.lock.json` records what the installer wrote:

```json
{
  "lockVersion": 2,
  "source": {
    "repo": "https://github.com/startmeupai/swe-agents",
    "ref": "main",
    "commit": "<40-character commit>"
  },
  "profile": "python-api-docker",
  "packs": [
    { "name": "python", "version": "0.1.0" },
    { "name": "docker", "version": "0.1.0" }
  ],
  "files": { "AGENTS.md": "<sha256>", ".claude/agents/python-test-agent.md": "<sha256>" },
  "origins": { ".claude/agents/python-test-agent.md": "stacks/python/agents/python-test-agent.md" }
}
```

- `source` records the repository, ref, and commit the files came from. The
  installer refuses to write a lock without a real commit, and the commit does
  not capture uncommitted source changes.
- `profile` is `null` for a `--packs` install, and `packs` lists the resolved
  packs, required ones included, in installation order.
- `origins` maps each installed file to its canonical path in this repository.
  `update` uses it to find the merge base and `contribute` uses it to aim a
  patch at the right file. Composed files such as `AGENTS.md` and the Codex
  files have no origin. A `bases` field appears only while an edited file waits
  on an older merge base after a skipped conflict.
- An older lock without `lockVersion` is read as version 1. Its files cannot
  be merged until one install rewrites the lock; `contribute` derives their
  origins by rendering the recorded commit.
- Each hash is the SHA-256 of the file with LF line endings, so a CRLF checkout
  does not look edited. The `AGENTS.md` hash covers the managed block, markers
  included.
- A file whose current hash differs from its lock hash counts as edited. A
  skipped file keeps its previous hash, so it stays protected on later runs.
- Commit the lock file with the installed files.

## Update Flow

From the target repository, `swe-agents update` (run as
`npx --yes github:startmeupai/swe-agents update`, or `pnpm swe-agents update
--target ../my-repo` from a clone) re-installs the locked selection from the
newest source and three-way merges local edits:

1. Run `swe-agents update --dry-run` and read the plan.
2. Run `swe-agents update` and confirm the plan it prints, or pass `--yes`
   where no terminal can answer. Unedited files and the managed block are
   refreshed. An edited file is merged against its recorded base and reports
   `merge`; an overlapping edit reports `skip-conflict` and is left untouched.
3. Resolve each `skip-conflict` by hand from the printed hunks, then rerun
   `update`. `--no-merge` restores the older `skip-edited` behaviour and
   `--force` overwrites every edited file.
4. Commit the target's changes, including the lock file.

The `upstream-agent` persona, installed with the core, drives this flow and the
contribution flow described in [CONTRIBUTING.md](../CONTRIBUTING.md).

To drop a pack, rerun with the smaller selection. Unedited files that only the
dropped pack installed are removed; edited ones are left in place and become
unmanaged. Contribute lasting improvements upstream as a pack change; see
[CONTRIBUTING.md](../CONTRIBUTING.md).
