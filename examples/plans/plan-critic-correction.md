# Plan-Critic Finding and Correction

## Finding

| ID | Severity | Issue | Correction |
| --- | --- | --- | --- |
| H1 | High | The draft tested only the allowed manager path and could miss direct-call authorization bypass. | Add a restricted-profile integration assertion and browser/direct-call denial gate. |

## Corrected Task

- [ ] Verify the restricted profile is denied by both the UI entry point and the
  mutation when invoked directly.

## Readiness Verdict

Ready after correction: zero unresolved Critical or High findings.
