# Contributing to SWE Agents

Thank you for helping improve this portable agentic-engineering reference.
Documentation fixes, new examples, portability improvements, issue reports, and
carefully scoped persona or skill changes are welcome.

By submitting a contribution, you agree that it is licensed under the
[Apache License 2.0](LICENSE).

## Before You Start

- Search existing issues and pull requests before opening a new one.
- Use an issue to discuss large, cross-runtime, or compatibility-changing work.
- Do not use a public issue for vulnerabilities. Follow
  [`SECURITY.md`](SECURITY.md).
- Keep examples fictional and remove credentials, private domains, customer
  information, provider accounts, and deployable infrastructure.

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

Personas and skills under `.github/` are canonical. Do not edit generated
Codex or Claude Code copies directly.

When changing a canonical persona or skill:

```bash
pnpm sync:setup
pnpm check:all
```

Commit the canonical change and all regenerated files together. A pull request
with stale generated files will fail CI.

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
- Run `pnpm check:all` before requesting review.

## Pull Request Expectations

A useful pull request has one clear purpose, explains the motivation and user
impact, lists the checks that actually ran, and calls out anything that remains
unverified. Screenshots are useful only when the change has a visual effect.

The maintainers in [`.github/CODEOWNERS`](.github/CODEOWNERS) review changes.
Repository roles are granted gradually based on sustained, constructive
participation; they are not required to contribute.
