# Docker Rules

Apply these rules to Dockerfiles, `.dockerignore` files, compose files, and
container image builds.

- Pin every base image to an exact version tag or a digest; never build from
  `latest` or another floating tag.
- Use multi-stage builds so compilers, package caches, and test tooling stay
  out of the runtime image.
- Run the runtime stage as a non-root user with a fixed UID and only the file
  permissions it needs.
- Keep layers minimal and cache-friendly: copy lockfiles before sources, use
  frozen installs, prefer `COPY` over `ADD`, and keep a `.dockerignore` that
  excludes VCS data, `.env` files, dependencies, and build output.
- Never put secrets in images, layers, `ARG`, `ENV`, or labels; use build
  secret mounts (`RUN --mount=type=secret`) for build-time credentials and
  runtime secret injection for everything the container needs while running.
- Keep builds reproducible: pinned tool and package versions, no unpinned
  downloads, and the same result from a clean build cache.
- Define a healthcheck that exercises real readiness with a binary that is
  present in the runtime image.
- Declare exposed ports and volumes explicitly; bind local-only compose
  services to `127.0.0.1`.
- Treat compose files as local development and test tooling unless the
  project states otherwise; commit `.env.example` with placeholder names,
  never a populated `.env`.
- Set an image size budget and report the measured size against it whenever
  an image changes.
- Name the SBOM and vulnerability-scan step and its tool; record it as not
  run when it did not run instead of assuming it passed.
- A local build or a running compose stack is not deployment proof.
- Registry pushes, tag promotion, and production deployment require explicit
  approval from an authorized operator.
- The pack's `build`, `compose_validate`, and `lint` commands are defaults;
  adjust them to the project's own Dockerfile paths and scripts, and treat
  `lint` as optional because it needs the `hadolint` tool.
