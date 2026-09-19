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
5. Reconcile each checkbox independently against its own wording.
6. Write status, evidence, blockers, and next dependency into the plan.
7. Continue until complete, genuinely blocked, or at a human-only gate.

## Deterministic Checks

- Every open checkbox has an incomplete-work note; completion requires all named checks.

## Safety and Permission Boundaries

- Do not expand scope, publish, deploy, or perform destructive operations without authority.

## Required Evidence

- Stage-local command results, observations, changed files, and blocker ownership.

## Completion Condition

- All executable stages are complete and remaining external/human gates are explicit.

## Example

`Execute the approved Project Alpha plan and write back after every stage.`
