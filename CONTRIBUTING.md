# Contributing to SWE Agents

Thank you for helping improve this portable agentic-engineering seed.
Documentation fixes, new examples, portability improvements, issue reports,
carefully scoped persona or skill changes, and new or improved stack packs are
welcome.

By submitting a contribution, you agree that it is licensed under the
[Apache License 2.0](LICENSE).

## Before You Start

- Search existing issues and pull requests before opening a new one.
- Use an issue to discuss large, cross-runtime, or compatibility-changing work.
- Do not use a public issue for vulnerabilities. Follow
  [`SECURITY.md`](SECURITY.md).
- Keep examples fictional and remove credentials, private domains, customer
  information, provider accounts, and deployable infrastructure. Use the shared
  placeholder vocabulary rather than inventing new names: `ExampleApp` for the
  product, `Project Alpha` for a project, and the reserved `example.invalid`
  domain for hosts and URLs.

## Contribution Workflow

Every pull request targets the `test` integration branch, never `main`.
Maintainers promote `test` to `main` by pull request for each release; see
[releases and versioning](docs/releases-and-versioning.md). Choose the lane
that fits.

| Lane | Use it when | Push vehicle |
| --- | --- | --- |
| Fork and pull request | You change SWE Agents directly | Your fork |
| From your adopting repository | You improved an installed persona or skill, or wrote a new one, in a repository that installed SWE Agents | A fork of SWE Agents that `gh` creates on demand |
| Issue with a bundle | You cannot push a branch anywhere | None; a maintainer carries the change |

### Fork and Pull Request

1. Fork the repository.
2. Create a focused branch from `test`, such as `feat/add-agent` or
   `fix/windows-parity`.
3. Make the smallest coherent change that solves the issue.
4. Update tests, checks, examples, and documentation that define the same
   contract.
5. Run the required commands below.
6. Open a pull request against `test` using the repository template, with
   `Origin: fork`.
7. Address CI and maintainer feedback.

### From Your Adopting Repository

The `upstream-agent` persona, installed with the core, runs this lane with the
`upstream-contribution` skill. You can also run each step yourself.
`swe-agents` means `npx --yes github:startmeupai/swe-agents` from your
repository, or `pnpm swe-agents` with `--target <dir>` from a clone.

1. Run `swe-agents contribute --dry-run` in your repository and review the
   items: edits to installed files, and new personas or skills that the lock
   does not list. Edits to the `AGENTS.md` managed block are not bundled;
   carry a rule change to `core/AGENTS.md` or the pack's `AGENTS.md` by hand.
2. Run `swe-agents contribute` to write the bundle to
   `.agents/contributions/<slug>/`, and review its `SUMMARY.md`, every patch,
   and every copied file. Plan how to generalize each item to the placeholder
   vocabulary and which project-specific commands, paths, and names to drop.
3. Run `swe-agents contribute --apply`. In the source checkout, which is your
   clone or the cached clone in `$SWE_AGENTS_HOME/source`, it creates a
   `contrib/<slug>` branch from `test` on the `upstream` remote, or on
   `origin` when there is no `upstream`. It refuses when the checkout has
   uncommitted changes or the branch exists, stages each patched canonical
   file, copies new files untracked, and never pushes.
4. On that branch, generalize every item, decide where each new persona or
   skill belongs, bump each changed pack's version and changelog, then run
   `pnpm sync:setup` and `pnpm check:all` and commit.
5. Review the final diff and pull request body. Only after you confirm does
   `upstream-agent` run the outward-facing steps below with your own `gh`
   login.

```bash
gh repo fork startmeupai/swe-agents --remote=false   # only when you cannot push upstream
git push https://github.com/<owner>/swe-agents.git contrib/<slug>
gh pr create --repo startmeupai/swe-agents --base test --head <owner>:contrib/<slug>
```

After the pull request exists, delete `.agents/contributions/<slug>/` from your
repository.

Outside contributors still need a fork of SWE Agents as the push vehicle; `gh`
creates it under your account the first time. Your own project is never
forked, pushed, or uploaded: only the reviewed patches and new files leave it.

### Issue With a Bundle

