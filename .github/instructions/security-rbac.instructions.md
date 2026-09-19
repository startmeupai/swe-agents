---
applyTo: '{app,lib,server,api}/**/*.{ts,tsx}'
---

# Security and RBAC Rules

- Authenticate before resource lookup and authorize against tenant/project scope.
- Re-authorize mutations at apply time.
- Never trust client, tool, or model-supplied identifiers without scope checks.
- Keep resource-scoped roles from granting unintended global privilege.
- Verify role persistence, the explicitly approved administrative policy, scoped member lists,
  and negative access behavior at runtime.
- Redact secrets and personal information from logs and errors.
