---
name: test-and-prove
description: Capture a redacted step-by-step browser evidence bundle and manifest.
---

# Test and Prove

## Trigger Conditions

Use when a verified journey needs durable screenshots and a machine-readable manifest.

## Required Inputs

- Numbered journey, environment, profile, capture points, redaction policy, and storage authority.

## Workflow

1. Confirm the environment and run prerequisite checks.
2. Execute each numbered step exactly once in order.
3. Capture evidence immediately after each significant observation.
4. Record browser, viewport, route, timestamp, and outcome in a manifest.
5. Redact personal data, tokens, signed URLs, and sensitive payloads.
6. Publish only when explicitly authorized; otherwise keep the bundle local.

## Deterministic Checks

- Validate manifest schema, unique artifact names, referenced file existence, and ordered steps.

## Safety and Permission Boundaries

- Do not publish, overwrite, or expose sensitive evidence without authority.

## Required Evidence

- Per-step artifact, observed signal, console/network note, and mutation disclosure.

## Completion Condition

- Every required step has a redacted artifact and manifest entry.

## Example

`Capture a local evidence bundle for the Project Alpha approval flow.`
