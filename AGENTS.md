# Agent Entry Point

These rules are for maintainers, contributors, and agents changing this
reference itself. Every supported client starts here (Copilot through
`.github/copilot-instructions.md`). There is no `CLAUDE.md`; by default Claude
Code reads `AGENTS.md` only when no `CLAUDE.md`, `.claude/CLAUDE.md`, or
`CLAUDE.local.md` exists here or in any directory above.

## Canonical and Generated Files

- Canonical sources: [`core/`](core/) holds the stack-neutral rules fragment,
  personas, and skills; [`stacks/`](stacks/) holds one pack per language,
  framework, platform, or verification stack, each with a manifest, rules
  fragment, and optional personas and skills.
- Generated copies of the `reference` profile (core plus every pack):
  `.claude/agents/`, `.claude/skills/`, `.agents/skills/`, `.codex/agents/`,
  and `.github/agents/`. Never edit them directly.
- After any canonical change, run `pnpm sync:setup`, then `pnpm check:all`,
  and commit the canonical and regenerated files together.
- Use plain copies; symlinks are not allowed.
- Core must stay stack-neutral and never name a pack persona or skill. New pack
  personas and skills start with `<pack>-`, and every name is unique across
  core and all packs.

## Working Rules

- Read and follow [`core/AGENTS.md`](core/AGENTS.md); it applies here too. Read
  the `AGENTS.md` of every pack you change; it is not loaded automatically.
- Use `pnpm` for this repository's commands.
- Read the relevant persona and skill before acting. Personas own outcomes,
  skills own procedures, and rules fragments own constraints.
- Keep examples fictional: `ExampleApp`, `Project Alpha`, `example.invalid`.
- Store plans under `examples/plans/`, reports under `examples/reports/`,
  handoffs under `examples/handoffs/`, and browser manifests under
  `examples/browser-evidence/`.
- Update [`SOURCE_MAP.md`](SOURCE_MAP.md) for every added, moved, or removed
  tracked file.
- Do not treat `@agent-name` examples as universal invocation syntax.

## Evidence and Authority

- Never claim automated, browser, provider, deployed, or human evidence that
  was not actually collected, and never mark a gate complete without its named
  evidence. See the [verification model](docs/verification-model.md).
- Record proof by layer and keep automated, browser, provider, deployed, and
  human proof distinct; an unrun check is never a pass.
- Production, destructive, external write, publication, and credential changes
  require explicit human authority.

## Routing

- Persona catalog: [`.github/AGENTS.md`](.github/AGENTS.md).
- Outcome routing: [`docs/agent-routing.md`](docs/agent-routing.md).
- Packs, profiles, and installing into another repository:
  [`docs/stack-packs.md`](docs/stack-packs.md).

## Verification

Run `pnpm check:all` after agent-system changes and report each result
separately; do not report checks that did not run.
