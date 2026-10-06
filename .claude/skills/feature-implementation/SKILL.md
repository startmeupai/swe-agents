---
name: feature-implementation
description: Deliver a scoped feature across each layer the project has, with authorization, tests, and evidence.
---

# Feature Implementation

## Trigger Conditions

Use for accepted feature behavior requiring coordinated implementation.

## Required Inputs

- Acceptance criteria, data contracts, the layers in scope, authorization
  policy, and any interface constraints.

## Workflow

1. Inspect reusable patterns, identify each layer the project has, and settle
   contracts and boundaries first, using the language's typing or schema
   facilities.
2. Implement persistence behind a dedicated data-access boundary when the
   feature stores data.
3. Implement validated services and transport with resource authorization.
4. When the project has a user interface layer, build it from its shared
   primitives with accessible semantics; leave framework specifics to the
   installed stack pack.
5. Add focused unit, integration, and contract coverage at the narrowest
   useful layer.
6. Register browser or end-to-end coverage needs for the installed
   verification pack's owner, or add that coverage when explicitly in scope.
7. Update documentation and report evidence by layer.

## Deterministic Checks

- Run the project's static analysis, type or schema checks where the language
  has them, relevant linting, focused tests, and repository policy checks,
  using the commands its installed stack packs declare.

## Safety and Permission Boundaries

- Never trust client/model identifiers, bypass RBAC, or mutate external systems without authority.

## Required Evidence

- Changed files, behavior tests, negative cases, and unverified gates.

## Completion Condition

- Acceptance criteria are implemented and all locally executable named checks pass.

## Example

`Implement notification preferences for ExampleApp Project Alpha.`
