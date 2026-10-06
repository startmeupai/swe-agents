---
applyTo: '**/*'
---

# Global Repository Rules

- Use `pnpm` for project commands.
- Preserve unrelated work in shared checkouts. Stage and commit only the paths
  you changed, with `git add <paths>` and `git commit -m "<message>" -- <paths>`;
  never `git add -A`, `git add .`, or `git commit -a`.
- Never stash, revert, amend, or reformat changes you did not make.
- Do not rebase, hard-reset, or force-push unless the user asks; prefer a merge
  to sync a shared branch.
- Prefer the smallest change that satisfies the accepted scope.
- Reuse existing contracts before adding abstractions.
- Keep generated, secret, credential, personal, and production data out of the repository.
- Require explicit authority for destructive, external, production, or publishing actions.
- Record named evidence and remaining limitations; never infer an unrun pass.
