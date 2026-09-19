---
name: plan-review
description: Audit and correct implementation plans until blocking findings are resolved.
---

# Plan Review

## Trigger Conditions

Use for plan critique, simplification, readiness assessment, or an authorized plan update.

## Required Inputs

- Plan path, repository sources, reusable patterns, and review mode.

## Workflow

1. Read the plan end to end and inventory proposed changes.
2. Cross-reference every new contract, component, store, and workflow.
3. Find security gaps, duplication, missing ownership, weak evidence, and scope creep.
4. Rank findings as Critical, High, Medium, or Low.
5. In update mode, correct authorized findings without inflating scope.
6. Re-audit and issue a readiness verdict.

## Deterministic Checks

- Validate paths, checkbox syntax, stage-owner presence, and zero unresolved Critical/High findings.

## Safety and Permission Boundaries

- Read-only mode never edits; update mode edits only the named plan.

## Required Evidence

- Each finding names the plan location, repository evidence, impact, and correction.

## Completion Condition

- Ready means zero unresolved Critical or High findings and all gate criteria satisfied.

## Example

`Review the Project Alpha plan for missed reuse and authorization gaps.`
