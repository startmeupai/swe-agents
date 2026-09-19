# Claude Code Entry Point

Use [`.github/copilot-instructions.md`](.github/copilot-instructions.md) as the
repository-wide rule set, [`.github/AGENTS.md`](.github/AGENTS.md) for ownership
routing, and [`.github/README.md`](.github/README.md) for workflow routing.

Native subagents live in [`.claude/agents/`](.claude/agents/) and discoverable
skills in [`.claude/skills/`](.claude/skills/). These are generated independent
copies of the canonical personas and skills under `.github/`.
Run `pnpm sync:setup` after changing canonical files, then `pnpm check:all`.
Do not edit generated copies directly. No symlinks or external tool credentials
are needed for this reference.

Read applicable `.github/instructions/` files explicitly; do not assume another
tool's path-scoped instruction format is automatically loaded by Claude Code.
Never mark a gate complete without its named evidence. Keep automated, browser,
provider, deployed, and human proof distinct.
