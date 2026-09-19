# Agent Routing

Route by outcome, not by a mandatory chain.

| Outcome | Owner |
| --- | --- |
| Establish facts | `research-agent` |
| Settle design and sequence | `planning-agent` |
| Gate plan readiness | `plan-critic-agent` |
| Coordinate approved execution | `plan-operations-agent` |
| Build full-stack behavior | `feature-agent` |
| Preserve behavior during cleanup | `refactor-agent` |
| Own authorization semantics | `rbac-agent` |
| Build or compare UI | `ui-agent` |
| Repair small-screen behavior | `ui-sm-agent` |
| Create deterministic tests | `test-agent` |
| Reproduce a browser defect | `playwright-investigator-agent` |
| Add durable browser coverage | `playwright-generator-agent` |
| Repair a failing browser spec | `playwright-healer-agent` |
| Sweep claims across profiles | `e2e-hardening-agent` |
| Close observable plan gates | `plan-hv-agent` |
| Package browser evidence | `test-and-prove-agent` |
| Own CI workflow behavior | `github-actions-agent` |
| Own edge-worker infrastructure | `cf-agent` |
| Produce read-only security findings | `security-auditor-agent` |

Parallelize distinct read-only questions. Parallel writes require disjoint file
ownership. A specialist may hand work back when a discovered decision belongs
to another owner; it must include the scope, evidence, blocker, and return
condition.
