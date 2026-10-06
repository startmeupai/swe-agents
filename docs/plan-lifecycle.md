# Plan Lifecycle

## States

```text
draft -> reviewed -> active -> review gates -> complete
                     ^              |
                     +-- remediation+
```

A plan becomes executable only after its blocking findings are resolved. During
execution, each stage records its current status, completed task checkboxes,
commands and observations, blockers, and next dependency.

Checkboxes are atomic. An implementation checkbox can be complete while a
separate browser or provider check remains open. Verification checkboxes remain
open until the named command or observation actually succeeds.

Stage statuses and the gate tags on open boxes are defined in the
[plan-operations skill](../.github/skills/plan-operations/SKILL.md).
`pnpm check:plans` enforces them; run it at every stage boundary.

A plan with unresolved runtime, provider, legal, operational, or human gates
stays in review. A failed gate that reveals code work returns to active
remediation. Completion requires every required box to be closed or an explicit,
recorded owner decision accepting an exception.
