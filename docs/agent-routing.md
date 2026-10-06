# Agent Routing

Route by outcome, not by a mandatory chain.

Core routes always apply. Pack routes apply only when that pack is installed in
the repository: a pack that is not installed contributes no owners, skills, or
rules. When no installed owner fits an outcome, use the closest core owner and
record the missing specialist as a limitation.

## Core routes

| Outcome | Owner | Related skills |
| --- | --- | --- |
| Establish facts | `research-agent` | `planning-research` |
| Settle design and sequence | `planning-agent` | `planning-research` |
| Gate plan readiness | `plan-critic-agent` | `plan-review` |
| Coordinate approved execution | `plan-operations-agent` | `plan-operations` |
| Audit delivered work against a plan | `plan-execution-audit` | `plan-review`, `plan-operations`, `planning-research` |
| Build full-stack behavior | `feature-agent` | `feature-implementation`, `test-generation` |
| Preserve behavior during cleanup | `refactor-agent` | `refactor-modernization`, `test-generation` |
| Own authorization semantics | `rbac-agent` | `rbac-integration`, `access-control-audit` |
| Create deterministic tests | `test-agent` | `test-generation` |
| Own CI workflow behavior | `github-actions-agent` | `github-actions` |
| Produce read-only security findings | `security-auditor-agent` | `access-control-audit`, `ai-injection-audit`, `upload-ssrf-audit`, `secret-leak-audit`, `dependency-cve-audit` |
| Validate the agent system itself | `subagents-validator-agent` | `subagents-validation` |
| Pull upstream agent-system updates | `upstream-agent` | `upstream-update` |
| Contribute agent-system changes upstream | `upstream-agent` | `upstream-contribution` |

When a language pack is installed, prefer its feature and test owners for work
inside that language. Keep `feature-agent` and `test-agent` for work that spans
stacks or when no language pack covers the code.

## TypeScript routes

Pack `typescript` (language).

| Outcome | Owner | Related skills |
| --- | --- | --- |
| Build TypeScript behavior | `typescript-feature-agent` | `typescript-feature-implementation`, `typescript-testing`, `feature-implementation`, `test-generation` |
| Create TypeScript tests | `typescript-test-agent` | `typescript-testing`, `test-generation` |

## Web UI routes

Pack `web-ui` (framework); requires `typescript`.

| Outcome | Owner | Related skills |
| --- | --- | --- |
| Build or compare UI | `ui-agent` | `ui-replication`, `ui-visual-verification` |
| Repair small-screen behavior | `ui-sm-agent` | `ui-sm-verification`, `ui-visual-verification` |

## Playwright routes

Pack `playwright` (verification); requires `typescript`. In this table,
"profiles" means access profiles, such as an allowed and a restricted user, not
install profiles.

| Outcome | Owner | Related skills |
| --- | --- | --- |
| Reproduce a browser defect | `playwright-investigator-agent` | `playwright-testing`, `feature-implementation` |
| Add durable browser coverage | `playwright-generator-agent` | `playwright-testing` |
| Repair a failing browser spec | `playwright-healer-agent` | `playwright-testing` |
| Sweep claims across profiles | `e2e-hardening-agent` | `e2e-hardening`, `playwright-testing` |
| Close observable plan gates | `plan-hv-agent` | `plan-hv-automation`, `playwright-testing` |
| Package browser evidence | `test-and-prove-agent` | `test-and-prove`, `playwright-testing` |

## Cloudflare routes

Pack `cloudflare` (platform).

| Outcome | Owner | Related skills |
| --- | --- | --- |
| Own edge-worker infrastructure | `cf-agent` | `cloudflare-ops`, `github-actions` |

## Python routes

Pack `python` (language).

| Outcome | Owner | Related skills |
| --- | --- | --- |
| Build Python behavior | `python-feature-agent` | `python-feature-implementation`, `test-generation` |
| Create Python tests | `python-test-agent` | `python-testing`, `test-generation` |

## Docker routes

Pack `docker` (platform).

| Outcome | Owner | Related skills |
| --- | --- | --- |
| Own container build and compose configuration | `docker-agent` | `docker-ops`, `github-actions` |

## Supabase routes

Pack `supabase` (platform). Authorization semantics stay with `rbac-agent`;
`supabase-agent` implements them as database policies.

| Outcome | Owner | Related skills |
| --- | --- | --- |
| Own database schema, RLS, and edge functions | `supabase-agent` | `supabase-ops`, `rbac-integration`, `access-control-audit` |

## Working across owners

Choose the narrowest persona that owns the outcome, then load only the related
skills the task needs.

Parallelize distinct read-only questions. Parallel writes require disjoint file
ownership. A specialist may hand work back when a discovered decision belongs
to another owner; it must include the scope, evidence, blocker, and return
condition.
