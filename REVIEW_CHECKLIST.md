# Public Readiness Review Checklist

## Recorded Local Review — 2026-09-19

This review covers the standalone reference directory. Checked items record
static inspection and local command results; they do not represent live client
discovery, hosted CI, or later release approval.

- [x] Inspected the reference for product code, private helper imports, module
  names, local paths, deployment accounts, credentials, and customer data; none
  were found outside split detection terms in the sanitization validator.
- [x] Generalized inherited administrator-policy and infrastructure-generator
  assumptions so they depend on the adopting project's contracts.
- [x] Included native Codex, Claude Code, and Copilot persona and skill surfaces
  generated from sanitized canonical files using independent copies.
- [x] Added deterministic runtime parity verification to the local check suite.
- [x] Documented tool-specific routing and explicit instruction loading.

The source map intentionally retains relative donor artifact paths, and
`PROVENANCE.json` retains a private base revision. These are provenance metadata,
not product implementations. No donor repository URL or local checkout path is
included. Sanitization scans are heuristic and still require human review.

## Open-Source Readiness — 2026-09-22

- [x] Added an Apache-2.0 license.
- [x] Replaced private-staging language in public documentation.
- [x] Actual maintainers are configured in `.github/CODEOWNERS`.
- [x] Documented the fork, branch, verification, and pull-request workflow.
- [x] Added a code of conduct, support policy, issue forms, and pull-request
  template.
- [x] Documented GitHub private vulnerability reporting and a fallback contact.
- [x] Kept package-registry publication disabled with `private: true`.
- [x] Added deterministic LF handling for generated runtime comparisons.

## Recorded Verification

- `pnpm install --frozen-lockfile` and `pnpm check:all` passed locally on
  2026-09-22 using Node 22.15.0 and pnpm 10.33.1 after the
  open-source-readiness change.
- The workflow and issue-form YAML files parsed successfully on 2026-09-22.
- `pnpm check:all` passed locally on 2026-09-19 using Node 22.15.0 and pnpm
  10.33.1 before the open-source-readiness change.
- The initial hosted Linux job passed on 2026-09-19.
- The initial hosted Windows job failed because generated text comparisons were
  sensitive to checkout line endings; the open-source-readiness change adds LF
  policy and normalized comparison.

The current change must record its own local and hosted results before merge or
release.

## Runtime Smoke Checks — Still Required

Use this directory as a standalone project. Record client and version,
operating system, selected agent or skill, and observed result for each test.

- [ ] Codex discovers the custom agents and skills and successfully delegates a
  read-only reference review to `research-agent`.
- [ ] Claude Code lists the subagents through `/agents`, discovers skills, and
  successfully invokes `research-agent` for a read-only reference review.
- [ ] Copilot exposes `research-agent` in the agent picker and discovers its
  referenced skill during a read-only reference review.
- [ ] Cross-platform runtime compatibility has been manually smoke-tested.
- [ ] The GitHub Actions Linux and Windows matrix passes on the release commit.

## Human Release Review — Still Required

- [ ] Technical accuracy has been reviewed by an experienced engineer.
- [ ] Private information, customer names, identifiers, and domains are absent.
- [ ] Agent names and invocation examples are consistent.
- [ ] Skill scopes and trigger conditions are narrow and discoverable.
- [ ] Validation scripts are portable and fail with actionable messages.
- [ ] Every local Markdown link has been reviewed after final restructuring.
- [ ] Fictional examples are clear, minimal, and internally consistent.
- [ ] Provenance metadata and the source map match the release snapshot.
- [ ] Final human approval for the first tagged release has been recorded.
