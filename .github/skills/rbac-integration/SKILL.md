---
name: rbac-integration
description: Implement resource-scoped roles, membership, guards, and runtime authorization proof.
---

# RBAC Integration

## Trigger Conditions

Use for roles, membership, invitations, administration, tenant scope, and access guards.

## Required Inputs

- Actor profiles, resources, role hierarchy, membership store, and allow/deny matrix.

## Workflow

1. Audit shared role normalization, membership writes, and guard behavior.
2. Define resource roles and prevent unintended privilege escalation.
3. Identify and enforce the destination system's membership prerequisites.
4. Implement the approved access matrix; do not assume administrator bypass or role elevation.
5. Guard layouts, routes, actions, stores, and delayed apply paths.
6. Verify member filtering never falls back to cross-scope data.
7. Test positive and negative paths through persistence and direct navigation.

## Deterministic Checks

- Typecheck, focused authorization tests, store round trips, and role-mapping assertions.

## Safety and Permission Boundaries

- Never widen roles to pass a test or trust client-supplied authority.

## Required Evidence

- Allowed and denied outcomes for exact profiles, persisted roles, and scoped listings.

## Completion Condition

- Every protected path enforces resource scope at request and apply time with runtime proof.

## Example

`Add owner, manager, and restricted access to Project Alpha settings.`
