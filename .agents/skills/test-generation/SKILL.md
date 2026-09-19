---
name: test-generation
description: Create deterministic unit, component, integration, and contract tests.
---

# Test Generation

## Trigger Conditions

Use when behavior needs focused automated coverage below the browser layer.

## Required Inputs

- Target behavior, inputs/outputs, dependencies, edge cases, and test conventions.

## Workflow

1. Choose the narrowest test layer that proves the contract.
2. List success, boundary, failure, and authorization cases.
3. Isolate external dependencies with typed fakes at stable boundaries.
4. Write behavior-focused assertions that fail on meaningful regression.
5. Remove timing dependence and restore mutated state.
6. Run focused tests before broader suites.

## Deterministic Checks

- Focused runner result, typecheck for test code, and stable repeated execution.

## Safety and Permission Boundaries

- Do not call live providers, use real credentials, or change production logic to pass.

## Required Evidence

- Test names, commands, pass/fail counts, skips, and unrelated failures.

## Completion Condition

- Required cases pass deterministically and would fail if behavior regressed.

## Example

`Add positive and negative authorization tests for Project Alpha settings.`
