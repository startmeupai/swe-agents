---
name: feature-implementation
description: Deliver a scoped typed feature across data, service, API, UI, and tests.
---

# Feature Implementation

## Trigger Conditions

Use for accepted feature behavior requiring coordinated implementation.

## Required Inputs

- Acceptance criteria, types, target layers, authorization policy, and UI constraints.

## Workflow

1. Inspect reusable patterns and settle types and boundaries first.
2. Implement persistence behind a dedicated data-access boundary.
3. Implement validated services and transport with resource authorization.
4. Build accessible UI from shared primitives and semantic tokens.
5. Add focused unit, component, and integration coverage.
6. Register browser coverage needs or add it when explicitly in scope.
7. Update documentation and report evidence by layer.

## Deterministic Checks

- Run type checking, relevant linting, focused tests, and repository policy checks.

## Safety and Permission Boundaries

- Never trust client/model identifiers, bypass RBAC, or mutate external systems without authority.

## Required Evidence

- Changed files, behavior tests, negative cases, and unverified gates.

## Completion Condition

- Acceptance criteria are implemented and all locally executable named checks pass.

## Example

`Implement notification preferences for ExampleApp Project Alpha.`
