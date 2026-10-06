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

Installed stack packs supply the commands for the formatting, type, test, and
browser layers. For example, the `typescript` pack declares `pnpm lint`,
`pnpm typecheck`, and `pnpm test`; the `python` pack declares `ruff check .`,
`mypy .`, and `pytest -q`; and the `playwright` pack owns browser journeys.
Core personas run the commands the installed packs declare. A layer that no
installed pack covers is reported as not run, never as passed.

## Finding Severity

Research, review, and audit reports rank findings on one shared scale.

| Severity | Meaning | Effect |
| --- | --- | --- |
| Critical | Exploitable security flaw, data loss, or outage on a reachable path | Blocks readiness and release |
| High | Wrong behavior for a reachable input, an authorization gap, or a plan defect that would ship it | Blocks plan readiness |
| Medium | Real defect with limited reach or a workaround, or duplication that will drift | Fix in scope or record as debt |
| Low | Clarity or maintainability issue with no behavior impact | Optional |
| Info | Confirmed fact that answers the question; no action implied | None |

Severity ranks findings; it is not a quota. Omit empty levels, and a report
whose findings share one level is valid. Every finding cites the file, command,
or observation that confirms it. An inference that could not be confirmed is
not a finding: list it under the report's limitations with the reason.
