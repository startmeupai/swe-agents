# Agent and Skill Routing

## Primary Routes

| Need | Persona | Skill |
| --- | --- | --- |
| Investigate a bounded question | `research-agent` | `planning-research` |
| Create a staged plan | `planning-agent` | `planning-research` |
| Review or correct a plan | `plan-critic-agent` | `plan-review` |
| Execute an approved plan | `plan-operations-agent` | `plan-operations` |
| Implement a feature | `feature-agent` | `feature-implementation` |
| Preserve behavior while modernizing | `refactor-agent` | `refactor-modernization` |
| Implement access control | `rbac-agent` | `rbac-integration` |
| Replicate or verify UI | `ui-agent` | `ui-replication`, `ui-visual-verification` |
| Verify small screens | `ui-sm-agent` | `ui-sm-verification` |
| Add unit or component tests | `test-agent` | `test-generation` |
| Create or debug browser coverage | Playwright specialists | `playwright-testing` |
| Sweep a feature by profile | `e2e-hardening-agent` | `e2e-hardening` |
| Close browser-verifiable plan gates | `plan-hv-agent` | `plan-hv-automation` |
| Capture a proof bundle | `test-and-prove-agent` | `test-and-prove` |
| Change CI | `github-actions-agent` | `github-actions` |
| Change edge-worker infrastructure | `cf-agent` | `cloudflare-ops` |
| Run a security audit | `security-auditor-agent` | Security audit skills |
| Validate the agent system | `subagents-validator-agent` | `subagents-validation` |

## Selection Rule

Choose the narrowest persona that owns the outcome, then load every related
skill needed for the task. Use deterministic scripts for facts they can decide.
Escalate only the evidence or authority that cannot be obtained locally.

## Extension Rule

Before adding a persona, prove that no existing owner fits. Before adding a
skill, define its trigger, inputs, bounded workflow, deterministic checks,
safety boundaries, evidence, and completion condition. Update the catalogs and
source map in the same change.
