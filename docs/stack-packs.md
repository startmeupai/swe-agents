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
| `detect` | Path patterns that `detect` and `init` match against a target to suggest the pack; see [detection](#detection) |
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

## Command Line

`scripts/stacks/cli.mjs` is the `swe-agents` command. Run it from any
repository with `npx --yes github:startmeupai/swe-agents <command>`, or from a
clone with `pnpm swe-agents <command>` or
`node scripts/stacks/cli.mjs <command>`. `scripts/stacks/install.mjs` and
`pnpm stacks:install` remain the `install` command with the same options.

```text
swe-agents init       [--target <dir>] [--packs a,b | --profile <name>] [--yes] [--dry-run] [--ref <git-ref>]
swe-agents detect     [--target <dir>] [--json]
swe-agents install    --target <dir> (--profile <name> | --packs a,b) [--yes] [--dry-run] [--force]
swe-agents update     [--target <dir>] [--yes] [--dry-run] [--force] [--no-merge] [--ref <git-ref>]
swe-agents contribute [--target <dir>] [--slug <name>] [--base <branch>] [--apply] [--dry-run]
swe-agents --help | --version
```

| Command | Effect |
| --- | --- |
| `init` | Detects packs, prints a suggestion table, asks for confirmation, installs, and prints next steps |
| `detect` | Lists the packs whose `detect` patterns match the target |
| `install` | Installs a profile or pack list |
| `update` | Reinstalls the locked selection from the locked source and merges local edits |
| `contribute` | Writes a sanitized bundle of local improvements for upstream |

| Option | Meaning |
| --- | --- |
| `--target <dir>` | Adopting repository. Defaults to the current directory unless that is the SWE Agents checkout; `install` always requires it |
| `--profile <name>` | Install `profiles/<name>.json`; use this or `--packs`. For `init`, replaces detection |
| `--packs a,b` | Install an explicit list; required packs are added. For `init`, replaces detection |
| `--yes` | `init`, `install`, and `update`: apply the plan without asking; without a terminal, nothing is written unless it is set |
| `--dry-run` | Print the plan; write nothing |
| `--force` | `install` and `update`: overwrite edited, unowned, and conflicting files; remove edited files the selection no longer installs |
| `--no-merge` | `update`: keep edited files as they are instead of merging them |
| `--ref <git-ref>` | `init` and `update`: branch, tag, or commit for the cached source clone; `update` defaults to the lock's `source.ref`, then `main` |
| `--json` | `detect`: print machine-readable output |
| `--slug <name>` | `contribute`: bundle name; defaults to `<YYYYMMDD>-<target directory name>` |
| `--base <branch>` | `contribute`: upstream branch for `--apply` and the pull request; defaults to `test` |
| `--apply` | `contribute`: create `contrib/<slug>` in the source checkout and apply the bundle |

`init`, `install`, and `update` always print the plan and its notices first:
every file to create, update, merge, or remove, every existing file kept, and
any warning. They then ask y/N on a terminal. Exit code `0` means success, `1`
an error, and `2` that a human decision is needed or nothing was done, such as
a declined prompt, or no terminal and no `--yes`.

### Source Checkout

The CLI reads the core, packs, and profiles from a source checkout:

1. When `cli.mjs` runs inside a Git checkout that has `core/`, `stacks/`, and
   `profiles/`, such as a clone or a fork, it uses that checkout as it is. The
   lock records its `origin` URL and `HEAD` commit. Pull the clone yourself
   before running `update` from it.
2. Otherwise, such as under `npx`, it uses `$SWE_AGENTS_HOME/source`, by
   default `.swe-agents/source` in the home directory. It clones
   `https://github.com/startmeupai/swe-agents`, or `$SWE_AGENTS_REPO` when
   set, at `--ref`, `main` by default, when the directory is absent. `init`
   and `update` fetch, check out the ref, and fast-forward it.

A lock is written only with a full 40-character commit. When the commit cannot
be determined, the command fails instead.

### Detection

`detect` and `init` match every pack's `detect` patterns against the target's
repository-relative paths. Patterns support `*`, `**`, `?`, a leading `**/`,
and a trailing `/**`. The walk skips `.git`, `node_modules`, `dist`, `build`,
`.next`, `coverage`, `vendor`, `target`, `__pycache__`, `.venv`, and `venv`. A
pack with at least one match is suggested together with its `requires`.
`--json` prints:

```json
{ "packs": [{ "name": "python", "kind": "language", "matches": ["pyproject.toml"], "requires": [] }] }
```

Detection only suggests. `init` asks before it installs, and `--packs` or
`--profile` replaces detection.

### Installation

`install` and `init`, after showing the plan and getting confirmation:

1. Resolves the profile or pack list, adds required packs, and fails on a
   missing pack, a cycle, a conflict, or a duplicate persona or skill name.
2. Writes `AGENTS.md` from the core rules plus one section per installed pack.
3. Copies personas and skills into each client's discovery paths, without
   symlinks, and creates `.github/copilot-instructions.md` only if it is absent.
4. Refuses to overwrite a file whose hash differs from the lock file, or a file
   it did not install, unless `--force` is set, and removes only unedited files
   it installed that the selection no longer includes.
5. Writes `.agents/stacks.lock.json`.

Each persona is written three ways: verbatim to `.claude/agents/<name>.md`,
without its `skills` block to `.github/agents/<name>.agent.md`, and as
`.codex/agents/<name>.toml`, which uses `sandbox_mode = "read-only"` when the
persona cannot edit files.

### Lock File

The lock records where the install came from, what it wrote, and where each
copied file came from:

```json
{
  "lockVersion": 2,
  "source": { "repo": "https://github.com/startmeupai/swe-agents", "ref": "main", "commit": "<40 hex>" },
  "profile": "python-api-docker",
  "packs": [
    { "name": "python", "version": "0.1.0" },
    { "name": "docker", "version": "0.1.0" }
  ],
  "files": { "AGENTS.md": "<sha256>", ".claude/agents/python-feature-agent.md": "<sha256>" },
  "origins": { ".claude/agents/python-feature-agent.md": "stacks/python/agents/python-feature-agent.md" }
}
```

| Field | Meaning |
| --- | --- |
| `lockVersion` | `2` |
| `source.repo` | The source repository URL: the upstream repository, or the `origin` of the clone or fork that ran the install |
| `source.ref` | The branch or tag that `update` follows |
| `source.commit` | The full commit the installed files were rendered from |
| `profile` | The installed profile, or `null` for a `--packs` install |
| `packs` | Each installed pack and its version |
| `files` | Each installed path and the SHA-256 hash of its pristine installed content; for `AGENTS.md`, of the managed block |
| `origins` | Each installed path and its canonical source path, such as `core/agents/<name>.md` or `stacks/<pack>/skills/<name>/<file>` |
| `bases` | Present only while an edited file skipped by an update waits to merge against an older commit; maps the path to that commit |

Composed files have no origin: `AGENTS.md`, `.codex/config.toml`,
`.codex/agents/*.toml`, and `.github/copilot-instructions.md`. Writers always
write version 2 with sorted keys. A version 1 lock, with no `lockVersion`, a
`source.repo` of `swe-agents`, and no `origins`, is still read. `update`
cannot merge on that run and writes a version 2 lock for the next one;
`contribute` derives the origins by rendering the lock's commit.

## Updates

`update` reads the lock, resolves the same source repository at its newest
`source.ref`, or at `--ref`, and reinstalls the locked profile or pack list.
Each file is planned against the lock:

| File state | Action | Result |
| --- | --- | --- |
| Matches its lock hash | `update` | Replaced with the new rendered content |
| Already equals the new content | `unchanged` | Nothing to do |
| Edited; the three-way merge is clean | `merge` | Merged content written |
| Edited; the merge conflicts | `skip-conflict` | Nothing written; the conflicting hunks are reported |
| Edited, with `--no-merge` | `skip-edited` | Kept as it is |
| Not listed in the lock | none | Yours; never changed or removed |
| Not listed in the lock, but the new selection installs that path | `skip-unowned` | Kept as it is |
| Listed but no longer installed | `remove` or `keep-edited` | Removed when unedited; left unmanaged when edited |
| Edited or unowned, with `--force` | `overwrite` | Replaced with the new rendered content |

The three-way merge uses `git merge-file`. The base is the pristine content at
the lock's `source.commit`, rendered exactly as the installer renders it; ours
is the current file; theirs is the new rendered content. After a clean merge,
the lock records the hash of the new pristine content, not of the merged
content, so the file stays edited and merges again on the next update. The
`AGENTS.md` managed block follows the same logic on the block text, and text
outside the block is never touched.

`update` exits with code 2 while any file is skipped. To resolve a
`skip-conflict`, compare the three versions, keep the local intent while
taking the upstream change, and rerun `update`; or accept upstream with
`--force`. The `upstream-update` skill covers this workflow.

## Contribute Loop

`contribute` turns local improvements in an adopting repository into a
reviewable bundle. It runs locally, never calls `gh`, and never pushes. The
source must be a Git checkout, such as a clone or the cached clone under
`$SWE_AGENTS_HOME`, so that it can render the lock's commit.

1. Reads the lock, version 1 or 2. Without a lock, or with a lock that records
   no source commit, it exits with code 2 and an upgrade hint. For a version 1
   lock, it derives each file's origin by rendering the lock's commit, and the
   manifest records `lockVersion` and `originsDerived`.
2. For each edited managed file, renders the installed base at
   `source.commit` and carries the local change onto the canonical file at
   that commit with `git merge-file`. The patch is a unified diff against the
   canonical file (`patchBase: "canonical"`), so `git apply --3way` applies it.
   When that merge conflicts, because the change overlaps lines the installer
   rewrites, such as links or frontmatter, the patch falls back to the
   installed form (`patchBase: "rendered"`) with a note. When several client
   copies of one origin were edited, one is patched and the others are noted.
3. Treats every file under `.claude/agents`, `.claude/skills`,
   `.agents/skills`, `.codex/agents`, and `.github/agents` that the lock does
   not list as a `new` adopter-authored persona or skill. It merges the
   per-client copies into one item, prefers the `.claude/` copy, and proposes
   a destination: `stacks/<pack>/agents/` or `stacks/<pack>/skills/` when the
   name starts with an installed pack's name and a hyphen, or the directory of
   an installed skill that the new file joins; otherwise `core/agents/` or
   `core/skills/` with `decision: "needs-decision"`. A destination that already
   exists upstream also needs a decision.
4. Leaves out, with a reason in `skipped`: deleted files, symbolic links,
   Codex-only personas, binary files, files the installer does not recognize,
   and edits to the `AGENTS.md` managed block or other composed files. Carry
   such a rule edit to `core/AGENTS.md` or the pack's `AGENTS.md` by hand.
5. Scans every patch and new file with the patterns of the repository's secret
   and sanitization checks. The sanitization scan also flags the adopting
   project's own name, taken from the target directory name and the `name` in
   `package.json` or `pyproject.toml`. A secret hit is a `fail` and writes
   nothing; a sanitization hit is a `warn`.
6. Writes the bundle to `<target>/.agents/contributions/<slug>/`.

```text
manifest.json
patches/<origin path with "/" replaced by "__">.patch
files/<proposed origin>          # copies of new adopter-authored files
SUMMARY.md                       # item table, checks, skipped files, pull request body draft
```

Exit code `0` means the bundle was written, even with `needs-decision` items;
`2` means nothing to contribute, a sanitization warning, or an item that did
not apply cleanly; `1` means an error or a secret hit.

```json
{
  "bundleVersion": 1,
  "slug": "20261006-example-app",
  "createdAt": "2026-10-06T00:00:00Z",
  "source": { "repo": "https://github.com/startmeupai/swe-agents", "ref": "main", "commit": "<40 hex>" },
  "base": "test",
  "lockVersion": 2,
  "originsDerived": false,
  "items": [
    {
      "kind": "edit",
      "targetPath": ".claude/agents/python-feature-agent.md",
      "origin": "stacks/python/agents/python-feature-agent.md",
      "pack": "python",
      "patch": "patches/stacks__python__agents__python-feature-agent.md.patch",
      "patchBase": "canonical",
      "decision": "auto",
      "checks": { "sanitization": "pass", "secrets": "pass" },
      "findings": [],
      "notes": [],
      "appliedCleanly": null
    },
    {
      "kind": "new",
      "targetPath": ".claude/agents/example-agent.md",
      "proposedOrigin": "core/agents/example-agent.md",
      "pack": null,
      "file": "files/core/agents/example-agent.md",
      "decision": "needs-decision",
      "checks": { "sanitization": "warn", "secrets": "pass" },
      "findings": ["core/agents/example-agent.md: adopter project name detected; generalize it to ExampleApp"],
      "copies": [".claude/agents/example-agent.md", ".github/agents/example-agent.agent.md", ".codex/agents/example_agent.toml"],
      "notes": [],
      "appliedCleanly": null
    }
  ],
  "skipped": [
    { "targetPath": "AGENTS.md", "reason": "managed block edited; it is composed from the core and pack rules, so carry the change to core/AGENTS.md or the pack AGENTS.md by hand" }
  ],
  "apply": null
}
```

| Field | Meaning |
| --- | --- |
| `lockVersion`, `originsDerived` | The lock version read, and whether origins were derived from the rendered commit |
| `skipped` | Files left out of the bundle, each with its reason |
| `apply` | `null`, or the branch, remote, and base ref that `--apply` used |
| `kind` | `edit` for a changed installed file; `new` for an adopter-authored persona or skill |
| `targetPath` | The path in the adopting repository |
| `origin`, `proposedOrigin` | The canonical path in SWE Agents, known or proposed |
| `pack` | The owning pack, or `null` for the core |
| `patch`, `file` | The bundle-relative diff or file copy |
| `patchBase` | `canonical` when the diff targets the canonical file; `rendered` when it targets the installed form |
| `decision` | `auto` when the destination is known; `needs-decision` when the contributor and maintainers choose between the core and a pack |
| `checks`, `findings` | The `sanitization` and `secrets` results, and what each scan found |
| `notes`, `copies` | Review notes, and the client copies a `new` item merges |
| `appliedCleanly` | `null` until `--apply` runs; then whether the item applied without conflict |

`SUMMARY.md` ends with a pull request body draft. The draft states
`Origin: adopter repository (sanitized)`, the affected packs, and the
Apache-2.0 contribution statement from [`CONTRIBUTING.md`](../CONTRIBUTING.md).
It ends with a checklist of what still needs a human: generalizing to the
`ExampleApp` vocabulary, a pack version bump and changelog entry, and
`pnpm sync:setup && pnpm check:all`.

`--apply` refuses when the source checkout has uncommitted changes or a
`contrib/<slug>` branch already exists. It fetches `<base>` from the
`upstream` remote when one exists, otherwise from `origin`, and runs
`git switch --no-track -c contrib/<slug> <remote>/<base>`. It applies each
patch with `git apply --3way`, which stages the patched file, and copies each
new file to its proposed origin, untracked; a new file whose destination
already exists is left untouched. It records `appliedCleanly` per item and
`apply` in the manifest, then prints the items that need attention, the
remaining manual steps, and the exact `gh pr create` command. `--dry-run`
prints the item table and writes nothing.

The outward-facing steps, fork, push, and pull request against `test`, belong
to `upstream-agent` and the person it works for; see the
[contribution workflow](../CONTRIBUTING.md#from-your-adopting-repository) and
the [security boundaries](security-boundaries.md#upstream-updates-and-contributions).

## How Rules Reach Each Client

Earlier versions kept path-scoped rules in Copilot `*.instructions.md` files
with `applyTo` globs. Only Copilot applies those automatically; every other
client had to be told to read them.

Packs instead contribute a section to the target's root `AGENTS.md`, which
Codex, Claude Code, Cursor, and the Copilot cloud agent, CLI, GitHub.com code
review, and VS Code chat read. Each section states its scope in prose, so every
client that reads `AGENTS.md` sees the same rules.
By default, Claude Code reads `AGENTS.md` only when no `CLAUDE.md`,
`.claude/CLAUDE.md`, or `CLAUDE.local.md` exists in the working directory or
above it, so the installer never writes any of them. A `CLAUDE.md` with the
line `@AGENTS.md` imports the rules and keeps both working; the installer warns
while none of these files imports `AGENTS.md`. Copilot surfaces that do
not read `AGENTS.md`, such as Copilot Chat on GitHub.com and in Visual Studio
and JetBrains IDEs, read only the short `.github/copilot-instructions.md`
pointer, not the pack rules it links to.

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

- **Claude Code:** `/memory` or `/context` shows `AGENTS.md`, `/context` lists
  the installed personas under custom subagents, and `/skills` lists each skill
  once. Either the target and the directories above it have no `CLAUDE.md`,
  `.claude/CLAUDE.md`, or `CLAUDE.local.md`, or one of them imports
  `@AGENTS.md`.
- **Codex:** `/skills` lists the installed skills, and a read-only task
  delegated to `research_agent`, the persona's Codex name, completes.
- **GitHub Copilot:** the agent picker shows the installed personas. Copilot
  CLI lists each skill once because it keeps the first skill it finds per name;
  in VS Code and the cloud agent, whether each skill is listed once is
  unverified; check your client version.
- **Cursor:** `AGENTS.md` rules apply. Whether each persona and skill is listed
  once is unverified; check your client version.
