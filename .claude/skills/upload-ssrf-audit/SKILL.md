---
name: upload-ssrf-audit
description: Audit uploads, extraction, and server fetches for SSRF and resource-exhaustion risk.
---

# Upload and SSRF Audit

## Trigger Conditions

Use after adding uploads, URL ingestion, document extraction, or server-side outbound requests.

## Required Inputs

- Fetch/upload inventory, URL guard, redirect policy, parsers, storage path, and limits.

## Workflow

1. Find server-side network calls and user-influenced destinations.
2. Verify scheme, host, DNS/IP, redirect, and private-network defenses.
3. Check total/per-chunk timeouts, byte caps, decompression ratio, and content types.
4. Verify upload size, MIME, filename, and storage-key normalization server-side.
5. Route extracted content through untrusted-content boundaries.
6. Review edge cases such as alternate IP notation and metadata endpoints.

## Deterministic Checks

- Static inventory plus unit cases for blocked addresses, redirects, sizes, MIME, and filenames.

## Safety and Permission Boundaries

- Do not probe private or production networks; use local fixtures and reserved domains.

## Required Evidence

- Input source, destination path, missing defense, reproducible fixture, and exact result.

## Completion Condition

- Every in-scope fetch/upload path has a verdict and bounded-resource controls.

## Example

`Audit ExampleApp URL imports and document uploads for SSRF.`
