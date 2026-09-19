---
name: ui-replication
description: Recreate an approved visual reference with accessible, token-driven responsive UI.
---

# UI Replication

## Trigger Conditions

Use when screenshots, mockups, or an existing interface define the target appearance.

## Required Inputs

- References, route, viewport scope, interaction states, theme direction, and data contract.

## Workflow

1. Inventory layout, components, typography, spacing, colors, and states.
2. Map visual roles to semantic tokens for light and dark themes.
3. Reuse shared primitives and define focused component boundaries.
4. Implement the shown viewport before requested responsive adaptations.
5. Add accessibility semantics, focus, loading, empty, and error states.
6. Compare structure and visuals against the reference.

## Deterministic Checks

- Typecheck, lint, accessibility assertions, token scans, and visual specs where available.

## Safety and Permission Boundaries

- Do not invent backend behavior or copy private content from a reference.

## Required Evidence

- Reference analysis, viewport captures, diff notes, and known visual variance.

## Completion Condition

- Approved structure and states match within documented tolerances.

## Example

`Replicate the supplied ExampleApp dashboard using its semantic theme tokens.`
