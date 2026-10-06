---
name: docs-generation
description: Create concise, structured, link-valid, Markdown-compliant engineering documentation.
---

# Documentation Generation

## Trigger Conditions

Use for READMEs, architecture guides, API documentation, runbooks, and handoffs.

## Required Inputs

- Audience, purpose, authoritative sources, required sections, and verification commands.

## Workflow

1. Confirm scope, audience, source of truth, and non-goals.
2. Organize content around decisions and tasks readers need to perform.
3. Link to definitive local sources instead of duplicating large rule sets.
4. Use examples that are fictional, minimal, and safe to publish.
5. Validate commands, file references, terminology, and limitations.
6. Run Markdown and link checks.

## Deterministic Checks

- Markdown lint, local-link resolution, referenced-file existence, and forbidden-term scan.

## Safety and Permission Boundaries

- Do not include credentials, private domains, personal data, or unsupported claims.

## Required Evidence

- Source list, check results, simplified/omitted material, and human-review flags.

## Completion Condition

- Documentation is accurate, navigable, lint-clean, and safe for its intended audience.

## Example

`Document the ExampleApp plan lifecycle and verification layers.`
