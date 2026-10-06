# Supabase Stack Pack

Migration-first schema, row-level security, storage, edge-function, and auth
configuration rules for projects built on Supabase, verified against the local
stack before any remote gate.

## Scope

- `supabase/config.toml`, `supabase/migrations/`, `supabase/functions/`,
  database policy tests, storage bucket policies, and generated database
  types.
- Database-level enforcement of an approved authorization matrix through
  grants and RLS policies.
- Out of scope: application role design, UI, and any remote project change
  without explicit authority.

## What It Adds

| Kind | Name | Purpose |
| --- | --- | --- |
| Rules | [Supabase Rules](AGENTS.md) | Merged into the target repository's `AGENTS.md`. |
| Persona | [supabase-agent](agents/supabase-agent.md) | Owns schema migrations, RLS, edge functions, and auth configuration. |
| Skill | [supabase-ops](skills/supabase-ops/SKILL.md) | Migrate, enforce policies, regenerate types, and gate remote changes. |

Route: "Own database schema, RLS, and edge functions" goes to `supabase-agent`
with `supabase-ops` and the core `rbac-integration` and `access-control-audit`
skills.

## Commands

| Key | Default | Notes |
| --- | --- | --- |
| `start` | `supabase start` | Starts the local stack; needs a Docker-compatible runtime. |
| `db_reset` | `supabase db reset` | Rebuilds the local database from migrations and seed data. |
| `migrate_new` | `supabase migration new <name>` | Creates a timestamped forward migration. |
| `gen_types` | `supabase gen types typescript --local > <path>` | Regenerates TypeScript types; commit the output. |
| `functions_serve` | `supabase functions serve` | Serves edge functions locally. |
| `test_db` | `supabase test db` | Runs pgTAP database tests against the local stack. |

Commands are adjustable defaults. Projects with pgTAP suites usually run them
with `supabase test db`; set the `gen_types` language and output path to match
the project's client.

## Prerequisites

- The Supabase CLI and a Docker-compatible runtime for the local stack.
- No remote project credentials; local verification needs none.

## Detection

The installer can suggest this pack when a target repository contains
`supabase/config.toml` or files under `supabase/migrations/`.

## How to Combine

- The pack requires no other pack; its persona uses the core
  `rbac-integration` and `access-control-audit` skills.
- The `nextjs-supabase` profile combines `typescript`, `web-ui`, `playwright`,
  and `supabase`.
- The core `rbac-agent` owns application authorization semantics;
  `supabase-agent` enforces the approved matrix as grants and policies.
- The installed UI pack owns UI changes, and the core `security-auditor-agent`
  provides independent policy review.
- With the `docker` pack, `docker-agent` owns the project's own images, not
  the containers the Supabase CLI manages for the local stack.

## Changelog

### 0.1.0

- Initial pack: Supabase rules, `supabase-agent`, and `supabase-ops`.
