---
name: subagents-validation
description: Validate persona, skill, rules, stack-pack, catalog, and runtime-surface consistency.
---

# Subagents Validation

## Trigger Conditions

Use after agent-system changes or before publishing agent infrastructure.

## Required Inputs

- Core and stack-pack persona, skill, rules-fragment, and manifest locations,
  plus the catalog, routing guide, check scripts, and runtime-registration
  locations.

## Workflow

1. Validate directories, filenames, pack manifests, and YAML frontmatter.
2. Confirm personas describe ownership rather than long procedures.
3. Confirm skills contain triggers, bounded workflows, checks, evidence, and completion.
4. Resolve every persona-to-skill and catalog reference; a pack persona may use
   only core skills, its own pack's skills, or skills from a pack it requires.
5. Confirm core content names no pack persona or skill, and that agent and
   skill names are unique across core and every pack.
6. Check contradictions, sanitization, stale generated copies, and missing
   runtime surfaces.
7. Simulate representative prompts and record dispatch ambiguity.

## Deterministic Checks

- In the reference repository, run `pnpm check:agents`, `pnpm check:skills`,
  `pnpm check:references`, and `pnpm check:stacks`. In an installed project,
  run the agent-system checks it provides and record any that are unavailable.

## Safety and Permission Boundaries

- Validation is read-only unless the user separately authorizes corrections.

## Required Evidence

- Passed checks, precise violations, simulated prompts, and untested runtime compatibility.

## Completion Condition

- Deterministic checks pass and all remaining compatibility questions are explicit.

## Example

`Validate this reference's core and pack agents, skills, rules, and links.`
