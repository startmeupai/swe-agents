---
name: access-control-audit
description: Audit authentication, resource scope, IDOR, and apply-time authorization.
---

# Access-Control Audit

## Trigger Conditions

Use after route/action changes or during a security review of authorization surfaces.

## Required Inputs

- Route/action inventory, auth helpers, resource identifiers, data queries, and actor profiles.

## Workflow

1. Enumerate public and protected entrypoints.
2. Confirm authentication precedes sensitive lookup.
3. Trace every identifier to tenant/project scope in the data query.
4. Confirm mutations re-authorize at apply time.
5. Inspect AI/tool-supplied identifiers and delayed operations.
6. Check both allowed and denied profiles and enumeration behavior.

## Deterministic Checks

- Entry-point inventory, guard search, scoped-query inspection, and positive/negative tests.

## Safety and Permission Boundaries

- Audit read-only; never test against real tenant data or widen access.

## Required Evidence

- Precise file locations, actor, reachable resource, missing control, and confirmed query path.

## Completion Condition

- Every in-scope entrypoint is assessed or explicitly listed as not reviewed.

## Example

`Audit Project Alpha settings routes for IDOR and apply-time authorization.`
