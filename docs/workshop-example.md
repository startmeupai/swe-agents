# Workshop Example

Project Alpha asks ExampleApp to add a team settings page.

1. The research owner finds the existing settings route, authorization helper,
   UI primitives, and tests, then writes a read-only report.
2. The planning owner creates a three-stage plan: RBAC contract, UI delivery,
   and verification, each assigned to the appropriate specialist.
3. The critic finds that the draft omitted a negative authorization case. The
   plan is corrected before implementation.
4. Operations executes each approved stage and writes results into the plan.
5. Deterministic checks prove types, tests, references, and policy.
6. Browser verification uses an allowed profile and a restricted profile.
7. Provider and deployment gates remain open because this local reference has
   no provider connection or deployment authority.
8. A human reviews the final behavior and decides whether to publish.

The files under [`examples/`](../examples/) show the durable artifacts produced
by this flow.
