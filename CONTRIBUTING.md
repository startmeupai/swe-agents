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

1. Fork the repository.
2. Create a focused branch such as `feat/add-agent` or `fix/windows-parity`.
3. Make the smallest coherent change that solves the issue.
4. Update tests, checks, examples, and documentation that define the same
   contract.
5. Run the required commands below.
6. Open a pull request using the repository template.
7. Address CI and maintainer feedback.

Maintainers normally squash-merge accepted pull requests. Contributors do not
need organization membership or direct write access.

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

A useful pull request has one clear purpose, explains the motivation and user
impact, lists the checks that actually ran, and calls out anything that remains
unverified. Screenshots are useful only when the change has a visual effect.

The maintainers in [`.github/CODEOWNERS`](.github/CODEOWNERS) review changes.
Repository roles are granted gradually based on sustained, constructive
participation; they are not required to contribute.
