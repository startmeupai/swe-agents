# Project Alpha Settings Authorization Plan

> **Status:** Ready for execution
> **Last Updated:** 2026-01-15

## Scope

Add resource-scoped manager authorization to the existing settings mutation and
prove both allowed and denied behavior. No redesign or deployment is included.

## Stage 1: Authorization Contract

**Assigned Specialist:** `rbac-agent`
**Dependencies:** None
**Status:** Pending

- [ ] Define the manager and restricted profile expectations.
- [ ] Add apply-time Project Alpha scope validation to the mutation.
- [ ] Verify an allowed manager update and a denied restricted update.

## Stage 2: Focused Tests

**Assigned Specialist:** `test-agent`
**Dependencies:** Stage 1
**Status:** Pending

- [ ] Add positive and negative integration tests.
- [ ] Run the focused test command and record its result.

## Stage 3: Browser Verification

**Assigned Specialist:** `playwright-generator-agent`
**Dependencies:** Stage 2
**Status:** Pending

- [ ] Verify the manager can save settings in the browser.
- [ ] Verify the restricted profile cannot reach or call the mutation.
- [ ] Record automated, browser, provider, and human gates separately.

## Risks

- A fixture with the wrong role could create false evidence.
- Page-level denial alone would leave the mutation vulnerable to direct calls.
