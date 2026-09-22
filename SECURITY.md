# Security Policy

## Supported Versions

Security fixes target the default branch and the latest tagged release.

| Version | Supported |
| --- | --- |
| Default branch | Yes |
| Latest release | Yes |
| Older releases | No |

## Reporting a Vulnerability

Use GitHub's
[private vulnerability reporting](https://github.com/startmeupai/swe-agents/security/advisories/new)
to report a vulnerability. Do not open a public issue containing credentials,
exploit details, personal data, or private repository content.

Include the affected files or versions, reproduction steps, expected impact,
and any suggested mitigation. We aim to acknowledge a complete report within
five business days and will coordinate disclosure after a fix is available.

If private reporting is unavailable, email `contact@startmeup.ai` with
`[SECURITY] swe-agents` in the subject. Do not include live credentials.

## Scope

Reports may cover validation scripts, workflow permissions, agent or skill
trust boundaries, sanitization gaps, secret-detection gaps, and examples that
could teach unsafe behavior. This repository contains no application runtime or
production service to test.
