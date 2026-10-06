---
name: python-feature-implementation
description: Deliver a scoped Python feature with typed boundaries, validated input, explicit layers, and pytest proof.
---

# Python Feature Implementation

## Trigger Conditions

Use for accepted behavior implemented in Python, such as services, API endpoints, background jobs,
CLI commands, or library APIs, in whichever framework the project already uses.

## Required Inputs

- Acceptance criteria, target packages and layers, data contracts, and authorization policy.
- `pyproject.toml`, the lock file, and the project's ruff, mypy, and pytest configuration.

## Workflow

1. Read `pyproject.toml`, the lock file, and tool configuration to establish the `requires-python`
   floor, framework, validation library, and configured strictness; reuse existing modules and
   patterns before adding abstractions.
2. Define boundary types first: a pydantic model or validated dataclass for each untrusted input,
   frozen dataclasses or existing domain models for internal values, `typing.Protocol` for
   collaborators, and specific exception classes for expected failures.
3. Implement persistence behind the project's data-access boundary, such as a repository module or
   the ORM's managers where that is the convention, with sessions and transactions owned by context
   managers. Generate schema migrations with the project's tool, such as Alembic or Django
   migrations, without applying them to shared databases.
4. Implement services as functions or classes that receive dependencies as parameters, authorize
   against the resource scope, and return domain values; stream large results with generators.
5. Wire transport through the framework's own mechanism (FastAPI dependencies and response models,
   Django views with forms or serializers, Flask blueprints, or a CLI entry point declared in
   `pyproject.toml`) and map domain exceptions to typed, sanitized responses.
6. Keep async paths non-blocking with async drivers and clients end to end; offload unavoidable
   blocking calls with `asyncio.to_thread` and group concurrent work in `asyncio.TaskGroup` or the
   project's existing task-group API.
7. Declare `__all__` on new public modules, add dependencies through the package manager (for
   example `uv add`) so `pyproject.toml` and the lock file change together, and update docs.
8. Add pytest coverage for success, boundary, invalid-input, and denied-access cases with the
   `python-testing` skill.
9. Run the pack's lint (`ruff check .`), format (`ruff format --check .`), typecheck (`mypy .`),
   and test (`pytest -q`) commands, focused tests first, and report evidence by layer.

## Deterministic Checks

- Lint, format check, typecheck, focused pytest node IDs, then the pack's full test command.
- Lock file consistency when dependencies changed (for example `uv lock --locked`).
- The diff adds no unscoped `# type: ignore`, bare `except`, mutable default argument, or blocking
  call in an async path.

## Safety and Permission Boundaries

- Never trust client-, tool-, or model-supplied identifiers without scope checks, and never log
  secrets or personal data.
- Never use `eval`, `exec`, unsafe deserialization, or `shell=True` with interpolated input.
- Do not apply migrations, call live providers, or mutate external systems without explicit authority.

## Required Evidence

- Changed files, boundary types added, commands with results, test node IDs with the cases they
  cover, migrations generated, and gates left unverified.

## Completion Condition

- Acceptance criteria are implemented, every locally executable pack command passes, and provider,
  deployment, and browser gates are proven or named as open.

## Example

`Add an owner-only Project Alpha export endpoint to the ExampleApp FastAPI service.`
