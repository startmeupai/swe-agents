# Repository-Wide Agent Instructions

- Read the relevant persona and skill before acting.
- Keep agents focused on ownership and skills focused on procedures.
- Use least privilege and re-authorize every mutation at the resource boundary.
- Preserve unrelated work in a shared checkout.
- Reuse existing contracts and primitives before creating new ones.
- Store plans under `examples/plans/`, reports under `examples/reports/`,
  handoffs under `examples/handoffs/`, and browser manifests under
  `examples/browser-evidence/` in this reference.
- Update stage state only after work and named verification are complete.
- Never claim automated, browser, provider, deployed, or human evidence that was
  not actually collected.
- Production, destructive, external write, publication, and credential changes
  require explicit human authority.
- Run `pnpm check:all` after changing this agent system.

Apply narrower rules from [instructions](instructions/) for the files in scope.
