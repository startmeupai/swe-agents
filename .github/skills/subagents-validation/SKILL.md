---
name: subagents-validation
description: Validate persona, skill, instruction, catalog, and runtime-surface consistency.
---

# Subagents Validation

## Trigger Conditions

Use after agent-system changes or before publishing agent infrastructure.

## Required Inputs

- Persona, skill, instruction, catalog, script, and runtime-registration locations.

## Workflow

1. Validate directories, filenames, and YAML frontmatter.
2. Confirm personas describe ownership rather than long procedures.
3. Confirm skills contain triggers, bounded workflows, checks, evidence, and completion.
4. Resolve every agent-to-skill and catalog reference.
5. Check duplicate names, contradictions, sanitization, and missing runtime surfaces.
6. Simulate representative prompts and record dispatch ambiguity.

## Deterministic Checks

- Run `pnpm check:agents`, `pnpm check:skills`, and `pnpm check:references`.

## Safety and Permission Boundaries

- Validation is read-only unless the user separately authorizes corrections.

## Required Evidence

- Passed checks, precise violations, simulated prompts, and untested runtime compatibility.

## Completion Condition

- Deterministic checks pass and all remaining compatibility questions are explicit.

## Example

`Validate this reference's agents, skills, instructions, and links.`
