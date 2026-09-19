# Contributing

This repository is a private, reference-only extraction while publication and
licensing decisions remain open. Do not publish, fork publicly, or accept
external contributions until the publication checklist is complete and a
license is selected.

## Local Setup

Use the exact Node.js version in [`.nvmrc`](.nvmrc) and the pnpm version pinned
in [`package.json`](package.json). Corepack can activate that pnpm version.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm check:all
```

The checks use only Node.js standard-library APIs. The install step verifies
the package-manager and lockfile contract; it does not add runtime dependencies.

## Change Requirements

- Keep the project generic and reference-only; do not add product code,
  credentials, customer data, private hosts, or deployable infrastructure.
- Preserve the separation between instructions, personas, skills, checks, and
  evidence artifacts.
- Update [`SOURCE_MAP.md`](SOURCE_MAP.md) for every added, removed, or renamed
  tracked artifact.
- Treat browser templates as `not-run`. Only a real evidence run may use
  `manifestType: evidence`, and every referenced artifact must exist.
- Keep automated, browser, provider, deployment, legal, and human gates
  separate.
- Run `pnpm check:all` before requesting review.

## Review and Publication

Changes should receive review from the maintainers named in `CODEOWNERS` once
real owners are configured. Until then, owner assignment and all items in
[`REVIEW_CHECKLIST.md`](REVIEW_CHECKLIST.md) remain human gates.

Security-sensitive reports follow [`SECURITY.md`](SECURITY.md). Release and
versioning policy is documented in
[`docs/releases-and-versioning.md`](docs/releases-and-versioning.md).