When you cannot push a branch anywhere, run `swe-agents contribute` and open a
[contribution proposal](https://github.com/startmeupai/swe-agents/issues/new?template=contribution_proposal.yml).
Paste the bundle's `SUMMARY.md` and attach its `patches/` and `files/`
directories as a zip. A maintainer reviews the proposal against the same
expectations as a pull request and may carry it into one.

### Merging

Maintainers normally squash-merge accepted pull requests into `test`.
Contributors do not need organization membership or direct write access.

## Local Setup

Use the exact Node.js version in [`.nvmrc`](.nvmrc) and the pnpm version pinned
in [`package.json`](package.json).

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm check:all
```

## Canonical and Generated Changes

Personas, skills, and rules are canonical under `core/` (stack-neutral) and
`stacks/<pack>/` (one directory per stack pack). Profiles in `profiles/` are
hand-written. These directories are generated from them as this repository's
install of the `reference` profile, and must not be edited directly:

- `.claude/agents/` and `.claude/skills/`
- `.agents/skills/`
- `.codex/agents/`
- `.github/agents/`

When changing a canonical persona, skill, rules fragment, pack manifest, or
profile:

```bash
pnpm sync:setup
pnpm check:all
```

Commit the canonical change and all regenerated files together. A pull request
with stale generated files will fail CI.

Core files must never name a pack, a pack persona, a pack skill, or a pack
command. A pack may reference core skills and the skills of the packs it
requires. See [stack packs](docs/stack-packs.md) for the full contract.

## Adding or Changing a Stack Pack

1. Show that no existing core or pack owner fits the stack's workflows.
2. Write `stacks/<pack>/pack.json` with `name`, `kind`, `version`,
   `description`, `requires`, `conflicts`, `detect`, `commands`, `agents`,
   `skills`, and `routes`. The `agents` and `skills` lists must match the files
   exactly.
3. Write `stacks/<pack>/README.md` covering scope, additions, prerequisites, and
   combinations, with a changelog entry for the new version.
4. Write `stacks/<pack>/AGENTS.md` with the pack's rules, stating their scope in
   prose.
5. Add personas under `agents/` and skills under `skills/`. Name new ones with
   the pack prefix, such as `<pack>-feature-agent`, and keep every name unique
   across the core and all packs.
6. Add the pack's routes to a `## <Pack> routes` section of the
   [routing guide](docs/agent-routing.md), and add its personas to the catalog
   in [`.github/AGENTS.md`](.github/AGENTS.md).
7. Add the pack to `profiles/reference.json`, and to another profile only when
   the combination is common.
8. Bump the pack's version for every change to an existing pack.
9. Add a [`SOURCE_MAP.md`](SOURCE_MAP.md) row covering `stacks/<pack>/**`.
10. Run `pnpm check:stacks`, `pnpm sync:setup`, and `pnpm check:all`.

## Review Expectations for Adopter Contributions

A change that starts in an adopting repository is reviewed like any other pull
request, with these additions:

- **Generalized.** It reads as if written for this reference. `ExampleApp`,
  `Project Alpha`, and `example.invalid` replace real names, and
  project-specific commands, paths, hosts, and conventions are removed or
  expressed through the installed packs' commands. A rule that helps only one
  project belongs in that project's `AGENTS.md`, outside the managed block.
- **Sanitized again.** The bundle's scans catch credential patterns, absolute
  local paths, this repository's blocked terms, and your project's directory
  and package names; they cannot know your customers, hosts, or people. CI
  reruns the sanitization and secret checks in `pnpm check:all` on every pull
  request, and a reviewer still reads every line.
- **Placed.** Each new persona or skill marked `needs-decision` states whether
  it belongs in the core or a pack, and why. Core files must not name a pack.
- **Versioned.** Each changed pack has a version bump and a changelog entry. A
  core-only change needs no pack bump; it ships in the next repository
  release.
- **Complete.** The pull request includes the regenerated runtime files, the
  catalog and routing updates for a new persona, `SOURCE_MAP.md` rows, and a
  passing `pnpm check:all`.
- **Labeled.** The pull request body says `Origin: adopter repository (sanitized)`
  and names the affected packs.

## Change Requirements

- Keep the project generic and reference-only; do not add product code.
- Preserve the separation between instructions, personas, skills, checks, and
  evidence artifacts.
- Update [`SOURCE_MAP.md`](SOURCE_MAP.md) for every added, removed, or renamed
  tracked artifact.
- Treat browser templates as `not-run`. Only a real evidence run may use
  `manifestType: evidence`, and every referenced artifact must exist.
- Keep automated, browser, provider, deployment, legal, and human gates
  separate.
- Add or update deterministic checks when changing a validated contract.
- Before adding a persona, show that no existing core or pack owner fits.
  Before adding a skill, define its trigger, inputs, bounded workflow,
  deterministic checks, safety boundaries, required evidence, and completion
  condition. Update the catalog, [routing guide](docs/agent-routing.md), and
  source map in the same change.
- Run `pnpm check:all` before requesting review.

## Pull Request Expectations

A useful pull request targets `test`, has one clear purpose, explains the
motivation and user impact, lists the checks that actually ran, and calls out
anything that remains unverified. Screenshots are useful only when the change has a visual effect.

The maintainers in [`.github/CODEOWNERS`](.github/CODEOWNERS) review changes.
Repository roles are granted gradually based on sustained, constructive
participation; they are not required to contribute.
