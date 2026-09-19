# Releases and Versioning

This repository is currently private and unreleased at `0.0.0-private`. Creating
a tag, GitHub release, package publication, or public mirror is prohibited until
the owner completes the publication checklist and selects a license.

## Version Policy

After those gates close, use Semantic Versioning for the reference contract:

- Patch releases clarify prose or fix validators without changing accepted
  artifact shapes.
- Minor releases add compatible personas, skills, checks, schemas, or examples.
- Major releases change required sections, routing semantics, evidence schemas,
  or adopting-repository obligations incompatibly.

The first public release version is an owner decision. Do not infer `1.0.0` from
the repository's current completeness.

## Release Gate

Before any release, the release owner must:

1. Complete [`REVIEW_CHECKLIST.md`](../REVIEW_CHECKLIST.md) with named human
   evidence.
2. Replace the comment-only [CODEOWNERS template](../.github/CODEOWNERS) with
   real GitHub users or teams.
3. Configure a private reporting channel and update [`SECURITY.md`](../SECURITY.md).
4. Select and add a license after legal or owner review.
5. Run the Linux and Windows CI matrix from the release commit.
6. Run `pnpm install --frozen-lockfile` and `pnpm check:all` from a clean clone.
7. Review [`PROVENANCE.json`](../PROVENANCE.json) and
   [`SOURCE_MAP.md`](../SOURCE_MAP.md) for the release snapshot.

Record each release's version, source revision, check results, known
limitations, and any schema migration notes. Local success is not release,
deployment, or publication evidence.
