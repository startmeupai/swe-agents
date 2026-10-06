# Cloudflare Pack

Platform rules, an owner persona, and a skill for projects that deploy to
Cloudflare Workers, including OpenNext-style edge builds.

## Scope

- Kind: `platform`.
- Covers Worker configuration, route ownership, bindings, generated
  manifests, bundle size, and the separation of local validation from
  provider preview, deployment, and smoke gates.
- Does not cover CI workflow design; that stays with the core
  `github-actions-agent` and `github-actions` skill.
- Does not deploy or mutate secrets on its own; production execution needs an
  authorized operator.

## What It Adds

| Type | Name | Purpose |
| --- | --- | --- |
| Persona | [`cf-agent`](agents/cf-agent.md) | Own edge-worker infrastructure and its validation |
| Skill | [`cloudflare-ops`](skills/cloudflare-ops/SKILL.md) | Worker configs, routes, bindings, builds, and validation |
| Rules | [`AGENTS.md`](AGENTS.md) | Cloudflare rules merged into the target `AGENTS.md` |

`cf-agent` also loads the core `github-actions` skill. Routes are declared in
[`pack.json`](pack.json) and summarized in
[agent routing](../../docs/agent-routing.md).

## Commands

The commands are examples. Adjust them in `pack.json` to match the project's
own scripts and Wrangler configuration before relying on them.

| Key | Example command | Use |
| --- | --- | --- |
| `validate` | `npx wrangler deploy --dry-run` | Parse configuration and bundle without deploying |
| `build` | `npx wrangler deploy --dry-run --outdir .wrangler/dist` | Produce the CI-equivalent build used for size checks |

A passing `validate` or `build` is local evidence only; it is not deployment
proof.

## Prerequisites

- Wrangler available through the project's package manager.
- A Wrangler configuration file or an OpenNext configuration in the
  repository.
- Account identifiers, zone identifiers, and secret values supplied by the
  environment or the provider, never committed.

The pack is suggested when a repository contains `wrangler.toml`,
`wrangler.jsonc`, or `open-next.config.*`.

## Combining With Other Packs

- The pack has no required packs; pair it with the language pack the Worker
  is written in, usually `typescript`.
- Add `web-ui` and `playwright` for a full web application; the
  `nextjs-cloudflare` profile combines all four.
- Do not combine it with another hosting platform pack for the same
  deployment target without assigning route and deployment ownership.

Example installation into another repository:

```bash
node scripts/stacks/install.mjs --target ../example-app --packs typescript,cloudflare --dry-run
```

## Changelog

### 0.1.0

- Initial pack. Moved `cf-agent` and the `cloudflare-ops` skill from the
  former `.github/agents/` and `.github/skills/` catalog, and the
  provider-specific rules from the former infrastructure and deployment
  instructions.
- Converted the persona to the Claude Code format with a `skills:` list and
  name-only related skills.
- The skill now names the pack's `validate` and `build` commands.
