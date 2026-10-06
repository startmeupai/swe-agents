# Supabase Rules

Apply these rules to Supabase configuration, migrations, row-level security
policies, storage, edge functions, auth settings, and generated types.

- Treat `supabase/migrations/` as the schema source of truth; ship every
  table, policy, grant, function, trigger, and bucket change as a migration,
  never as a dashboard-only change.
- Add a new forward migration instead of editing one already applied to a
  shared or remote database.
- Enable row-level security on every table in an exposed schema, create
  exposed views with `security_invoker = true`, and cover each policy with
  both an allowed and a denied test.
- Keep the service-role key and secret API keys out of client code, browser
  bundles, the repository, and logs; use them only in trusted server or
  edge-function code.
- Make `anon`, `authenticated`, and `service_role` access explicit in grants
  and in each policy's `to` clause; do not rely on default grants.
- Scope policies by tenant or project membership derived from `auth.uid()` or
  verified JWT claims, never from client-writable columns or user-editable
  metadata.
- Give every `security definer` function an explicit `search_path`, and keep
  it out of exposed schemas or revoke `execute` from `public`, `anon`, and
  `authenticated`.
- Edge functions verify the caller's JWT before trusting any claim, validate
  input against a schema, and return sanitized errors; turn off the platform
  `verify_jwt` gate only when the function verifies the JWT or a webhook
  signature itself.
- Commit generated database types and regenerate them after every schema
  change.
- Declare storage buckets, their public or private visibility, and their
  `storage.objects` policies explicitly.
- Verify against the local stack (`supabase start`, `supabase db reset`); a
  local pass is not proof of remote state.
- Remote `supabase db push`, project linking, function deploys, auth or
  project settings, and secret changes require explicit approval from an
  authorized operator.
- The pack's commands are defaults; set the `gen_types` language and output
  path to the project's client, and run the project's own database test
  command, such as `supabase test db` for pgTAP suites.
