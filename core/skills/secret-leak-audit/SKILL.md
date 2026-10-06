---
name: secret-leak-audit
description: Audit source, history, logs, and errors for credential or sensitive-data exposure.
---

# Secret Leak Audit

## Trigger Conditions

Use after logging/config changes, dependency incidents, or during security review.

## Required Inputs

- Source tree, tracked-file list, bounded history scope, logging paths, and ignore rules.

## Workflow

1. Scan source for high-confidence credential and private-key patterns.
2. Confirm environment and key files are ignored and untracked.
3. Scan the authorized history window without echoing matched values.
4. Review prompt, request, header, user, and provider-response logging.
5. Check client errors and source maps for internal detail leakage.
6. Record safe remediation direction and the exact scan limitation.

## Deterministic Checks

- Pattern scan, tracked-file scan, ignore coverage, and redaction test.

## Safety and Permission Boundaries

- Never print, store, or quote a discovered value; report only redacted metadata.

## Required Evidence

- File and line, pattern class, exposure surface, history window, and redacted result.

## Completion Condition

- All requested surfaces are scanned and the report itself contains no secret values.

## Example

`Audit ExampleApp source and logs for secret exposure.`
