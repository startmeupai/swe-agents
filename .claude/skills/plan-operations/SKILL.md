---
name: plan-operations
description: Execute approved plans continuously with truthful stage-end writeback.
---

# Plan Operations

## Trigger Conditions

Use when asked to execute, continue, update, or finish an approved plan.

## Required Inputs

- Plan path, current state, stage owners, dependencies, and verification criteria.

## Workflow

1. Read the entire plan and confirm approval, status, scope, and blockers.
2. Check shared-checkout state and assign disjoint specialist ownership.
3. Execute the next unblocked stage without pre-filling later status.
4. Run the stage's named checks and preserve exact results.
5. Reconcile each checkbox independently against its own wording. The task
   boxes are the writeback; derive stage and plan status from them and never
   edit status on its own.
6. Tag every box left open at a stage boundary with why it is open:
   `**Browser gate:**`, `**Provider gate:**`, `**Deployment gate:**`,
   `**Operations gate:**`, `**Legal gate:**`, `**Human gate:**`, or
   `**Blocked on <owner or dependency>:**`.
7. Write status, evidence, blockers, and next dependency into the plan.
8. Continue until complete, genuinely blocked, or at a human-only gate.

## Stage Status

| Status | Meaning |
| --- | --- |
| Pending | Not started; open boxes need no tag |
| In progress | Work is underway inside the current run |
| Blocked | Stopped on a named owner or dependency; every open box is tagged |
| In review | Development is done; every open box is a tagged gate |
| Complete | Every box is checked |

## Deterministic Checks

- The project's plan checker (for example `pnpm check:plans`) exits 0 at every
  stage boundary: statuses are known, Complete stages have no open box, and
  every open box in a Blocked or In review stage carries a gate tag. Without a
  checker, verify the same conditions by reading the plan.

## Safety and Permission Boundaries

- Do not expand scope, publish, deploy, or perform destructive operations without authority.

## Required Evidence

- Stage-local command results, observations, changed files, and blocker ownership.

## Completion Condition

- All executable stages are complete and remaining external/human gates are explicit.

## Example

`Execute the approved Project Alpha plan and write back after every stage.`
See `examples/plans/stage-end-writeback.md` and
`examples/plans/review-gate-writeback.md` in the reference repository.
