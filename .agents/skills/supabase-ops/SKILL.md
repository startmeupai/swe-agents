---
name: supabase-ops
description: Write Supabase migrations, RLS policies, edge functions, and types with local-first proof.
---

# Supabase Operations

## Trigger Conditions

Use for schema changes, migrations, row-level security, grants, database functions, storage
buckets and policies, edge functions, auth configuration, and generated database types.

## Required Inputs

- Schema change, tenant and project scope, and the approved allow/deny matrix per role.
- Exposed schemas, function contracts, generated-types path, and remote-environment authority.

## Workflow

1. Inventory `supabase/config.toml`, `supabase/migrations/`, existing policies and grants, storage
   buckets, `supabase/functions/`, generated types, and database tests.
2. Create a forward migration with the pack's migration command (`supabase migration new <name>`);
   never edit a migration already applied to a shared or remote database.
3. Enable RLS on every table in an exposed schema, write one policy per operation with an explicit
   role (`anon`, `authenticated`, or `service_role`), scope rows by tenant or project membership
   from `auth.uid()` or verified claims, and declare grants and storage object policies explicitly.
4. Write allowed and denied policy tests for each affected role, including `anon`, a member of
   another tenant, and a member without the required role.
5. For edge functions, verify the caller's JWT, validate input against a schema, keep the
   service-role key in server-side code, and return sanitized errors.
6. Regenerate types with the pack's type command (`supabase gen types typescript --local > <path>`)
   and commit them with the migration.
7. Run the pack's local commands (`supabase start`, then `supabase db reset`), the project's
   database policy tests (for example `supabase test db`), and changed functions under
   `supabase functions serve`.
8. Separate local proof from the remote gate: project linking, `supabase db push`, function
   deploys, and auth, project, or secret changes stay open without explicit authority.

## Deterministic Checks

- `supabase db reset` rebuilds the local database from migrations without manual steps.
- No table in an exposed schema has RLS disabled (`pg_tables.rowsecurity` is true for each).
- Allowed and denied policy tests pass for every affected role.
- Local function calls succeed with a valid JWT, fail with a missing or invalid one, and deny
  another tenant's resources.
- Regenerating types produces no diff against the committed file.

## Safety and Permission Boundaries

- Never link, push to, deploy to, or change settings or secrets of a remote project without
  explicit authority.
- Never commit or print the service-role key, secret API keys, JWT secret, or database
  passwords; reference them by environment variable name only.
- Never disable RLS, grant broad privileges, or route client requests through the service role to
  make a test pass.

## Required Evidence

- Migration files, policy and grant diff, and allowed and denied test results per role.
- Local reset, function, and type-regeneration results.
- Remote gate status, stated as open unless proven with authority.

## Completion Condition

- The local database rebuilds from migrations, every exposed table has RLS with passing allowed
  and denied tests, types are current, and remote changes are either proven with authority or
  explicitly open.

## Example

`Add a tenant-scoped documents table with RLS to Project Alpha and verify it without pushing.`
