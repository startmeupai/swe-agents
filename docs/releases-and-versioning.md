# Releases and Versioning

SWE Agents is a public reference distributed under the Apache License 2.0. The
repository's `main` branch contains the current development snapshot; tagged
releases identify reviewed, reproducible reference versions.

The package remains marked `private` to prevent accidental publication to a
package registry. Repository visibility and package-registry publication are
separate concerns.

## Version Policy

Use Semantic Versioning for the reference contract:

- Patch releases clarify prose or fix validators without changing accepted
  artifact shapes.
- Minor releases add compatible personas, skills, checks, schemas, examples,
  stack packs, or profiles.
- Major releases change required sections, routing semantics, evidence schemas,
  the pack manifest or lock-file shape, or adopting-repository obligations
  incompatibly.

## Pack Versions

Each stack pack also carries its own semantic version in
`stacks/<pack>/pack.json` and a changelog section in its README. A pack's
version changes when that pack changes, independently of other packs; see
[stack packs](stack-packs.md#versioning) for the pack-level rules. A repository
release records the version of every pack it contains, and a target
repository's `.agents/stacks.lock.json` records the source commit and the pack
versions it installed.

## Release Gate

Before creating a tag or GitHub release, the release owner must:

1. Complete the applicable items in
   [`REVIEW_CHECKLIST.md`](../REVIEW_CHECKLIST.md) with named evidence.
2. Confirm that [CODEOWNERS](../.github/CODEOWNERS) points to an active
   maintainer or maintainers team.
3. Confirm that private vulnerability reporting and [`SECURITY.md`](../SECURITY.md)
   are current.
4. Run the Linux and Windows CI matrix from the release commit.
5. Run `pnpm install --frozen-lockfile` and `pnpm check:all` from a clean clone.
6. Confirm that every changed pack has a version bump and a changelog entry,
   and that `pnpm check:stacks` passes.
7. Review [`PROVENANCE.json`](../PROVENANCE.json) and
   [`SOURCE_MAP.md`](../SOURCE_MAP.md) for the release snapshot.
8. Record known limitations and any unrun runtime smoke checks.

Record each release's version, source revision, pack versions, check results,
known limitations, and schema migration notes. Local success does not prove
client discovery, hosted CI, deployment, or provider behavior.
