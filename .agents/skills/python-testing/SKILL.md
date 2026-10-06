---
name: python-testing
description: Create deterministic pytest unit, integration, and property tests with fixtures, parametrization, and isolated side effects.
---

# Python Testing

## Trigger Conditions

Use when Python behavior needs focused automated coverage below the browser layer, or when a
pytest suite is flaky, order-dependent, or slow.

## Required Inputs

- Target behavior, code under test, and its success, boundary, failure, and authorization cases.
- pytest configuration, registered markers, existing `conftest.py` fixtures, and installed plugins.

## Workflow

1. Inspect `[tool.pytest.ini_options]` or `pytest.ini`, registered markers, `conftest.py` fixtures,
   and installed plugins and libraries such as pytest-asyncio or anyio, pytest-django, pytest-cov,
   pytest-randomly, and hypothesis before writing tests.
2. Choose the narrowest layer: plain unit tests for domain functions, service tests with fakes that
   satisfy the collaborator's `Protocol`, and integration tests through the framework's test client
   (FastAPI `TestClient` with `dependency_overrides`, pytest-django's `client` and `db` fixtures or
   Django `TestCase`, or Flask `test_client`).
3. Express case tables with `pytest.mark.parametrize` and readable `ids`, covering success,
   boundary, invalid-input, and denied-access cases; assert failures with
   `pytest.raises(SomeError, match=...)`.
4. Build setup from the narrowest-scoped fixtures, `yield` fixtures for teardown, and factory
   fixtures for variations; place shared fixtures in the nearest `conftest.py`.
5. Isolate side effects: `monkeypatch` for environment and attributes, `tmp_path` for files,
   `caplog` for log assertions, injected or frozen clocks, seeded `random.Random` instances, and
   fakes or `unittest.mock.create_autospec` at stable boundaries instead of patching internals.
6. When hypothesis is already a dependency, add property tests for invariants such as round trips,
   idempotence, and ordering with bounded strategies; do not add it without approval.
7. For async code, use the project's configured async plugin and await every task; never wait for
   state with `time.sleep` or `asyncio.sleep`.
8. Run the focused node IDs (for example `pytest -q tests/test_export.py::test_denies_non_owner`),
   then the pack's test command (`pytest -q`), and the lint (`ruff check .`) and typecheck
   (`mypy .`) commands when tests are in their scope.
9. Re-run the new tests, with a different `--randomly-seed` when pytest-randomly is installed, to
   confirm order independence; report coverage of changed modules when coverage is configured.

## Deterministic Checks

- Focused and full pytest results with pass, fail, skip, and xfail counts.
- Repeated runs give the same outcome, and every marker used is registered.
- Lint and typecheck pass for test code wherever the project configures them to cover tests.

## Safety and Permission Boundaries

- Do not call live networks or providers, use real credentials, or touch shared databases.
- Do not weaken assertions, add `skip` or `xfail` to pass, lower coverage thresholds, or change
  production logic to make a test pass.

## Required Evidence

- Test node IDs, commands, pass, fail, skip, and xfail counts, seeds used, coverage figures when
  configured, and unrelated failures.

## Completion Condition

- Required cases pass deterministically across repeated runs and would fail if the behavior
  regressed.

## Example

`Add parametrized denied-access tests for the ExampleApp Project Alpha export service.`
