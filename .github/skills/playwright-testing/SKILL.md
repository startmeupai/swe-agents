---
name: playwright-testing
description: Create, debug, and maintain deterministic Playwright browser journeys.
---

# Playwright Testing

## Trigger Conditions

Use for durable browser specifications, journey debugging, or existing-spec repair.

## Required Inputs

- Journey, access profile, environment, fixtures, selectors, cleanup, and expected signals.

## Workflow

1. Confirm the environment and required access profiles without exposing credentials.
2. Reuse authentication, navigation, and screenshot helpers.
3. Prefer role, label, text, and stable test-id selectors in that order.
4. Wait for observable application state, not elapsed time.
5. Assert the critical behavior and relevant denial paths.
6. Restore state, run the focused spec, and retain traces for failures.

## Deterministic Checks

- Focused browser run, zero unexpected skips, cleanup result, and repeat run when flake risk exists.

## Safety and Permission Boundaries

- Never hardcode credentials, substitute profiles, or run writes against production.

## Required Evidence

- Command, project/browser, profile labels, assertions, artifacts, and skipped cases.

## Completion Condition

- The journey passes reproducibly with correct profiles and clean state.

## Example

`Create a Playwright journey for Project Alpha member invitations.`
