# RBAC Verification Example

## Positive Case

- Profile: `manager`
- Resource: `Project Alpha`
- Expected: settings read and update allowed.
- Observed: fictional integration fixture returned success and persisted the
  scoped change.

## Negative Case

- Profile: `restricted`
- Resource: `Project Alpha`
- Expected: navigation hidden and direct mutation denied.
- Observed: fictional fixture returned forbidden and persisted no change.

## Cross-Scope Case

- Profile: `manager`
- Resource: another project
- Expected: denied even though the actor manages Project Alpha.
- Observed: fictional fixture returned not found without revealing resource data.

This example demonstrates report shape only; it is not runtime proof.
