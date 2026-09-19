---
name: cloudflare-ops
description: Maintain Cloudflare Worker configuration, routes, bindings, builds, and validation.
---

# Cloudflare Operations

## Trigger Conditions

Use for worker configs, route ownership, bindings, scheduled handlers, bundle limits, and edge builds.

## Required Inputs

- Worker/module scope, routes, bindings, environment, build contract, and deployment authority.

## Workflow

1. Inventory existing worker definitions, route maps, manifests, and scripts.
2. Identify the destination project's configuration source of truth before editing it.
3. Declare bindings by name without embedding values.
4. Validate route ownership for overlap and missing coverage.
5. If manifests are generated, rebuild them through the project's generator.
6. Measure bundle size on a CI-equivalent build.
7. Separate local validation from provider preview, deployment, and smoke gates.

## Deterministic Checks

- Config parse, route-map consistency, manifest freshness, bundle gate, and local smoke command.

## Safety and Permission Boundaries

- Never copy account identifiers or secret values; deployment requires explicit authority.

## Required Evidence

- Changed configs, validation results, size result, and provider/deployment status.

## Completion Condition

- Local infrastructure checks pass and external gates are either proven or explicitly open.

## Example

`Validate ExampleApp worker routes and bundle size without deploying.`
