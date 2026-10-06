---
name: typescript-feature-implementation
description: Implement TypeScript behavior with strict types, schema-validated boundaries, and exhaustive domain models.
---

# TypeScript Feature Implementation

## Trigger Conditions

Use when accepted behavior is implemented in TypeScript and its type contract,
boundary validation, error model, or module structure is part of the change.
Load it with `feature-implementation`, which sequences the layers.

## Required Inputs

- Acceptance criteria and the affected modules.
- Existing domain, boundary, and error types, and the module that defines each.
- The effective `tsconfig` options, the module system, and the schema
  validation library the project already uses.
- The pack's lint (`pnpm lint`), typecheck (`pnpm typecheck`), and test
  (`pnpm test`) commands.

## Workflow

1. Read the effective `tsconfig` and nearby code. Confirm `strict` is on and
   note flags that change how code is written, such as
   `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
   `verbatimModuleSyntax`, and the `moduleResolution` mode.
2. Model the domain before implementing it. Express states as discriminated
   unions on a literal `kind`, `status`, or similar field instead of boolean
   flags and optional fields that allow impossible combinations. Brand
   identifiers that must not be interchanged, and mark inputs `readonly`.
3. Type every boundary input as `unknown`: request bodies, route and query
   parameters, environment variables, storage rows, queue messages, and
   third-party responses. Parse it with the project's schema library, derive
   the static type from the schema so the two cannot drift, and reject invalid
   input before business logic runs.
4. Implement business logic against domain types only. Handle every union
   variant in an exhaustive `switch` whose `default` branch assigns the value to
   `never`, so a new variant fails the typecheck.
5. Use `satisfies` for configuration objects and lookup tables, such as a
   `Record` keyed by a union, to check their shape while keeping literal types.
   Use `as const` for fixed literal sets instead of widening them.
6. Keep imports clean: import from the definitive module, use `import type` for
   type-only imports, follow the extension style the module resolution
   requires (for example `.js` suffixes on relative imports under `NodeNext`),
   add no pass-through barrel files, and introduce no import cycles.
7. Model expected failures as typed result unions or typed error classes.
   Narrow `catch (error: unknown)` before use, return sanitized messages at
   external boundaries, and keep internal detail in server-side logs.
8. Run the pack's typecheck, lint, and test commands, and fix the cause of each
   error instead of suppressing it.

Reference shape for steps 2 to 5 (Zod shown; use the project's schema library):

```typescript
import { z } from 'zod'

const deliverySchema = z.discriminatedUnion('channel', [
  z.object({ channel: z.literal('email'), address: z.string() }),
  z.object({ channel: z.literal('webhook'), url: z.string() }),
  z.object({ channel: z.literal('none') })
])
export type Delivery = z.infer<typeof deliverySchema>

export const channelLabels = {
  email: 'Email',
  webhook: 'Webhook',
  none: 'Off'
} as const satisfies Record<Delivery['channel'], string>

export type DeliveryParse =
  | { ok: true; value: Delivery }
  | { ok: false; reason: 'invalid-delivery' }

export function parseDelivery(input: unknown): DeliveryParse {
  const result = deliverySchema.safeParse(input)
  return result.success ? { ok: true, value: result.data } : { ok: false, reason: 'invalid-delivery' }
}

export function describeDelivery(delivery: Delivery): string {
  switch (delivery.channel) {
    case 'email':
      return `Email to ${delivery.address}`
    case 'webhook':
      return `Webhook to ${delivery.url}`
    case 'none':
      return 'Notifications off'
    default: {
      const unhandled: never = delivery
      throw new Error(`Unhandled delivery: ${JSON.stringify(unhandled)}`)
    }
  }
}
```

## Deterministic Checks

- The pack's typecheck command (`pnpm typecheck`) passes, with test files
  included in the checked program.
- The pack's lint command (`pnpm lint`) passes without new disable comments.
- The pack's test command (`pnpm test`) passes for the focused suites.
- The diff adds no `any`, `@ts-ignore`, `@ts-nocheck`, `as unknown as`, or
  lint-disable comment. Review every line this scan prints; add the base
  revision to the diff for committed work:

```bash
git diff --unified=0 -- '*.ts' '*.tsx' '*.mts' '*.cts' | grep -nE '^\+.*(:[[:space:]]*any\b|\bas any\b|<any>|\bany\[\]|@ts-(ignore|nocheck)|as unknown as|eslint-disable)'
```

## Safety and Permission Boundaries

- Never trust client- or model-supplied identifiers; parse them, then authorize
  access to the resource they name.
- Do not loosen compiler or lint settings, add ambient declarations to silence
  errors, or hand-edit generated type files.
- Do not add a dependency, such as a second schema library, without accepted
  scope.
- Do not echo raw validation or provider errors to clients.

## Required Evidence

- Changed files and the boundary, domain, and error types each one introduces.
- Typecheck, lint, and test command output with pass, fail, and skip counts.
- The suppression scan result, with the reason for any remaining exception.
- Browser, provider, and deployment layers named as unverified unless they ran.

## Completion Condition

- Acceptance criteria are implemented, every boundary parses `unknown` input,
  union handling is exhaustive, no unexplained suppression remains, and the
  pack's typecheck, lint, and test commands pass.

## Example

`Add a validated Project Alpha notification-preferences update with a discriminated delivery-channel union.`
