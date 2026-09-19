# Security Boundaries

## Authority

The model is never an authorization authority. Deterministic application code
validates inputs, checks authentication and resource scope, re-authorizes at
apply time, and constrains tool calls and writes.

## Trust

User input, uploaded files, fetched content, browser state, tool output, and
model output are untrusted until validated for their destination. Structural
separation and strict schemas are stronger controls than prompt reminders or
regex-only filtering.

## Least Privilege

- Prefer read-only credentials and narrow resource scopes.
- Keep development, test, and production credentials isolated.
- Never place secrets or personal data in prompts, logs, plans, or evidence.
- Validate server-fetch destinations, redirects, response size, content type,
  and timeouts before consuming remote content.
- Test both allowed and denied RBAC behavior with the exact intended profiles.
- Require explicit authority for destructive, external, production, or
  publication actions.

Security audits report evidence and limitations; they do not silently change
authorization policy.
