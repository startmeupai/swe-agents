# Workshop Example

## Team Settings Page

Project Alpha asks ExampleApp to add a team settings page. ExampleApp installed
the `nextjs-cloudflare` profile: `typescript`, `web-ui`, `playwright`, and
`cloudflare`.

1. The research owner finds the existing settings route, authorization helper,
   UI primitives, and tests, then writes a read-only report. The core
   `research-agent` acts here; no pack is needed.
2. The planning owner creates a three-stage plan: RBAC contract, UI delivery,
   and verification, each assigned to the appropriate specialist. The core
   `planning-agent` assigns the core `rbac-agent`, the `web-ui` pack's
   `ui-agent`, and the `typescript` pack's `typescript-test-agent`.
3. The critic finds that the draft omitted a negative authorization case. The
   plan is corrected before implementation. The core `plan-critic-agent` acts.
4. Operations executes each approved stage and writes results into the plan.
   The core `plan-operations-agent` coordinates `rbac-agent`, `ui-agent`, and
   `typescript-test-agent`.
5. Deterministic checks prove types, tests, references, and policy. The
   commands come from the `typescript` pack: `pnpm lint`, `pnpm typecheck`, and
   `pnpm test`.
6. Browser verification uses an allowed access profile and a restricted access
   profile. The `playwright` pack's `plan-hv-agent` closes the browser gates,
   and `test-and-prove-agent` packages the evidence.
7. Provider and deployment gates remain open because this local reference has
   no provider connection or deployment authority. The `cloudflare` pack's
   `cf-agent` owns them but cannot close them without that authority.
8. A human reviews the final behavior and decides whether to publish. No
   persona or pack acts for the human.

## Python and Docker API

Project Alpha asks ExampleApp's API service to add a paginated audit-log
endpoint. That repository installed the `python-api-docker` profile: `python`
and `docker`.

1. The core `research-agent` maps the existing router, authentication
   dependency, tests, and container files in a read-only report.
2. The core `planning-agent` stages the endpoint and its authorization rule,
   tests, and the container image, and the core `plan-critic-agent` confirms
   that a denied-access case is planned.
3. The `python` pack's `python-feature-agent` implements the endpoint and
   applies the authorization rule that the core `rbac-agent` defined.
4. The `python` pack's `python-test-agent` adds allowed and denied tests, and
   the pack's commands prove them: `ruff check .`, `mypy .`, and `pytest -q`.
5. The `docker` pack's `docker-agent` updates the image and compose
   configuration and records a local build and container smoke check, which is
   not deployment evidence.
6. No browser layer exists because no `web-ui` or `playwright` pack is
   installed. The plan records that layer as out of scope, not as passed, and
   deployment and human gates remain open.

The files under [`examples/`](../examples/) show the durable artifacts produced
by these flows.
