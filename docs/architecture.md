# Architecture

The reference separates durable knowledge by responsibility.

```text
human intent
  -> repository and scoped instructions
  -> persona ownership
  -> skill workflow
  -> tools and local scripts
  -> plans, reports, handoffs, and evidence
```

Instructions constrain all work in their scope. Personas define the owner,
inputs, outputs, boundaries, and handoff. Skills define a bounded workflow.
Scripts verify structure and policy without model judgment. Plans preserve
execution state, while reports and evidence preserve findings and observations.

No layer should impersonate another: a persona is not a runbook, a skill is not
an authority grant, a script is not browser evidence, and a plan checkbox is not
proof unless its exact condition has been satisfied.
