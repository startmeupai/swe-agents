---
applyTo: '{.github/workflows,config,infrastructure,scripts}/**/*'
---

# Infrastructure and Deployment Rules

- Treat infrastructure changes as reviewable code with validation and previews.
- Use least-privilege workflow permissions, scoped secrets, timeouts, and concurrency.
- Keep route ownership, bindings, generated manifests, and deployment targets consistent.
- Do not treat a local build as deployment proof.
- Production execution and secret mutation require explicit approval.
- Capture rollback inputs and post-deployment smoke evidence.
