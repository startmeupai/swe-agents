# Source Map

All source paths are repository-relative references to the read-only source
snapshot. No source file was copied verbatim.

| Destination | Source | Adaptation | Sanitization |
| --- | --- | --- | --- |
| `README.md` | `docs/swe/swe-standards-with-ai.md`, root entrypoints | Combined from several sources | Product, event, provider-account, and local-path details removed |
| `AGENTS.md` | `AGENTS.md`, `.github/AGENTS.md` | Condensed | Repository-specific architecture and branch policy removed |
| `REVIEW_CHECKLIST.md` | User brief | Updated for public readiness | Static, hosted, runtime, and human evidence remain separate |
| `SOURCE_MAP.md` | User brief | Newly created | Repository-relative provenance only |
| `CONTRIBUTING.md` | Extraction-readiness audit | Updated for public and adopter contributions | Fork, adopter-repository, and issue lanes target `test`; canonical-source, generation, check, and review expectations documented |
| `SECURITY.md` | Extraction-readiness audit | Updated for public reporting | Private vulnerability reporting is primary; public fallback contact only |
| `CODE_OF_CONDUCT.md` | Contributor Covenant 2.1 | Adapted for the project | Public enforcement contact configured |
| `SUPPORT.md` | GitHub community-health guidance | Newly created | Public support and private security routes separated |
| `LICENSE` | Apache License 2.0 | Added verbatim | No legal entity or copyright owner inferred |
| `PROVENANCE.json` | Source snapshot metadata | Updated for public release | Private base revision retained; public license state recorded without source URL or local path |
| `package.json` | User brief, source validation scripts | Rewritten generically | No dependencies or private commands |
| `pnpm-lock.yaml` | Pinned package-manager output | Newly generated | Empty dependency graph only |
| `pnpm-workspace.yaml` | Standalone extraction boundary | Newly created | Empty package list prevents parent-workspace inheritance |
| `.nvmrc` | Program toolchain requirement | Newly created | Exact public Node.js version only |
| `.gitignore` | Root `.gitignore` conventions | Condensed | Only generic local outputs and environment files |
| `.gitattributes` | Hosted Windows CI failure | Newly created | Text checkout uses deterministic LF endings |
| `.github/CODEOWNERS` | Extraction-readiness audit | Updated for public maintenance | Active organization owner initially owns all tracked surfaces |
| `.github/PULL_REQUEST_TEMPLATE.md` | GitHub community-health guidance | Newly created; contribution origin added | Verification, safety, and origin claims must be explicit |
| `.github/ISSUE_TEMPLATE/bug_report.yml` | GitHub issue-form guidance | Newly created | Sensitive information is prohibited |
| `.github/ISSUE_TEMPLATE/feature_request.yml` | GitHub issue-form guidance | Newly created | Portable scope and reuse are prompted |
| `.github/ISSUE_TEMPLATE/question.yml` | GitHub issue-form guidance | Newly created | Public support requests exclude private data |
| `.github/ISSUE_TEMPLATE/config.yml` | GitHub issue-form guidance | Newly created | Security reports route to private advisories |
| `.github/AGENTS.md` | `.github/AGENTS.md` | Condensed | Only selected personas retained |
| `.github/copilot-instructions.md` | `.github/copilot-instructions.md` | Rewritten generically | Branch, module, and product rules removed |
| `.github/workflows/reference-checks.yml` | Program CI requirement | Updated for the `test` integration branch | Read-only PR checks run once; pushes to `main` and `test` are checked without secrets or deployment |
| `.github/dependabot.yml` | GitHub Dependabot guidance | Newly created for GitHub Actions only | Monthly grouped updates target `test`; no registries or credentials |
| `docs/architecture.md` | Workshop standards, agent catalogs | Rewritten generically | Product architecture removed |
| `docs/agent-routing.md` | Workshop standards, agent catalog | Condensed | Only selected roles retained |
| `docs/plan-lifecycle.md` | Plan review, operations, and HV skills | Combined from several sources | Repository lifecycle paths generalized |
| `docs/verification-model.md` | Workshop standards | Condensed | Private commands and environments removed |
| `docs/security-boundaries.md` | Security auditor persona and audit skills | Combined from several sources | Private security primitives removed |
| `docs/releases-and-versioning.md` | Extraction-readiness audit | Updated for public releases and the `test` integration branch | Package publication remains disabled; release evidence stays explicit |
| `docs/workshop-example.md` | Workshop standards, user brief | Rewritten generically | Fictional entities and reserved domain used |
| `core/agents/research-agent.md` | `.github/agents/research-agent.md` | Condensed | Product-specific domain knowledge removed; converted to the Claude Code persona format |
| `core/agents/planning-agent.md` | `.github/agents/planning-agent.md` | Condensed | Product UI rules removed; converted to the Claude Code persona format |
| `core/agents/plan-critic-agent.md` | `.github/agents/plan-critic-agent.md` | Condensed | Repository-specific readiness clauses generalized; converted to the Claude Code persona format |
| `core/agents/plan-operations-agent.md` | `.github/agents/plan-operations-agent.md` | Condensed | Branch and archive paths generalized; converted to the Claude Code persona format |
| `core/agents/plan-execution-audit.md` | `.github/agents/plan-execution-audit-agent.md` | Condensed | Product-specific audit rules removed; converted to the Claude Code persona format |
| `core/agents/feature-agent.md` | `.github/agents/feature-agent.md` | Condensed | Framework and product paths removed; converted to the Claude Code persona format |
| `core/agents/refactor-agent.md` | `.github/agents/refactor-agent.md` | Condensed | Private deprecation list removed; converted to the Claude Code persona format |
| `core/agents/rbac-agent.md` | `.github/agents/rbac-agent.md` | Condensed | Role names and shared helper names generalized; converted to the Claude Code persona format |
| `stacks/web-ui/agents/ui-agent.md` | `.github/agents/ui-agent.md` | Condensed | Brand tokens and product chrome removed; converted to the Claude Code persona format |
| `stacks/web-ui/agents/ui-sm-agent.md` | `.github/agents/ui-sm-agent.md` | Condensed | Credentials and product navigation removed; converted to the Claude Code persona format |
| `core/agents/test-agent.md` | `.github/agents/test-agent.md` | Condensed | Private suite layout removed; converted to the Claude Code persona format |
| `stacks/playwright/agents/playwright-investigator-agent.md` | `.github/agents/playwright-investigator-agent.md` | Condensed | Private routes and credentials removed; converted to the Claude Code persona format |
| `stacks/playwright/agents/playwright-generator-agent.md` | `.github/agents/playwright-generator-agent.md` | Condensed | Runtime-specific tool list removed; converted to the Claude Code persona format |
| `stacks/playwright/agents/playwright-healer-agent.md` | `.github/agents/playwright-healer-agent.md` | Condensed | Runtime-specific tool list removed; converted to the Claude Code persona format |
| `stacks/playwright/agents/e2e-hardening-agent.md` | `.github/agents/e2e-hardening-agent.md` | Condensed | Product plans, accounts, and database details removed; converted to the Claude Code persona format |
| `stacks/playwright/agents/plan-hv-agent.md` | `.github/agents/plan-hv-agent.md` | Condensed | Test-user and environment details removed; converted to the Claude Code persona format |
| `stacks/playwright/agents/test-and-prove-agent.md` | `.github/agents/test-and-prove-agent.md` | Condensed | Private storage destination removed; converted to the Claude Code persona format |
| `core/agents/github-actions-agent.md` | `.github/agents/github-actions-agent.md` | Condensed | Repository versions and branch policy removed; converted to the Claude Code persona format |
| `stacks/cloudflare/agents/cf-agent.md` | `.github/agents/cf-agent.md` | Condensed | Account, worker, domain, and route names removed; converted to the Claude Code persona format |
| `core/agents/security-auditor-agent.md` | `.github/agents/security-auditor-agent.md` | Condensed | Private security file paths removed; converted to the Claude Code persona format |
| `core/agents/subagents-validator-agent.md` | `.github/agents/subagents-validator-agent.md` | Condensed | Runtime-specific registration details removed; converted to the Claude Code persona format |
| `core/agents/upstream-agent.md` | Adopter update and contribution contract | Newly created in the Claude Code persona format | Placeholder vocabulary only; outward-facing actions require human confirmation |
| `core/skills/planning-research/SKILL.md` | `.github/skills/planning-research/SKILL.md` | Condensed | Product stages and paths removed |
| `core/skills/plan-review/SKILL.md` | `.github/skills/plan-review/SKILL.md` | Condensed | Repository-specific gates generalized |
| `core/skills/plan-operations/SKILL.md` | `.github/skills/plan-operations/SKILL.md` | Condensed | Branch and archive operations removed |
| `core/skills/feature-implementation/SKILL.md` | `.github/skills/feature-implementation/SKILL.md` | Condensed | Framework-specific file layout removed |
| `core/skills/refactor-modernization/SKILL.md` | `.github/skills/refactor-modernization/SKILL.md` | Condensed | Product examples removed |
| `core/skills/rbac-integration/SKILL.md` | `.github/skills/rbac-integration/SKILL.md` | Condensed | Helper names, roles, and invitation chains generalized |
| `stacks/web-ui/skills/ui-replication/SKILL.md` | `.github/skills/ui-replication/SKILL.md` | Condensed | Product palette and shell details removed |
| `stacks/web-ui/skills/ui-visual-verification/SKILL.md` | `.github/skills/ui-visual-verification/SKILL.md` | Condensed | Private routes and baselines removed |
| `stacks/web-ui/skills/ui-sm-verification/SKILL.md` | `.github/skills/ui-sm-verification/SKILL.md` | Condensed | Credential names and private routes removed |
| `core/skills/test-generation/SKILL.md` | `.github/skills/test-generation/SKILL.md` | Condensed | Private mocks and coverage targets removed |
| `stacks/playwright/skills/playwright-testing/SKILL.md` | `.github/skills/playwright-testing/SKILL.md` | Condensed | Credential names and private routes removed |
| `stacks/playwright/skills/e2e-hardening/SKILL.md` | `.github/skills/e2e-hardening/SKILL.md` | Condensed | Account tiers and database hosts removed |
| `stacks/playwright/skills/plan-hv-automation/SKILL.md` | `.github/skills/plan-hv-automation/SKILL.md` | Condensed | Test-user map and archive commands removed |
| `stacks/playwright/skills/test-and-prove/SKILL.md` | `.github/skills/test-and-prove/SKILL.md` | Condensed | Private evidence storage removed |
| `core/skills/github-actions/SKILL.md` | `.github/skills/github-actions/SKILL.md` | Condensed | Repository versions and branch names removed |
| `stacks/cloudflare/skills/cloudflare-ops/SKILL.md` | `.github/skills/cloudflare-ops/SKILL.md` | Condensed | Accounts, domains, worker names, and secrets removed |
| `core/skills/access-control-audit/SKILL.md` | `.github/skills/security/access-control-audit/SKILL.md` | Condensed | Private helper and route names removed |
| `core/skills/ai-injection-audit/SKILL.md` | `.github/skills/security/ai-injection-audit/SKILL.md` | Condensed | Private wrapper and surface names removed |
| `core/skills/upload-ssrf-audit/SKILL.md` | `.github/skills/security/upload-ssrf-audit/SKILL.md` | Condensed | Private URL guards and fixtures removed |
| `core/skills/secret-leak-audit/SKILL.md` | `.github/skills/security/secret-leak-audit/SKILL.md` | Condensed | No matched value or private secret name retained |
| `core/skills/dependency-cve-audit/SKILL.md` | `.github/skills/security/dependency-cve-audit/SKILL.md` | Condensed | Repository packages removed |
| `core/skills/subagents-validation/SKILL.md` | `.github/skills/subagents-validation/SKILL.md` | Condensed | Symlink topology and runtime-specific details removed |
| `core/skills/docs-generation/SKILL.md` | `.github/skills/docs-generation/SKILL.md` | Condensed | Product docs template removed |
| `core/skills/upstream-update/SKILL.md` | Adopter update and contribution contract | Newly created | Placeholder vocabulary only |
| `core/skills/upstream-contribution/SKILL.md` | Adopter update and contribution contract | Newly created | Placeholder vocabulary only; bundles are scanned and reviewed before any outward step |
| `examples/reports/research-report.md` | Research persona, user brief | Newly created | Fictional entities only |
| `examples/plans/staged-implementation-plan.md` | Planning skill, user brief | Newly created | Fictional entities only |
| `examples/plans/plan-critic-correction.md` | Plan review skill, user brief | Newly created | Fictional entities only |
| `examples/plans/stage-end-writeback.md` | Plan operations skill, user brief | Newly created | Fictional entities only |
| `examples/plans/review-gate-writeback.md` | Plan operations skill, verification model | Newly created | Fictional entities only |
| `examples/handoffs/implementation-handoff.md` | Plan operations skill, user brief | Newly created | Fictional entities only |
| `examples/reports/verification-gates.md` | Workshop verification model, user brief | Newly created | No provider or environment identifiers |
| `examples/reports/rbac-verification.md` | RBAC skill, user brief | Newly created | Fictional profiles and resources only |
| `examples/browser-evidence/manifest.json` | Test-and-prove skill, user brief | Newly created | Reserved domain and no user information |
| `examples/browser-evidence/browser-evidence-manifest.schema.json` | Test-and-prove evidence contract | Newly created | Reserved domain and generic fields only |
| `scripts/checks/lib.mjs` | Source parity scripts | Rewritten generically | Standard library only |
| `scripts/checks/validate-agent-frontmatter.mjs` | `scripts/checks/check-agent-surface-parity.ts` | Rewritten generically | Native Copilot filenames validated; runtime parity checked separately |
| `scripts/checks/validate-skills.mjs` | `scripts/checks/check-skill-surface-parity.ts` | Rewritten generically | Symlink/runtime topology omitted |
| `scripts/checks/check-agent-skill-references.mjs` | Source parity scripts | Newly created | Local project references only |
| `scripts/checks/check-markdown-links.mjs` | Markdown lint script, user brief | Newly created | Network links are not fetched |
| `scripts/checks/check-referenced-files.mjs` | User brief | Updated for public readiness | License, community, and contribution surfaces are required |
| `scripts/checks/check-duplicate-names.mjs` | Source parity scripts | Rewritten generically | Catalog-local names only |
| `scripts/checks/check-sanitization.mjs` | User brief | Updated for public release; patterns exported for the contribute command | Donor terms remain blocked while the public organization identity is allowed |
| `scripts/checks/check-secrets.mjs` | Secret-audit skill | Condensed; patterns exported for the contribute command | High-confidence patterns; matched values never printed |
| `scripts/checks/check-artifact-paths.mjs` | Plan/report directory rules | Newly created | Reference-project paths only |
| `scripts/checks/check-plans.mjs` | Plan operations and planning skills | Newly created | Reference-project plan paths only; stage, checkbox, and gate rules are generic |
| `scripts/checks/check-browser-evidence.mjs` | Test-and-prove evidence contract | Newly created | Validates local fictional templates and collected artifact integrity |
| `scripts/checks/check-project-contract.mjs` | Extraction-readiness audit | Updated for public readiness | Validates public toolchain, license, ownership, and line endings |
| `scripts/checks/check-provenance.mjs` | Extraction-readiness audit | Updated for public release | Prevents provenance from overstating or exposing the private source while requiring license state |
| `scripts/checks/check-separation.mjs` | Agent-authoring and validation skills | Newly created | Heuristic checks only |
| `scripts/checks/check-source-map.mjs` | User brief | Newly created | Repository-relative artifact coverage only |
| `scripts/checks/lint-markdown.mjs` | `scripts/maintenance/lint-markdown.ts` | Rewritten generically | Dependency-free rule subset |
| `scripts/runtime/sync-agent-setup.mjs` | `Portable runtime setup review` | Updated after hosted Windows failure | Generated text comparison normalizes CRLF without weakening content checks |
| `core/AGENTS.md` | Former `.github/instructions/*.instructions.md`, `.github/copilot-instructions.md` | Combined into a stack-neutral rules fragment | Framework, package-manager, path-glob, and product rules removed |
| `stacks/README.md` | Pack format contract | Newly created | Reference-local authoring guide only |
| `stacks/typescript/**` | Former `.github/instructions/typescript.instructions.md`, `feature-agent`, `test-agent` | Extracted into a language pack with new TypeScript personas and skills | Project path aliases removed |
| `stacks/web-ui/**` | Former `components` and `responsive-tailwind` instructions | Extracted into a framework pack | Private component names and token namespaces removed |
| `stacks/playwright/**` | Former `testing.instructions.md` browser rules | Extracted into a verification pack | Private fixtures and test users removed |
| `stacks/cloudflare/**` | Former `infrastructure-deployment.instructions.md` provider rules | Extracted into a platform pack | Account, route, worker, and environment details removed |
| `stacks/python/**` | Pack format contract | Newly created | Fictional examples only |
| `stacks/docker/**` | Pack format contract | Newly created | Fictional examples only |
| `stacks/supabase/**` | Pack format contract | Newly created | Fictional examples only |
| `profiles/**` | Pack format contract | Newly created | Named pack combinations only |
| `scripts/stacks/engine.mjs` | Former `scripts/runtime/sync-agent-setup.mjs` | Extracted shared generation engine | No private paths |
| `scripts/stacks/install.mjs` | Pack format contract | Newly created; reduced to a thin command-line wrapper over `scripts/stacks/installer.mjs` | Writes only into an explicit target directory |
| `scripts/stacks/cli.mjs` | Adopter update and contribution contract | Newly created | Writes only into the resolved target; no credentials |
| `scripts/stacks/installer.mjs` | `scripts/stacks/install.mjs` | Extracted into an importable installer and lock module | Writes only into an explicit target directory |
| `scripts/stacks/detect.mjs` | Pack `detect` contract | Newly created | Reads only the target tree |
| `scripts/stacks/source.mjs` | Adopter update and contribution contract | Newly created | Public upstream URL only; no credentials or local paths |
| `scripts/stacks/contribute.mjs` | Adopter update and contribution contract | Newly created | Scans every bundle item with the sanitization and secret patterns; never pushes |
| `scripts/checks/check-stacks.mjs` | Pack format contract | Newly created | Validates manifests and profiles only |
| `scripts/checks/check-installer.mjs` | Adopter update and contribution contract | Newly created | Temporary fictional fixtures only |
| `scripts/checks/check-contribute.mjs` | Adopter update and contribution contract | Newly created | Temporary fictional fixtures only |
| `docs/stack-packs.md` | Pack format contract, adopter update and contribution contract | Newly created; extended with the CLI, lock version 2, updates, and the contribute loop | Fictional entities and reserved domain used |
| `.github/ISSUE_TEMPLATE/pack_request.yml` | GitHub issue-form guidance | Newly created | Sensitive information is prohibited |
| `.github/ISSUE_TEMPLATE/contribution_proposal.yml` | GitHub issue-form guidance, adopter update and contribution contract | Newly created | Sensitive information is prohibited; generalization, sanitization, and license confirmations are required |
| `.claude/agents/**` | Generated by `pnpm sync:setup` from `core/` and `stacks/` (profile `reference`) | Sanitized reference-local setup only; no external accounts |
| `.claude/skills/**` | Generated by `pnpm sync:setup` from `core/` and `stacks/` (profile `reference`) | Sanitized reference-local setup only; no external accounts |
| `.agents/skills/**` | Generated by `pnpm sync:setup` from `core/` and `stacks/` (profile `reference`) | Sanitized reference-local setup only; no external accounts |
| `.codex/**` | Generated by `pnpm sync:setup` from `core/` and `stacks/` (profile `reference`) | Sanitized reference-local setup only; no external accounts |
| `.github/agents/**` | Generated by `pnpm sync:setup` from `core/` and `stacks/` (profile `reference`) | Sanitized reference-local setup only; no external accounts |
