---
name: github-actions
description: Create and diagnose secure, reproducible GitHub Actions workflows.
---

# GitHub Actions

## Trigger Conditions

Use for CI triggers, quality gates, caches, artifacts, permissions, and workflow failures.

## Required Inputs

- Workflow goal, supported events, project commands, environments, and secrets contract.

## Workflow

1. Inspect existing workflows and local command equivalents.
2. Define least-privilege permissions, concurrency, and timeouts.
3. Use reproducible tool versions and frozen dependency installs.
4. Order fast deterministic gates before expensive builds or deployments.
5. Add useful summaries and artifact retention without leaking secrets.
6. Reproduce failures locally before changing workflow behavior.

## Deterministic Checks

- Parse YAML, validate referenced scripts, and run local equivalents in workflow order.

## Safety and Permission Boundaries

- Never print secrets, grant write permissions by default, or trigger deployment without authority.

## Required Evidence

- Workflow diff, local reproduction, expected trigger matrix, and unresolved provider-only checks.

## Completion Condition

- The workflow is syntactically valid, least-privileged, reproducible, and locally mapped.

## Example

`Add type, lint, and test gates to ExampleApp pull requests.`
