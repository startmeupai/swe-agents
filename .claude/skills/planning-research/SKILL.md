---
name: planning-research
description: Research a repository and, only when requested, produce an evidence-backed staged implementation plan.
---

# Planning Research

## Trigger Conditions

Use for codebase research, scope discovery, effort analysis, or plan creation.
Choose read-only research mode when the caller asks a bounded factual question;
choose planning mode only when the caller explicitly requests a plan.

## Required Inputs

- Problem statement, target scope, constraints, and acceptance criteria.

## Workflow

1. Select read-only research mode or planning mode from the requested outcome.
2. Separate in-scope, out-of-scope, assumptions, and missing inputs.
3. Search implementation, tests, configuration, docs, and prior artifacts.
4. Identify reusable contracts and inspect shared runtime behavior.
5. Record evidence and risks, including security and deployment effects.
6. In planning mode only, create stages with one dominant outcome and named
   specialist owner, then add atomic tasks, dependencies, and separate gates.

## Deterministic Checks

- Confirm every referenced file exists. In planning mode, also confirm every
  task row uses `- [ ]` or `- [x]`.

## Safety and Permission Boundaries

- Research is read-only; planning does not authorize implementation or external
  writes. A `research-agent` invocation must not create a plan.

## Required Evidence

- File references for current behavior and explicit labels for unverified assumptions.

## Completion Condition

- Read-only research is complete when the bounded question has an
  evidence-backed answer and limitations. Planning is complete when the plan is
  bounded, evidence-backed, owned, sequenced, and ready for critique.

## Example

`Plan Project Alpha team settings after researching existing RBAC and UI patterns.`
