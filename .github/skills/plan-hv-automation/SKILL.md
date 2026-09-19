---
name: plan-hv-automation
description: Close browser-observable plan gates and preserve fresh, profile-correct evidence.
---

# Plan Human-Verification Automation

## Trigger Conditions

Use when a plan has open runtime or human-verification gates after implementation.

## Required Inputs

- Plan, pass signals, failure signatures, profiles, fixtures, environment, and writeback format.

## Workflow

1. Classify each open gate as browser-observable, fixture-blocked, or human-only.
2. Confirm non-production environment and resolve exact profiles.
3. Convert pass and failure signals into falsifiable assertions.
4. Run observable gates and capture assertion-moment evidence.
5. Tick only fresh observed passes; blocker-note failures and inconclusive gates.
6. Request code remediation with the exact rerun condition.
7. Ask humans only for the genuine judgment/provider remainder.

## Deterministic Checks

- Recount open boxes, validate evidence lines, and ensure no skipped profile is marked pass.

## Safety and Permission Boundaries

- Never close from inspection, old evidence, remediation landing, or a substitute profile.

## Required Evidence

- Gate ID, profile, environment, observed signal, artifacts, outcome, and date.

## Completion Condition

- Browser-observable gates have honest outcomes and the remaining queue has explicit owners.

## Example

`Close the observable gates in the Project Alpha implementation plan.`
