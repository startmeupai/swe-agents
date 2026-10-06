---
name: typescript-testing
description: Write deterministic, type-checked TypeScript unit, component, and integration tests with typed fixtures and fakes.
---

# TypeScript Testing

## Trigger Conditions

Use when TypeScript behavior needs unit, component, integration, or contract
coverage with a Vitest- or Jest-style runner. Load it with `test-generation`,
which chooses the test layer. Browser journeys belong to the installed
verification pack.

## Required Inputs

- The behavior contract and the module under test.
- The existing runner (Vitest or Jest), its configuration, setup files, and
  test file conventions.
- The domain and boundary types, schemas, and ports the module depends on.
- The pack's test (`pnpm test`) and typecheck (`pnpm typecheck`) commands, and
  whether the typecheck program includes test files.

## Workflow

1. Use the project's existing runner, assertion style, and file layout; add no
   second runner or assertion library.
2. Derive cases from the types: one per discriminated-union variant, each
   boundary rejection of malformed `unknown` input, each error branch, and both
   allowed and denied authorization paths. Use `it.each` over variant tables.
3. Build typed fixtures: factory functions that return a complete domain value
   and accept typed overrides, or literals checked with `satisfies`. Never use
   `as any` or `as unknown as` to make a fixture fit.
4. Replace dependencies with typed fakes that implement the real port
   interface, or with typed mock functions such as `vi.fn<...>()`,
   `jest.fn<...>()`, or `vi.mocked(...)`. Fake at stable boundaries, not
   internal helpers.
5. Control time and randomness: fake timers advanced explicitly, a fixed clock,
   and seeded or injected identifier generation. Await the operation or use the
   runner's polling helper instead of sleeping.
6. For components, query by role and accessible name, drive input with
   user-event-style helpers, and assert loading, empty, error, disabled, and
   success states.
7. Assert compile-time contracts where they matter, with `expectTypeOf` or a
   `@ts-expect-error` line proving that an invalid call does not compile.
8. Restore mocks, timers, environment variables, and module state in
   `afterEach`. Run the focused file, then the pack's test and typecheck
   commands, then repeat the focused run in shuffled order.

Reference shape for steps 3 to 5 (Vitest shown; Jest equivalents use `jest`):

```typescript
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Invitation, InvitationStore } from '../src/invitations/types'
import { expireInvitations } from '../src/invitations/expire'

function buildInvitation(overrides: Partial<Invitation> = {}): Invitation {
  return {
    id: 'inv-1',
    projectId: 'project-alpha',
    status: 'pending',
    expiresAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides
  }
}

function fakeStore(invitations: readonly Invitation[]) {
  const markExpired = vi.fn<InvitationStore['markExpired']>(async () => undefined)
  const store: InvitationStore = {
    listPending: async () => [...invitations],
    markExpired
  }
  return { store, markExpired }
}

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('expireInvitations', () => {
  it('expires only invitations past their deadline', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-02T00:00:00Z'))
    const { store, markExpired } = fakeStore([
      buildInvitation(),
      buildInvitation({ id: 'inv-2', expiresAt: new Date('2026-02-01T00:00:00Z') })
    ])

    await expireInvitations(store)

    expect(markExpired).toHaveBeenCalledTimes(1)
    expect(markExpired).toHaveBeenCalledWith('inv-1')
  })
})
```

## Deterministic Checks

- The pack's test command scoped to the changed file (for example
  `pnpm test <file>`) passes, then the full `pnpm test` run passes.
- The pack's typecheck command (`pnpm typecheck`) passes with test files in the
  checked program.
- A shuffled repeat of the focused run passes (`--sequence.shuffle` in Vitest,
  `--randomize` in Jest).
- The diff adds no fixed-delay sleeps, `.only`, unexplained `.skip`, or
  `as any` casts in test code.

## Safety and Permission Boundaries

- Never call live providers or networks, use real credentials, or read
  production data from a test.
- Do not weaken assertions, delete failing cases, or change production code
  only to make a test pass.
- Do not accept snapshot updates without reviewing each diff.

## Required Evidence

- Test names mapped to the derived cases, the commands run, and pass, fail, and
  skip counts.
- The typecheck result and the shuffled repeat result.
- Unrelated or pre-existing failures named separately from new ones.

## Completion Condition

- Every derived case has a passing deterministic test that would fail if the
  behavior regressed, and the test files typecheck.

## Example

`Add Vitest coverage for every Project Alpha invitation status, including malformed payload rejection.`
