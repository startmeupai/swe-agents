---
name: ui-sm-verification
description: Verify authenticated small-screen routes and interactions with browser evidence.
---

# UI Small-Screen Verification

## Trigger Conditions

Use for one-off mobile checks, responsive fixes, narrow panels, and touch reachability.

## Required Inputs

- Route, access profile, viewport, expected actions, and non-production environment.

## Workflow

1. Confirm credentials are referenced only through the configured profile.
2. Set the viewport before navigation and authenticate normally.
3. Verify route content, scroll, overflow, navigation, and action reachability.
4. Exercise at least one critical interaction.
5. Re-check the desktop layout for regressions.
6. Capture initial, post-action, and full-page evidence.

## Deterministic Checks

- Assert target URL, visible landmarks, no horizontal overflow, and expected outcome.

## Safety and Permission Boundaries

- Use test accounts only; never expose credentials or write to an unconfirmed environment.

## Required Evidence

- Viewport, profile label, screenshots, observed behavior, and console/network failures.

## Completion Condition

- The required action is reachable and works without mobile or desktop regression.

## Example

`Verify the Project Alpha settings form at 390 by 844 pixels.`
