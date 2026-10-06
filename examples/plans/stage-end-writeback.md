# Stage-End Operations Writeback

## Stage 1: Authorization Contract

**Goal:** Enforce Project Alpha manager scope at the settings mutation.
**Assigned Specialist:** `rbac-agent`
**Dependencies:** None
**Status:** Complete

- [x] Define manager and restricted profile expectations.
- [x] Add apply-time Project Alpha scope validation.
- [x] Verify one allowed and one denied integration case.

**Progress Update:** The mutation now checks Project Alpha membership at apply
time. The focused integration command passed 2 tests. Browser, provider, and
human gates remain separate and open in later stages.

## Next Dependency

Stage 2 can begin. No blocker is recorded.
