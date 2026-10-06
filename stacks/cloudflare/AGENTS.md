# Cloudflare Rules

Apply these rules to Worker configuration, routes, bindings, edge builds, and
Cloudflare deployments.

- Keep route ownership explicit: every route pattern has exactly one owning
  Worker, with no overlapping or uncovered patterns.
- Declare bindings and environment variables by name only; never commit
  account identifiers, zone identifiers, or secret values.
- Rebuild generated manifests and build splits through the project's
  generator; never hand-edit generated output.
- Measure Worker bundle size on a CI-equivalent build and compare it with the
  applicable size limit before claiming the bundle fits.
- A local build or dry-run validation is not deployment proof; provider
  preview, deployment, and post-deployment smoke are separate gates.
- Production deployment, live route changes, and secret creation or rotation
  require explicit approval from an authorized operator.
- Every deployment records its rollback inputs, such as the previous version
  and configuration revision, and post-deployment smoke evidence.
- The pack's `validate` and `build` commands are defaults; adjust them to the
  project's own scripts and Wrangler configuration.
