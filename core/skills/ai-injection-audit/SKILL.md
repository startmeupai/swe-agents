---
name: ai-injection-audit
description: Audit AI trust boundaries, wrapper use, strict outputs, and apply-time controls.
---

# AI Injection Audit

## Trigger Conditions

Use for AI feature changes or a security pass over model input and output handling.

## Required Inputs

- Model call inventory, central wrapper, trust model, schemas, output filters, and write paths.

## Workflow

1. Find direct provider calls that bypass the approved wrapper.
2. Trace untrusted user, upload, fetched, and tool content into prompts.
3. Confirm structural separation from developer/system instructions.
4. Require strict structured-output validation before application use.
5. Trace model-proposed writes through deterministic validation and re-authorization.
6. Check logging and metrics for prompt or secret leakage.

## Deterministic Checks

- Provider-import scan, wrapper-call inventory, schema strictness, and apply-path tests.

## Safety and Permission Boundaries

- Never execute untrusted model output or include sensitive prompt content in the report.

## Required Evidence

- Confirmed source path, attacker-controlled input, boundary failure, impact, and limitation.

## Completion Condition

- Every in-scope model call and write path is assessed or explicitly unverified.

## Example

`Audit ExampleApp's AI-assisted settings proposal flow.`
