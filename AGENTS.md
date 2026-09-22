# Agent Entry Point

Read [`.github/copilot-instructions.md`](.github/copilot-instructions.md) first,
then load the narrowest matching instruction, persona, and skill.

## Operating Rules

- Use `pnpm` for project commands.
- Treat the checkout and Git index as shared.
- Research before broad changes and reuse before creating abstractions.
- Agents own outcomes; skills own procedures; instructions own constraints.
- Keep authentication, authorization, tenant scope, and apply-time checks explicit.
- Record proof by layer; never convert an unrun check into a pass.
- Do not perform destructive, production, publishing, or external write actions
  without explicit authority.

## Routing

The persona catalog is [`.github/AGENTS.md`](.github/AGENTS.md), and detailed
routing guidance is in [`docs/agent-routing.md`](docs/agent-routing.md).
Path-scoped rules live in [`.github/instructions/`](.github/instructions/).

## Codex Setup

Native custom-agent definitions live in `.codex/agents/`; discoverable skill
copies live in `.agents/skills/`. Their canonical sources live under `.github/`.
After changing a canonical persona or skill, run `pnpm sync:setup` and
`pnpm check:setup`. Read applicable `.github/instructions/` files explicitly.
Do not treat `@agent-name` examples as universal invocation syntax.

## Verification

Run `pnpm check:all` after agent-system changes. Run only additional checks that
exist in the adopting repository, and report each result separately.
