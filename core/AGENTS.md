# Core Engineering Rules

## Operating Model

```text
human intent -> research -> plan -> specialist owners -> deterministic checks
  -> independent verification -> explicit gates -> evidence
```

- Personas own outcomes, skills own procedures, and these rules own
  constraints. Route by outcome to the narrowest owning persona, then load only
  the skills the task needs.
- Read the relevant persona and skill before acting. Personas are installed in
  `.claude/agents/` and skills in `.agents/skills/`.
- Installed stack packs add their own rules sections below; apply each one to
  the files its stack covers.

## Global Rules

- Use the project's package and runtime commands as declared by its installed
  stack packs; do not substitute another toolchain.
- Treat the checkout and Git index as shared and preserve unrelated work. Stage
  and commit only the paths you changed, with `git add <paths>` and
  `git commit -m "<message>" -- <paths>`; never `git add -A`, `git add .`, or
  `git commit -a`.
- Never stash, revert, amend, or reformat changes you did not make.
- Do not rebase, hard-reset, or force-push unless the user asks; prefer a merge
  to sync a shared branch.
- Research before broad changes, and prefer the smallest change that satisfies
  the accepted scope.
- Reuse existing contracts before adding abstractions.
- Keep generated, secret, credential, personal, and production data out of the repository.
- Require explicit authority for destructive, external, production, publishing,
  or credential actions.
- Record named evidence and remaining limitations; never infer an unrun pass.

## Markdown Rules

- Use one H1 per document and a logical heading hierarchy.
- Leave blank lines around headings, lists, tables, and fenced code blocks.
- Add a language to every fenced code block.
- Use repository-relative local links.
- End files with one newline and avoid trailing whitespace.

## Plans, Reports, and Handoffs

- Keep plans, reports, handoffs, and evidence manifests in the project's plan,
  report, handoff and evidence locations.
- Plans contain executable stages, atomic checkboxes, ownership, dependencies,
  and verification criteria.
- Reports contain findings and evidence, not execution state.
- Handoffs name completed work, remaining work, blockers, and return conditions.
- Status trails work; update stage state only after the work and its named
  verification are complete, and never pre-fill completion.
- Keep browser, provider, deployment, and human gates distinct.

## Security and Authorization

- Authenticate before resource lookup and authorize against tenant/project scope.
- Use least privilege and re-authorize mutations at apply time.
- Never trust client, tool, or model-supplied identifiers without scope checks.
- Keep resource-scoped roles from granting unintended global privilege.
- Verify role persistence, the explicitly approved administrative policy,
  scoped member lists, and negative access behavior at runtime.
- Redact secrets and personal information from logs and errors.

## Testing

- Prefer deterministic assertions over timing thresholds and arbitrary sleeps.
- Test behavior at the narrowest useful layer, and clean up mutated state explicitly.
- Separate unit, integration, browser, provider, and human evidence.
- Authorization changes require both allowed and denied cases.
- A skipped or unconfigured profile is not a pass.

## Infrastructure and Deployment

- Treat infrastructure changes as reviewable code with validation and previews.
- Use least-privilege workflow permissions, scoped secrets, timeouts, and concurrency.
- Keep generated manifests, configuration, and deployment targets consistent
  with their sources.
- Do not treat a local build as deployment proof.
- Production execution and secret mutation require explicit approval.
- Capture rollback inputs and post-deployment smoke evidence.

## Evidence Layers

Evidence is layered and non-substitutable: policy, type, unit, integration,
browser, security, provider, deployment, human-review, and production proof
each answer a different question, so every completion report names the layers
that ran, the command or observation, the result, and what stayed unverified.
Rank findings as Critical, High, Medium, Low, or Info, and list an unconfirmed
inference under limitations rather than as a finding.
