---
name: docker-ops
description: Build, harden, and validate Dockerfiles, ignore files, and local compose configuration.
---

# Docker Operations

## Trigger Conditions

Use for Dockerfiles, `.dockerignore` files, compose files, base images, build stages, runtime
users, secrets handling, healthchecks, image size, and container build failures.

## Required Inputs

- Services to containerize, build and runtime commands, base image policy, and size budget.
- Secrets contract by name, port and volume needs, and registry or deployment authority.

## Workflow

1. Inventory Dockerfiles, compose files, `.dockerignore` files, entrypoint scripts, and CI steps
   that build, scan, or push images.
2. Settle the base image for each stage, pinned to an exact tag or digest, and split build and
   runtime stages so toolchains and caches stay out of the final image.
3. Order layers for cache reuse with lockfile-based frozen installs, and exclude VCS data, `.env`
   files, dependencies, and build output through `.dockerignore`.
4. Harden the runtime stage: a non-root user, no secrets in layers, `ARG`, `ENV`, or labels
   (`RUN --mount=type=secret` for build-time credentials, runtime injection otherwise), explicit
   ports and volumes, and a healthcheck that uses a binary present in the image.
5. Validate with the pack's compose command (`docker compose config`) and build command
   (`docker build .`, with `-f` for other Dockerfiles), then measure each changed image against
   its size budget.
6. Run the pack's optional lint command (`hadolint Dockerfile`) and the project's named SBOM or
   vulnerability scan when available; record each as passed, failed, or not run.
7. Separate local build and compose proof from registry push, tag promotion, and deployment gates,
   which stay open without explicit authority.

## Deterministic Checks

- `docker compose config` parses with every referenced variable set or explicitly defaulted.
- Each changed image builds with pinned base images and frozen dependency installs.
- `docker image inspect` shows a non-root user, the declared healthcheck, and the declared ports.
- Measured image size is within budget, and lint and scan results are recorded by tool name.

## Safety and Permission Boundaries

- Never push images, promote tags, log in to registries, or deploy without explicit authority.
- Never write secret values into Dockerfiles, compose files, build arguments, or logs; reference
  them by name only.
- Remove only the containers, images, and volumes the task created; never prune shared resources.

## Required Evidence

- Changed files, base image references, compose validation output, and build result per image.
- Runtime user, healthcheck, measured size against budget, and lint and scan status.
- Registry and deployment gate status, stated as open unless proven with authority.

## Completion Condition

- Every changed image builds locally, compose configuration validates, hardening checks pass, and
  registry and deployment gates are either proven with authority or explicitly open.

## Example

`Harden the ExampleApp API image with a non-root runtime stage and validate it without pushing.`
