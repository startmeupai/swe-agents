---
name: ui-visual-verification
description: Compare implemented UI with approved references using structural and visual evidence.
---

# UI Visual Verification

## Trigger Conditions

Use after reference-driven UI work or when visual regression proof is requested.

## Required Inputs

- Target route, reference, comparison mode, stable fixtures, viewports, and tolerance.

## Workflow

1. Confirm a stable non-production environment and deterministic data.
2. Define structural assertions before screenshot comparison.
3. Capture approved viewports and theme states.
4. Run pixel comparison only where rendering is stable.
5. Inspect diffs for layout, typography, color, and missing-state causes.
6. Record intentional variance separately from defects.

## Deterministic Checks

- Browser spec result, screenshot existence, stable selectors, and explicit tolerance.

## Safety and Permission Boundaries

- Never approve a new baseline merely to hide an unexplained failure.

## Required Evidence

- Reference, actual, diff or structural measurements, viewport, theme, and result.

## Completion Condition

- All required comparisons pass or remaining differences are documented and accepted.

## Example

`Verify the Project Alpha dashboard at desktop and mobile widths.`
