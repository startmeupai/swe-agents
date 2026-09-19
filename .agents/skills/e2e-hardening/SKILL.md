---
name: e2e-hardening
description: Sweep feature claims across access profiles, fix defects, and retain durable coverage.
---

# E2E Hardening

## Trigger Conditions

Use for proactive release hardening of a nominally complete feature or module.

## Required Inputs

- Claim sources, profiles, observable signals, falsifiers, environment, and attempt cap.

## Workflow

1. Build a claim-by-profile table before opening a browser.
2. Resolve every profile and mark missing fixtures as not tested.
3. Drive the shortest honest path to each deterministic signal.
4. Classify each cell as holds, product bug, stale claim, or blocked.
5. Fix owned product causes with a bounded retry loop and rerun sibling cells.
6. Retain only self-cleaning, no-spend, deterministic, falsifiable scenarios.
7. Report every untested cell and every state mutation.

## Deterministic Checks

- Complete matrix accounting, focused browser results, and durability criteria for retained specs.

## Safety and Permission Boundaries

- Never widen access, weaken assertions, substitute profiles, or exceed the fix cap blindly.

## Required Evidence

- Claim source, profile, observed signal, verdict, reproduction, and rerun result.

## Completion Condition

- Every matrix cell has an honest verdict and durable coverage is correctly tiered.

## Example

`Harden Project Alpha sharing across member, manager, and restricted profiles.`
