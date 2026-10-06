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
2. Restate the question, then separate in-scope, out-of-scope, assumptions, and
   missing inputs.
3. Search implementation, tests, configuration, docs, and prior plans and reports.
4. Identify reusable contracts and read the implementation of every shared
   helper the answer or plan depends on; confirm it handles the data shapes in
   scope.
5. Confirm runtime prerequisites such as seeded records, configuration, and
   feature flags; record each missing one as a finding or a plan task.
6. Record evidence and risks, including security and deployment effects.
7. In research mode, rank findings on the
   finding severity scale from the core rules and report a summary, ranked findings, and limitations.
8. In planning mode only, write stages in the format below with atomic tasks,
   dependencies, and separate verification gates.

## Stage Format

```markdown
## Stage 2: Focused Tests

**Goal:** Prove allowed and denied settings updates at the mutation boundary.
**Assigned Specialist:** `test-agent`
**Dependencies:** Stage 1
**Status:** Pending

- [ ] Add positive and negative integration tests.
- [ ] Run the focused test command and record its result.
```

- Give each stage one dominant outcome and the narrowest owning persona. Split
  a stage that mixes unrelated workstreams.
- When a coupled stage needs a second specialist, keep one assigned owner and
  suffix that task with `(Specialist: <persona>)`.
- Write every task and gate as `- [ ]`; no other status markers.

## Deterministic Checks

- Confirm every referenced file exists. In planning mode, run the project's
  plan checker when it has one (for example `pnpm check:plans`) to validate
  checkbox syntax, stage fields, and assigned personas.

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
See `examples/plans/staged-implementation-plan.md` in the reference repository.
