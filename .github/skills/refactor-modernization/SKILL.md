---
name: refactor-modernization
description: Modernize code while preserving externally observable behavior.
---

# Refactor Modernization

## Trigger Conditions

Use for cleanup, migration, duplication removal, typing, or boundary correction without feature change.

## Required Inputs

- Target files, preserved behavior contract, known debt, and regression coverage.

## Workflow

1. Establish the behavior baseline and inspect nearby patterns.
2. Bound the refactor and list prohibited behavior changes.
3. Add missing regression coverage before risky restructuring.
4. Apply the smallest coherent structural changes.
5. Remove obsolete paths only after references are migrated.
6. Run focused checks and inspect the diff for behavior drift.

## Deterministic Checks

- Typecheck, lint affected code, run regression tests, and search for stale references.

## Safety and Permission Boundaries

- No feature, authorization, schema, or product-policy changes under this workflow.

## Required Evidence

- Before/after contract, tests, diff summary, and any intentionally deferred debt.

## Completion Condition

- Behavior is preserved and the targeted debt is removed without unrelated churn.

## Example

`Refactor the Project Alpha settings service to isolate persistence.`
