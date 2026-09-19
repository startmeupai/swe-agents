# Verification Model

Evidence is layered and non-substitutable.

| Layer | Typical evidence | Does not prove |
| --- | --- | --- |
| Formatting and policy | Linter or policy script output | Runtime behavior |
| Types | Type checker output | Business correctness |
| Unit/component | Deterministic test result | Full integration |
| Integration | Boundary and data-path tests | Real browser behavior |
| Browser/E2E | Journey assertions and screenshots | Provider deployment |
| Security/RBAC | Positive and negative scope tests | General product acceptance |
| Provider/config | Provider validation or preview | Successful deployment |
| Deployment | Deployment result and smoke check | Human acceptance |
| Human review | Named approval and date | Future production health |
| Production observation | Sanitized logs, metrics, traces | Design intent |

Every completion report names which layers ran, the command or observation,
the result, and what remained unverified. Evidence from another environment or
an older run is labeled as such.
