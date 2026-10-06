# Releases and Versioning

SWE Agents is a public reference distributed under the Apache License 2.0. The
`test` branch collects accepted contributions, the `main` branch holds the
latest promoted snapshot, and tagged releases identify reviewed, reproducible
reference versions.

The package remains marked `private` to prevent accidental publication to a
package registry. Repository visibility and package-registry publication are
separate concerns.

## Branches

| Branch | Role |
| --- | --- |
| `test` | Integration branch; every contribution pull request targets it |
| `main` | Default branch; receives `test` by promotion and carries the release tags |

Maintainers promote `test` to `main` with a pull request for each release. The
[reference checks](../.github/workflows/reference-checks.yml) run on every pull
request and on every push to `main` and `test`, on Linux and Windows.
`swe-agents update` follows the lock's `source.ref`, `main` by default, so
adopters receive only promoted changes unless they pass `--ref test`.

## Version Policy

Use Semantic Versioning for the reference contract:

- Patch releases clarify prose or fix validators without changing accepted
  artifact shapes.
- Minor releases add compatible personas, skills, checks, schemas, examples,
  stack packs, profiles, or CLI commands and options.
- Major releases change required sections, routing semantics, evidence schemas,
  the pack manifest, lock-file, or contribution-bundle shape, CLI commands,
  options, or exit codes, or adopting-repository obligations incompatibly.

## Pack Versions

Each stack pack also carries its own semantic version in
`stacks/<pack>/pack.json` and a changelog section in its README. A pack's
version changes when that pack changes, independently of other packs; see
[stack packs](stack-packs.md#versioning) for the pack-level rules. A repository
release records the version of every pack it contains, and a target
repository's `.agents/stacks.lock.json` records the source repository, ref,
and commit and the pack versions it installed.

## Release Gate

Before creating a tag or GitHub release, the release owner must:

1. Complete the applicable items in
   [`REVIEW_CHECKLIST.md`](../REVIEW_CHECKLIST.md) with named evidence.
2. Confirm that [CODEOWNERS](../.github/CODEOWNERS) points to an active
   maintainer or maintainers team.
3. Confirm that private vulnerability reporting and [`SECURITY.md`](../SECURITY.md)
   are current.
4. Merge the promotion pull request from `test` to `main` only after its hosted
   checks pass.
5. Run the Linux and Windows CI matrix from the release commit on `main`.
6. Run `pnpm install --frozen-lockfile` and `pnpm check:all` from a clean clone.
7. Confirm that every changed pack has a version bump and a changelog entry,
   and that `pnpm check:stacks` passes.
8. Review [`PROVENANCE.json`](../PROVENANCE.json) and
   [`SOURCE_MAP.md`](../SOURCE_MAP.md) for the release snapshot.
9. Record known limitations and any unrun runtime smoke checks.

Record each release's version, source revision, pack versions, check results,
known limitations, and schema migration notes. Local success does not prove
client discovery, hosted CI, deployment, or provider behavior.
