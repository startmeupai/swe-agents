# Python Rules

Apply these rules to Python sources, tests, and packaging files (`**/*.py`, `pyproject.toml`).

- Target the `requires-python` range in `pyproject.toml`; do not use newer syntax or standard-library APIs.
- Declare dependencies, tool settings, and entry points in `pyproject.toml`; do not add `setup.py`
  or ad hoc requirements files unless the project already uses them.
- Pin dependencies in the committed lock file, change them through the package manager (`uv add`),
  never by hand-editing the lock, and run tools inside the project virtual environment (`uv run` or
  an activated `.venv`), never the system interpreter.
- Annotate every public function, method, and class attribute. Keep `mypy` passing at the configured
  strictness (`strict = true` for new packages; at least `disallow_untyped_defs`,
  `warn_unused_ignores`, and `warn_return_any` elsewhere) and never relax it to land a change.
- Treat `Any`, `cast`, and `# type: ignore` as exceptions; scope each ignore to an error code and say why.
- Validate untrusted input (requests, files, environment, messages, model output) at the boundary
  with the project's validation library, such as pydantic models or validated dataclasses, before
  treating it as a domain value.
- Keep transport, business logic, and persistence in separate modules; pass collaborators
  (sessions, clients, clocks, settings) as parameters instead of importing global singletons.
- Raise specific exception types chained with `raise ... from err`; never use bare `except:` or
  silently swallow `Exception`.
- Map internal exceptions to typed, sanitized API errors; never return tracebacks, queries, or secrets.
- Never use mutable default arguments; default to `None` or `dataclasses.field(default_factory=...)`.
- Use `pathlib.Path` for paths, an explicit `encoding` for text files, and context managers for
  files, connections, sessions, and locks.
- Keep `async` paths non-blocking: no `time.sleep`, blocking clients, or synchronous file and
  database I/O. Offload unavoidable blocking work with `asyncio.to_thread` and own concurrent tasks
  through `asyncio.TaskGroup` or the framework's task API.
- Log through `logging.getLogger(__name__)`, not `print`; never log secrets, tokens, or personal data.
- Do not use `eval`, `exec`, `pickle`, or unsafe `yaml.load` on untrusted data, or `subprocess`
  with `shell=True` on interpolated input.
- Declare a library package's public surface with `__all__`; import internal names from their
  defining module.
- Follow the framework conventions the project already uses (FastAPI, Django, Flask, or none).
- Write tests with pytest fixtures, `parametrize`, `monkeypatch`, and `tmp_path`; keep them
  deterministic with no sleeps, no live network, injected clocks, and fixed random seeds.
- Where Python personas and skills name a pack command, use the default below or the project's
  replacement recorded here: install (`uv sync --frozen`; pip or Poetry projects use their
  lock-respecting equivalent), lint (`ruff check .`), format (`ruff format --check .`), typecheck
  (`mypy .`), and test (`pytest -q`). Report each result separately.
