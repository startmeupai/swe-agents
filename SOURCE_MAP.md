# Source Map

All source paths are repository-relative references to the read-only source
snapshot. No source file was copied verbatim.

| Destination | Source | Adaptation | Sanitization |
| --- | --- | --- | --- |
| `README.md` | `docs/swe/swe-standards-with-ai.md`, root entrypoints | Combined from several sources | Product, event, provider-account, and local-path details removed |
| `AGENTS.md` | `AGENTS.md`, `.github/AGENTS.md` | Condensed | Repository-specific architecture and branch policy removed |
| `CLAUDE.md` | `CLAUDE.md` | Rewritten generically | Native Claude discovery uses generated independent copies |
| `REVIEW_CHECKLIST.md` | User brief | Newly created | Static review evidence separated from unrun runtime and publication gates |
| `SOURCE_MAP.md` | User brief | Newly created | Repository-relative provenance only |
| `CONTRIBUTING.md` | Extraction-readiness audit | Newly created | Private staging and review guidance only |
| `SECURITY.md` | Extraction-readiness audit | Newly created | No private contact or response commitment invented |
| `PROVENANCE.json` | Source snapshot metadata | Newly created | Private base revision retained without repository URL or local path |
| `package.json` | User brief, source validation scripts | Rewritten generically | No dependencies or private commands |
| `pnpm-lock.yaml` | Pinned package-manager output | Newly generated | Empty dependency graph only |
| `pnpm-workspace.yaml` | Standalone extraction boundary | Newly created | Empty package list prevents parent-workspace inheritance |
| `.nvmrc` | Program toolchain requirement | Newly created | Exact public Node.js version only |
| `.gitignore` | Root `.gitignore` conventions | Condensed | Only generic local outputs and environment files |
| `.github/CODEOWNERS` | Extraction-readiness audit | Newly created | Comment-only template; no owner identity inferred |
| `.github/AGENTS.md` | `.github/AGENTS.md` | Condensed | Only selected personas retained |
| `.github/README.md` | `.github/README.md` | Condensed | Product-specific routing removed |
| `.github/copilot-instructions.md` | `.github/copilot-instructions.md` | Rewritten generically | Branch, module, and product rules removed |
| `.github/instructions/global.instructions.md` | `.github/instructions/global.instructions.md` | Condensed | Framework- and product-specific rules removed |
| `.github/instructions/typescript.instructions.md` | `.github/instructions/typescript.instructions.md` | Condensed | Project path aliases removed |
| `.github/instructions/components.instructions.md` | `.github/instructions/components.instructions.md` | Condensed | Private component names removed |
| `.github/instructions/responsive-tailwind.instructions.md` | `.github/instructions/tailwind.instructions.md` | Condensed | Product token namespaces removed |
| `.github/instructions/testing.instructions.md` | `.github/instructions/testing.instructions.md` | Condensed | Private fixtures and test users removed |
| `.github/instructions/security-rbac.instructions.md` | `.github/reusable-patterns.md`, RBAC skill | Combined from several sources | Module roles and identifiers generalized |
| `.github/instructions/plans-reports.instructions.md` | Plan skills, repository instructions | Combined from several sources | Lifecycle directories mapped to reference examples |
| `.github/instructions/infrastructure-deployment.instructions.md` | Infrastructure skills, repository instructions | Combined from several sources | Account, route, worker, and environment details removed |
| `.github/instructions/markdown.instructions.md` | `.github/instructions/markdown.instructions.md` | Condensed | Tooling details reduced to portable rules |
| `.github/workflows/reference-checks.yml` | Program CI requirement | Newly created | Read-only checks; no secrets, deployment, or private runner names |
| `docs/architecture.md` | Workshop standards, agent catalogs | Rewritten generically | Product architecture removed |
| `docs/agent-routing.md` | Workshop standards, agent catalog | Condensed | Only selected roles retained |
| `docs/plan-lifecycle.md` | Plan review, operations, and HV skills | Combined from several sources | Repository lifecycle paths generalized |
| `docs/verification-model.md` | Workshop standards | Condensed | Private commands and environments removed |
| `docs/security-boundaries.md` | Security auditor persona and audit skills | Combined from several sources | Private security primitives removed |
| `docs/releases-and-versioning.md` | Extraction-readiness audit | Newly created | Publication remains blocked pending owner decisions |
| `docs/workshop-example.md` | Workshop standards, user brief | Rewritten generically | Fictional entities and reserved domain used |
| `.github/agents/research-agent.agent.md` | `.github/agents/research-agent.md` | Condensed | Product-specific domain knowledge removed |
| `.github/agents/planning-agent.agent.md` | `.github/agents/planning-agent.md` | Condensed | Product UI rules removed |
| `.github/agents/plan-critic-agent.agent.md` | `.github/agents/plan-critic-agent.md` | Condensed | Repository-specific readiness clauses generalized |
| `.github/agents/plan-operations-agent.agent.md` | `.github/agents/plan-operations-agent.md` | Condensed | Branch and archive paths generalized |
| `.github/agents/plan-execution-audit.agent.md` | `.github/agents/plan-execution-audit-agent.md` | Condensed | Product-specific audit rules removed |
| `.github/agents/feature-agent.agent.md` | `.github/agents/feature-agent.md` | Condensed | Framework and product paths removed |
| `.github/agents/refactor-agent.agent.md` | `.github/agents/refactor-agent.md` | Condensed | Private deprecation list removed |
| `.github/agents/rbac-agent.agent.md` | `.github/agents/rbac-agent.md` | Condensed | Role names and shared helper names generalized |
| `.github/agents/ui-agent.agent.md` | `.github/agents/ui-agent.md` | Condensed | Brand tokens and product chrome removed |
| `.github/agents/ui-sm-agent.agent.md` | `.github/agents/ui-sm-agent.md` | Condensed | Credentials and product navigation removed |
| `.github/agents/test-agent.agent.md` | `.github/agents/test-agent.md` | Condensed | Private suite layout removed |
| `.github/agents/playwright-investigator-agent.agent.md` | `.github/agents/playwright-investigator-agent.md` | Condensed | Private routes and credentials removed |
| `.github/agents/playwright-generator-agent.agent.md` | `.github/agents/playwright-generator-agent.md` | Condensed | Runtime-specific tool list removed |
| `.github/agents/playwright-healer-agent.agent.md` | `.github/agents/playwright-healer-agent.md` | Condensed | Runtime-specific tool list removed |
| `.github/agents/e2e-hardening-agent.agent.md` | `.github/agents/e2e-hardening-agent.md` | Condensed | Product plans, accounts, and database details removed |
| `.github/agents/plan-hv-agent.agent.md` | `.github/agents/plan-hv-agent.md` | Condensed | Test-user and environment details removed |
| `.github/agents/test-and-prove-agent.agent.md` | `.github/agents/test-and-prove-agent.md` | Condensed | Private storage destination removed |
| `.github/agents/github-actions-agent.agent.md` | `.github/agents/github-actions-agent.md` | Condensed | Repository versions and branch policy removed |
| `.github/agents/cf-agent.agent.md` | `.github/agents/cf-agent.md` | Condensed | Account, worker, domain, and route names removed |
| `.github/agents/security-auditor-agent.agent.md` | `.github/agents/security-auditor-agent.md` | Condensed | Private security file paths removed |
| `.github/agents/subagents-validator-agent.agent.md` | `.github/agents/subagents-validator-agent.md` | Condensed | Runtime-specific registration details removed |
| `.github/skills/planning-research/SKILL.md` | `.github/skills/planning-research/SKILL.md` | Condensed | Product stages and paths removed |
| `.github/skills/plan-review/SKILL.md` | `.github/skills/plan-review/SKILL.md` | Condensed | Repository-specific gates generalized |
| `.github/skills/plan-operations/SKILL.md` | `.github/skills/plan-operations/SKILL.md` | Condensed | Branch and archive operations removed |
| `.github/skills/feature-implementation/SKILL.md` | `.github/skills/feature-implementation/SKILL.md` | Condensed | Framework-specific file layout removed |
| `.github/skills/refactor-modernization/SKILL.md` | `.github/skills/refactor-modernization/SKILL.md` | Condensed | Product examples removed |
| `.github/skills/rbac-integration/SKILL.md` | `.github/skills/rbac-integration/SKILL.md` | Condensed | Helper names, roles, and invitation chains generalized |
| `.github/skills/ui-replication/SKILL.md` | `.github/skills/ui-replication/SKILL.md` | Condensed | Product palette and shell details removed |
| `.github/skills/ui-visual-verification/SKILL.md` | `.github/skills/ui-visual-verification/SKILL.md` | Condensed | Private routes and baselines removed |
| `.github/skills/ui-sm-verification/SKILL.md` | `.github/skills/ui-sm-verification/SKILL.md` | Condensed | Credential names and private routes removed |
| `.github/skills/test-generation/SKILL.md` | `.github/skills/test-generation/SKILL.md` | Condensed | Private mocks and coverage targets removed |
| `.github/skills/playwright-testing/SKILL.md` | `.github/skills/playwright-testing/SKILL.md` | Condensed | Credential names and private routes removed |
| `.github/skills/e2e-hardening/SKILL.md` | `.github/skills/e2e-hardening/SKILL.md` | Condensed | Account tiers and database hosts removed |
| `.github/skills/plan-hv-automation/SKILL.md` | `.github/skills/plan-hv-automation/SKILL.md` | Condensed | Test-user map and archive commands removed |
| `.github/skills/test-and-prove/SKILL.md` | `.github/skills/test-and-prove/SKILL.md` | Condensed | Private evidence storage removed |
| `.github/skills/github-actions/SKILL.md` | `.github/skills/github-actions/SKILL.md` | Condensed | Repository versions and branch names removed |
| `.github/skills/cloudflare-ops/SKILL.md` | `.github/skills/cloudflare-ops/SKILL.md` | Condensed | Accounts, domains, worker names, and secrets removed |
| `.github/skills/access-control-audit/SKILL.md` | `.github/skills/security/access-control-audit/SKILL.md` | Condensed | Private helper and route names removed |
| `.github/skills/ai-injection-audit/SKILL.md` | `.github/skills/security/ai-injection-audit/SKILL.md` | Condensed | Private wrapper and surface names removed |
| `.github/skills/upload-ssrf-audit/SKILL.md` | `.github/skills/security/upload-ssrf-audit/SKILL.md` | Condensed | Private URL guards and fixtures removed |
| `.github/skills/secret-leak-audit/SKILL.md` | `.github/skills/security/secret-leak-audit/SKILL.md` | Condensed | No matched value or private secret name retained |
| `.github/skills/dependency-cve-audit/SKILL.md` | `.github/skills/security/dependency-cve-audit/SKILL.md` | Condensed | Repository packages removed |
| `.github/skills/subagents-validation/SKILL.md` | `.github/skills/subagents-validation/SKILL.md` | Condensed | Symlink topology and runtime-specific details removed |
| `.github/skills/docs-generation/SKILL.md` | `.github/skills/docs-generation/SKILL.md` | Condensed | Product docs template removed |
| `examples/reports/research-report.md` | Research persona, user brief | Newly created | Fictional entities only |
| `examples/plans/staged-implementation-plan.md` | Planning skill, user brief | Newly created | Fictional entities only |
| `examples/plans/plan-critic-correction.md` | Plan review skill, user brief | Newly created | Fictional entities only |
| `examples/plans/stage-end-writeback.md` | Plan operations skill, user brief | Newly created | Fictional entities only |
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
| `scripts/checks/check-referenced-files.mjs` | User brief | Newly created | Generic required structure only |
| `scripts/checks/check-duplicate-names.mjs` | Source parity scripts | Rewritten generically | Catalog-local names only |
| `scripts/checks/check-sanitization.mjs` | User brief | Newly created | Private terms represented only as split validator tokens |
| `scripts/checks/check-secrets.mjs` | Secret-audit skill | Condensed | High-confidence patterns; matched values never printed |
| `scripts/checks/check-artifact-paths.mjs` | Plan/report directory rules | Newly created | Reference-project paths only |
| `scripts/checks/check-browser-evidence.mjs` | Test-and-prove evidence contract | Newly created | Validates local fictional templates and collected artifact integrity |
| `scripts/checks/check-project-contract.mjs` | Extraction-readiness audit | Newly created | Validates only public toolchain and repository-policy metadata |
| `scripts/checks/check-provenance.mjs` | Extraction-readiness audit | Newly created | Prevents provenance from overstating or exposing the private source |
| `scripts/checks/check-separation.mjs` | Agent-authoring and validation skills | Newly created | Heuristic checks only |
| `scripts/checks/check-source-map.mjs` | User brief | Newly created | Repository-relative artifact coverage only |
| `scripts/checks/lint-markdown.mjs` | `scripts/maintenance/lint-markdown.ts` | Rewritten generically | Dependency-free rule subset |
| `.agents/skills/access-control-audit/SKILL.md` | `.github/skills/access-control-audit/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.agents/skills/ai-injection-audit/SKILL.md` | `.github/skills/ai-injection-audit/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.agents/skills/cloudflare-ops/SKILL.md` | `.github/skills/cloudflare-ops/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.agents/skills/dependency-cve-audit/SKILL.md` | `.github/skills/dependency-cve-audit/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.agents/skills/docs-generation/SKILL.md` | `.github/skills/docs-generation/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.agents/skills/e2e-hardening/SKILL.md` | `.github/skills/e2e-hardening/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.agents/skills/feature-implementation/SKILL.md` | `.github/skills/feature-implementation/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.agents/skills/github-actions/SKILL.md` | `.github/skills/github-actions/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.agents/skills/plan-hv-automation/SKILL.md` | `.github/skills/plan-hv-automation/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.agents/skills/plan-operations/SKILL.md` | `.github/skills/plan-operations/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.agents/skills/plan-review/SKILL.md` | `.github/skills/plan-review/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.agents/skills/planning-research/SKILL.md` | `.github/skills/planning-research/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.agents/skills/playwright-testing/SKILL.md` | `.github/skills/playwright-testing/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.agents/skills/rbac-integration/SKILL.md` | `.github/skills/rbac-integration/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.agents/skills/refactor-modernization/SKILL.md` | `.github/skills/refactor-modernization/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.agents/skills/secret-leak-audit/SKILL.md` | `.github/skills/secret-leak-audit/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.agents/skills/subagents-validation/SKILL.md` | `.github/skills/subagents-validation/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.agents/skills/test-and-prove/SKILL.md` | `.github/skills/test-and-prove/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.agents/skills/test-generation/SKILL.md` | `.github/skills/test-generation/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.agents/skills/ui-replication/SKILL.md` | `.github/skills/ui-replication/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.agents/skills/ui-sm-verification/SKILL.md` | `.github/skills/ui-sm-verification/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.agents/skills/ui-visual-verification/SKILL.md` | `.github/skills/ui-visual-verification/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.agents/skills/upload-ssrf-audit/SKILL.md` | `.github/skills/upload-ssrf-audit/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/agents/cf-agent.md` | `.github/agents/cf-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/agents/e2e-hardening-agent.md` | `.github/agents/e2e-hardening-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/agents/feature-agent.md` | `.github/agents/feature-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/agents/github-actions-agent.md` | `.github/agents/github-actions-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/agents/plan-critic-agent.md` | `.github/agents/plan-critic-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/agents/plan-execution-audit.md` | `.github/agents/plan-execution-audit.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/agents/plan-hv-agent.md` | `.github/agents/plan-hv-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/agents/plan-operations-agent.md` | `.github/agents/plan-operations-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/agents/planning-agent.md` | `.github/agents/planning-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/agents/playwright-generator-agent.md` | `.github/agents/playwright-generator-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/agents/playwright-healer-agent.md` | `.github/agents/playwright-healer-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/agents/playwright-investigator-agent.md` | `.github/agents/playwright-investigator-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/agents/rbac-agent.md` | `.github/agents/rbac-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/agents/refactor-agent.md` | `.github/agents/refactor-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/agents/research-agent.md` | `.github/agents/research-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/agents/security-auditor-agent.md` | `.github/agents/security-auditor-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/agents/subagents-validator-agent.md` | `.github/agents/subagents-validator-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/agents/test-agent.md` | `.github/agents/test-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/agents/test-and-prove-agent.md` | `.github/agents/test-and-prove-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/agents/ui-agent.md` | `.github/agents/ui-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/agents/ui-sm-agent.md` | `.github/agents/ui-sm-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/skills/access-control-audit/SKILL.md` | `.github/skills/access-control-audit/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/skills/ai-injection-audit/SKILL.md` | `.github/skills/ai-injection-audit/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/skills/cloudflare-ops/SKILL.md` | `.github/skills/cloudflare-ops/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/skills/dependency-cve-audit/SKILL.md` | `.github/skills/dependency-cve-audit/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/skills/docs-generation/SKILL.md` | `.github/skills/docs-generation/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/skills/e2e-hardening/SKILL.md` | `.github/skills/e2e-hardening/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/skills/feature-implementation/SKILL.md` | `.github/skills/feature-implementation/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/skills/github-actions/SKILL.md` | `.github/skills/github-actions/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/skills/plan-hv-automation/SKILL.md` | `.github/skills/plan-hv-automation/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/skills/plan-operations/SKILL.md` | `.github/skills/plan-operations/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/skills/plan-review/SKILL.md` | `.github/skills/plan-review/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/skills/planning-research/SKILL.md` | `.github/skills/planning-research/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/skills/playwright-testing/SKILL.md` | `.github/skills/playwright-testing/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/skills/rbac-integration/SKILL.md` | `.github/skills/rbac-integration/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/skills/refactor-modernization/SKILL.md` | `.github/skills/refactor-modernization/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/skills/secret-leak-audit/SKILL.md` | `.github/skills/secret-leak-audit/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/skills/subagents-validation/SKILL.md` | `.github/skills/subagents-validation/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/skills/test-and-prove/SKILL.md` | `.github/skills/test-and-prove/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/skills/test-generation/SKILL.md` | `.github/skills/test-generation/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/skills/ui-replication/SKILL.md` | `.github/skills/ui-replication/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/skills/ui-sm-verification/SKILL.md` | `.github/skills/ui-sm-verification/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/skills/ui-visual-verification/SKILL.md` | `.github/skills/ui-visual-verification/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.claude/skills/upload-ssrf-audit/SKILL.md` | `.github/skills/upload-ssrf-audit/SKILL.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.codex/agents/cf_agent.toml` | `.github/agents/cf-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.codex/agents/e2e_hardening_agent.toml` | `.github/agents/e2e-hardening-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.codex/agents/feature_agent.toml` | `.github/agents/feature-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.codex/agents/github_actions_agent.toml` | `.github/agents/github-actions-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.codex/agents/plan_critic_agent.toml` | `.github/agents/plan-critic-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.codex/agents/plan_execution_audit.toml` | `.github/agents/plan-execution-audit.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.codex/agents/plan_hv_agent.toml` | `.github/agents/plan-hv-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.codex/agents/plan_operations_agent.toml` | `.github/agents/plan-operations-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.codex/agents/planning_agent.toml` | `.github/agents/planning-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.codex/agents/playwright_generator_agent.toml` | `.github/agents/playwright-generator-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.codex/agents/playwright_healer_agent.toml` | `.github/agents/playwright-healer-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.codex/agents/playwright_investigator_agent.toml` | `.github/agents/playwright-investigator-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.codex/agents/rbac_agent.toml` | `.github/agents/rbac-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.codex/agents/refactor_agent.toml` | `.github/agents/refactor-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.codex/agents/research_agent.toml` | `.github/agents/research-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.codex/agents/security_auditor_agent.toml` | `.github/agents/security-auditor-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.codex/agents/subagents_validator_agent.toml` | `.github/agents/subagents-validator-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.codex/agents/test_agent.toml` | `.github/agents/test-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.codex/agents/test_and_prove_agent.toml` | `.github/agents/test-and-prove-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.codex/agents/ui_agent.toml` | `.github/agents/ui-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.codex/agents/ui_sm_agent.toml` | `.github/agents/ui-sm-agent.agent.md` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `.codex/config.toml` | `Portable runtime setup review` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
| `scripts/runtime/sync-agent-setup.mjs` | `Portable runtime setup review` | Generated or newly created | Sanitized reference-local setup only; no external accounts or product implementation |
