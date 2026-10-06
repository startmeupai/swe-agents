# Agent Routing

Route by outcome, not by a mandatory chain.

| Outcome | Owner | Related skills |
| --- | --- | --- |
| Establish facts | `research-agent` | `planning-research` |
| Settle design and sequence | `planning-agent` | `planning-research` |
| Gate plan readiness | `plan-critic-agent` | `plan-review` |
| Coordinate approved execution | `plan-operations-agent` | `plan-operations` |
| Audit delivered work against a plan | `plan-execution-audit` | `plan-review`, `plan-operations`, `planning-research` |
| Build full-stack behavior | `feature-agent` | `feature-implementation`, `test-generation`, `playwright-testing` |
| Preserve behavior during cleanup | `refactor-agent` | `refactor-modernization`, `test-generation` |
| Own authorization semantics | `rbac-agent` | `rbac-integration`, `access-control-audit` |
| Build or compare UI | `ui-agent` | `ui-replication`, `ui-visual-verification` |
| Repair small-screen behavior | `ui-sm-agent` | `ui-sm-verification`, `ui-visual-verification` |
| Create deterministic tests | `test-agent` | `test-generation`, `playwright-testing` |
| Reproduce a browser defect | `playwright-investigator-agent` | `playwright-testing`, `feature-implementation` |
| Add durable browser coverage | `playwright-generator-agent` | `playwright-testing` |
| Repair a failing browser spec | `playwright-healer-agent` | `playwright-testing` |
| Sweep claims across profiles | `e2e-hardening-agent` | `e2e-hardening`, `playwright-testing` |
| Close observable plan gates | `plan-hv-agent` | `plan-hv-automation`, `playwright-testing` |
| Package browser evidence | `test-and-prove-agent` | `test-and-prove`, `playwright-testing` |
| Own CI workflow behavior | `github-actions-agent` | `github-actions` |
| Own edge-worker infrastructure | `cf-agent` | `cloudflare-ops`, `github-actions` |
| Produce read-only security findings | `security-auditor-agent` | `access-control-audit`, `ai-injection-audit`, `upload-ssrf-audit`, `secret-leak-audit`, `dependency-cve-audit` |
| Validate the agent system itself | `subagents-validator-agent` | `subagents-validation` |

Choose the narrowest persona that owns the outcome, then load only the related
skills the task needs.

Parallelize distinct read-only questions. Parallel writes require disjoint file
ownership. A specialist may hand work back when a discovered decision belongs
to another owner; it must include the scope, evidence, blocker, and return
condition.
