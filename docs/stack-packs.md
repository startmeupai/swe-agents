# Stack Packs

A stack pack adds the personas, skills, rules, and commands for one language,
framework, platform, or verification stack to the stack-neutral core. This page
explains the design for adopters who install packs and states the contract for
authors who write them.

## Why Packs

- **Language-optimized owners.** A Python owner that runs `ruff`, `mypy`, and
  `pytest` gives better results than a generic owner guessing a project's
  toolchain. Packs let each stack have owners that know its conventions.
- **Independent maintenance.** Each pack has its own directory, README, and
  changelog. A change to the Docker pack does not churn adopters who only use
  Python.
- **Versioned.** Each pack carries its own semantic version, and the target's
  lock file records the version installed.
- **Installed per project.** A repository receives only the owners it can use.
  Fewer irrelevant personas and skills mean less routing noise and less
  context for every client to load.

## Core and Pack Boundary

The boundary rule has one direction: **the core never references a pack**.
Core personas, skills, and rules never name a pack, a pack persona, a pack
skill, or a pack command. They say "use the project's commands as declared by
its installed stack packs" and "each layer the project has", so the core works
alone in any repository.

A pack may reference core skills, such as `test-generation`, and the skills of
packs it requires. It must not reference a pack outside its `requires` chain.
For example, the core `feature-agent` and `test-agent` do not list
`playwright-testing`; browser work routes to the `playwright` pack's owners
only when that pack is installed.

## Pack Anatomy

```text
stacks/<pack>/
  pack.json               # manifest
  README.md               # scope, additions, prerequisites, combinations, changelog
  AGENTS.md               # rules fragment for this stack
  agents/<name>.md        # optional personas
  skills/<name>/SKILL.md  # optional skills
```

### Manifest

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

| Field | Contract |
| --- | --- |
| `name` | Pack name used by profiles, `--packs`, and the lock file; the same as its `stacks/` directory |
| `kind` | One of `language`, `framework`, `platform`, or `verification` |
| `version` | Semantic version of this pack |
| `description` | One line |
| `requires` | Packs that must be installed with this one; resolved transitively |
| `conflicts` | Packs that must not be installed with this one |
| `detect` | File patterns that indicate the pack fits a repository |
| `commands` | Commands the pack's personas and skills run; `lint`, `typecheck`, and `test` are conventional keys |
| `agents` | Persona names; must exactly match the files in `agents/` |
| `skills` | Skill names; must exactly match the folders in `skills/` |
| `routes` | Outcome, owner, and skill rows for the [routing guide](agent-routing.md) |

### Rules Fragment

`AGENTS.md` holds the pack's durable rules. The installer places it in the
target's `AGENTS.md` as one `## <Pack> rules` section after the core rules.
State the scope in prose at the top of the fragment, for example "Applies to
Python modules, `pyproject.toml`, and tests". Keep it short; procedures belong
in skills, which clients load only when needed.

### Personas and Skills

Pack personas use the same Claude Code format as core personas: frontmatter
with `name`, a one-line `description`, an optional `tools` allowlist, and a
`skills` list, followed by the standard ownership sections. A persona without
`Edit`, `Write`, and `NotebookEdit` must say "Read-only" in its description.
Personas name skills; they contain no workflow section.

Pack skills use the standard skill sections: trigger conditions, required
inputs, a numbered workflow, deterministic checks, safety and permission
boundaries, required evidence, a completion condition, and an example. They
refer to commands through the pack, such as "run the pack's test command
(`pytest -q`)", so an adopter can change the command in one place.

### README and Changelog

The pack README states the scope, what the pack adds, prerequisites, which
packs it combines with, and a changelog section with one entry per version.

## Naming and Uniqueness

- Persona and skill names are globally unique across the core and every pack.
  The validators enforce this, and the installer refuses a selection that would
  install two files with the same name.
- New pack personas and skills start with the pack name, such as
  `python-feature-agent` or `docker-ops`.
- Personas and skills that moved from the earlier layout keep their names, such
  as `ui-agent`, `cf-agent`, and `playwright-testing`.
- A persona's `name` equals its file name; a skill's `name` equals its folder.

## Requires and Conflicts

`requires` lists the packs whose owners, skills, or commands this pack builds
on; `web-ui` and `playwright` require `typescript`. The installer adds required
packs transitively, so `--packs web-ui` also installs `typescript`.

Declare `conflicts` when two packs would give contradictory rules or competing
owners for the same outcome. The installer fails rather than choosing between
them. It also fails on a missing pack or a dependency cycle.

## Profiles

A profile is a JSON file in `profiles/` with a `name`, a `description`, and a
`packs` list. It names a common combination; it is a convenience, not a grant
of authority.

