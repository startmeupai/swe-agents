# Docker Stack Pack

Container image build, hardening, and local compose rules for projects that
ship Dockerfiles, with one owner persona and one operations skill.

## Scope

- Dockerfiles, `.dockerignore` files, and compose files used for local
  development and test.
- Base image pinning, build stages, runtime users, secrets handling,
  healthchecks, ports, volumes, image size, and SBOM or scan steps.
- Out of scope: registry publishing, orchestrator manifests, and production
  deployment execution, which stay behind explicit authority.

## What It Adds

| Kind | Name | Purpose |
| --- | --- | --- |
| Rules | [Docker Rules](AGENTS.md) | Merged into the target repository's `AGENTS.md`. |
| Persona | [docker-agent](agents/docker-agent.md) | Owns container build and compose configuration. |
| Skill | [docker-ops](skills/docker-ops/SKILL.md) | Inventory, harden, validate, and gate container changes. |

Route: "Own container build and compose configuration" goes to `docker-agent`
with `docker-ops` and the core `github-actions` skill.

## Commands

| Key | Default | Notes |
| --- | --- | --- |
| `build` | `docker build .` | Add `-f <path>` for Dockerfiles outside the repository root. |
| `compose_validate` | `docker compose config` | Resolves compose files without starting services. |
| `lint` | `hadolint Dockerfile` | Optional; record it as not run when `hadolint` is absent. |

Commands are adjustable defaults; align them with the project's own scripts.

## Prerequisites

- Docker Engine or a compatible runtime with the Compose plugin.
- Optional: `hadolint`, plus the project's chosen SBOM and vulnerability
  scanner.
- No registry credentials are needed or expected.

## Detection

The installer can suggest this pack when a target repository contains
`Dockerfile`, `**/Dockerfile*`, `compose.yaml`, or `docker-compose.yml`.

## How to Combine

- The pack requires no other pack; its persona also uses the core
  `github-actions` skill.
- Pair it with a language pack, which owns application behavior inside the
  image; the `python-api-docker` profile combines `python` and `docker`.
- The core `github-actions-agent` owns CI jobs that build, scan, or publish
  images.
- Platform packs that own deployment keep their own deployment gates; a local
  image build never closes them.

## Changelog

### 0.1.0

- Initial pack: Docker rules, `docker-agent`, and `docker-ops`.
