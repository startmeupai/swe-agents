# Publication Review Checklist

## Local Review — 2026-09-19

This review covers the reference directory only. Checked items record static
inspection and local command results; they do not represent human approval,
live client discovery, hosted CI, or publication authority.

- [x] Inspected the reference for product code, private helper imports, module names,
  local paths, deployment accounts, credentials, and customer data; none found
  outside split detection terms in the sanitization validator.
- [x] Generalized inherited administrator-policy and infrastructure-generator
  assumptions so they depend on the adopting project's contracts.
- [x] Included native Codex, Claude Code, and Copilot persona/skill surfaces,
  generated from the sanitized canonical files using independent copies.
- [x] Added deterministic runtime parity verification to the local check suite.
- [x] Documented tool-specific routing and explicit instruction loading.

The source map intentionally retains relative donor artifact paths, and
`PROVENANCE.json` retains a private base revision. These are provenance metadata,
not product implementations. No donor repository URL or local checkout path is
included. Sanitization scans are heuristic and require the human review below.

## Recorded Local Verification

- `pnpm check:all` passed using Node 22.15.0 and pnpm 10.33.1: 21 canonical
  personas, 23 canonical skills, 89 generated runtime files, 130 local Markdown
  links, and 192 mapped/scanned artifacts.
- Isolated-copy checks rejected runtime drift, stale agents, missing skills,
  and a donor-specific helper name. No failure fixtures remain in this project.
- No application TypeScript, application lint, browser, provider, or deployment
  checks apply to this documentation-and-Node-script reference. There is no
  `typecheck` script; the enclosing application's checks were not used as proof.

## Runtime Smoke Checks — Still Required

Use this directory as a standalone project. Record client/version, operating
system, selected agent/skill, and observed result for each test.

- [ ] Codex discovers the custom agents and skills and successfully delegates a
  read-only reference review to `research-agent`.
- [ ] Claude Code lists the subagents through `/agents`, discovers skills, and
  successfully invokes `research-agent` for a read-only reference review.
- [ ] Copilot exposes `research-agent` in the agent picker and discovers its
  referenced skill during a read-only reference review.
- [ ] Cross-platform runtime compatibility has been tested.
- [ ] The GitHub Actions Linux and Windows matrix passes on the release commit.

## Human Publication Approval — Still Required

- [ ] Technical accuracy has been reviewed by an experienced engineer.
- [ ] Private information, customer names, identifiers, and domains are absent.
- [ ] Agent names and invocation examples are consistent.
- [ ] Skill scopes and trigger conditions are narrow and discoverable.
- [ ] Validation scripts are portable and fail with actionable messages.
- [ ] Every local Markdown link has been reviewed after final restructuring.
- [ ] Fictional examples are clear, minimal, and internally consistent.
- [ ] Actual maintainers are configured in `.github/CODEOWNERS`.
- [ ] A private security reporting channel and response policy are configured.
- [ ] Provenance metadata and the source map match the release snapshot.
- [ ] The owner has selected and added an appropriate license.
- [ ] Final human approval for publication has been recorded.