| Profile | Packs |
| --- | --- |
| `reference` | Every pack; generates this repository's own runtime directories |
| `nextjs-cloudflare` | `typescript`, `web-ui`, `playwright`, `cloudflare` |
| `nextjs-supabase` | `typescript`, `web-ui`, `playwright`, `supabase` |
| `python-api-docker` | `python`, `docker` |

Every new pack is added to `reference` so this repository's checks and
generated directories exercise it.

## Installer and Lock File

`scripts/stacks/install.mjs` installs the core and the selected packs into a
target repository.

| Option | Meaning |
| --- | --- |
| `--target <dir>` | Target repository; required |
| `--profile <name>` | Install a named profile; use this or `--packs` |
| `--packs a,b,c` | Install an explicit pack list; use this or `--profile` |
| `--dry-run` | Print the plan without writing |
| `--force` | Overwrite files that were edited after the last install |

The installer:

1. Resolves the profile or pack list, adds required packs, and fails on a
   missing pack, a cycle, a conflict, or a duplicate persona or skill name.
2. Writes `AGENTS.md` from the core rules plus one section per installed pack.
3. Copies personas and skills into each client's discovery paths, without
   symlinks, and creates `.github/copilot-instructions.md` only if it is absent.
4. Refuses to overwrite a file whose hash differs from the lock file, unless
   `--force` is set.
5. Writes `.agents/stacks.lock.json`.

The lock file records where the install came from and what it wrote:

```json
{
  "source": { "repo": "<source repository>", "commit": "<commit>" },
  "profile": "python-api-docker",
  "packs": [
    { "name": "python", "version": "0.1.0" },
    { "name": "docker", "version": "0.1.0" }
  ],
  "files": { "AGENTS.md": "<sha256>", ".claude/agents/python-feature-agent.md": "<sha256>" }
}
```

Each persona is written three ways: verbatim to `.claude/agents/<name>.md`,
without its `skills` block to `.github/agents/<name>.agent.md`, and as
`.codex/agents/<name>.toml`, which uses `sandbox_mode = "read-only"` when the
persona cannot edit files.

## How Rules Reach Each Client

Earlier versions kept path-scoped rules in Copilot `*.instructions.md` files
with `applyTo` globs. Only Copilot applies those automatically; every other
client had to be told to read them.

Packs instead contribute a section to the target's root `AGENTS.md`, which
Codex, Claude Code, GitHub Copilot, and Cursor-compatible clients all read.
Each section states its scope in prose, so every client sees the same rules.
By default, Claude Code reads `AGENTS.md` only when no `CLAUDE.md` or
`CLAUDE.local.md` exists, so the installer never writes either file. The
`.github/copilot-instructions.md` pointer covers Copilot surfaces that do not
read `AGENTS.md`.

Because `AGENTS.md` is always loaded, keep rules fragments short and move
procedures into skills.

## Versioning

Each pack versions independently with Semantic Versioning and records every
release in its README changelog.

- **Patch:** clarifies wording or fixes a command without changing personas,
  skills, or routes.
- **Minor:** adds a compatible persona, skill, route, rule, or command.
- **Major:** renames or removes a persona or skill, changes `requires` or
  `conflicts`, or changes a rule incompatibly.

Repository releases are versioned separately; see
[releases and versioning](releases-and-versioning.md).

## Proposing a New Pack

1. Show that no existing core or pack owner fits, and that the stack has real
   workflows of its own: a toolchain, framework conventions, platform
   operations, or verification tooling.
2. Define every skill's trigger, inputs, bounded workflow, deterministic
   checks, safety boundaries, required evidence, and completion condition.
3. Declare the manifest, including `commands`, `requires`, `conflicts`, and
   `routes`, and add a `## <Pack> routes` section to the
   [routing guide](agent-routing.md).
4. Add the pack to the `reference` profile, and to a named profile only when the
   combination is common.
5. Follow the pack checklist in [`CONTRIBUTING.md`](../CONTRIBUTING.md).

## Verify an Installation

Automated checks prove the files are consistent; they do not prove that a
client discovered them. After installing, record each client's name and
version, the operating system, and the observed result.

- **Claude Code:** `/memory` or `/context` shows `AGENTS.md`, `/agents` lists the
  installed personas, and `/skills` lists each skill once. The target has no
  `CLAUDE.md` or `CLAUDE.local.md`.
- **Codex:** the installed custom agents and skills are listed, and a read-only
  task delegated to `research-agent` completes.
- **GitHub Copilot:** the agent picker shows the installed personas, and each
  skill is listed once even though it exists in two skill directories.
- **Cursor:** `AGENTS.md` rules apply, and each persona and skill is listed
  once.
