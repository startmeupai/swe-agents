# Python Pack

Language rules, a feature owner, a test owner, and two skills for Python
codebases built on uv, ruff, mypy, and pytest.

## Scope

- Kind: `language`. Requires no other pack and conflicts with none.
- Covers Python services, APIs, background jobs, CLIs, and libraries: typed
  boundaries, input validation, layering, async discipline, packaging, and
  pytest coverage.
- Framework-neutral: the rules and personas follow whatever the project
  already uses (FastAPI, Django, Flask, or no framework) instead of
  prescribing one.
- Does not cover browser verification, container images, database platforms,
  or CI workflows; those belong to other packs or core personas.

## What It Adds

| Type | Name | Purpose |
| --- | --- | --- |
| Rules | [`AGENTS.md`](AGENTS.md) | Python rules merged into the target `AGENTS.md` |
| Persona | [`python-feature-agent`](agents/python-feature-agent.md) | Typed, validated, authorized Python feature delivery |
| Persona | [`python-test-agent`](agents/python-test-agent.md) | Deterministic pytest unit, integration, and property coverage |
| Skill | [`python-feature-implementation`](skills/python-feature-implementation/SKILL.md) | Layered feature workflow from boundary types to evidence |
| Skill | [`python-testing`](skills/python-testing/SKILL.md) | pytest workflow with fixtures, parametrization, and isolation |

Routes declared in [`pack.json`](pack.json):

| Outcome | Owner | Related skills |
| --- | --- | --- |
| Build Python behavior | `python-feature-agent` | `python-feature-implementation`, `test-generation` |
| Create Python tests | `python-test-agent` | `python-testing`, `test-generation` |

The personas also load the core `test-generation` and `rbac-integration`
skills. The core `feature-agent` coordinates features that span Python and
another stack and hands the Python slice to `python-feature-agent`.

## Prerequisites

- Python 3.11 or newer, declared in `pyproject.toml` as `requires-python`.
  The guidance relies on 3.11 features such as `asyncio.TaskGroup`.
- uv with a committed `uv.lock` (the default), or pip or Poetry with an
  equivalent lock file.
- ruff, mypy, and pytest declared as development dependencies and configured
  in `pyproject.toml`.
- Optional pytest plugins and libraries are used only when the project
  already depends on them: pytest-asyncio or anyio, pytest-django,
  pytest-cov, pytest-randomly, and hypothesis.

The installer can suggest this pack when a target repository contains
`pyproject.toml` or any `*.py` file.

## Commands

| Key | Default | Use |
| --- | --- | --- |
| `install` | `uv sync --frozen` | Install exactly the locked dependencies |
| `lint` | `ruff check .` | Lint sources and tests |
| `format` | `ruff format --check .` | Verify formatting without rewriting files |
| `typecheck` | `mypy .` | Static type checking |
| `test` | `pytest -q` | Run the test suite |

The defaults assume the project virtual environment is active. Without
activation, run each tool through uv, for example `uv run pytest -q`.

### Adjusting Commands

Rules, personas, and skills name each command by role, such as "the pack's
test command", with the default in parentheses, so a project with other tools
changes only the commands.

- pip: install from a hashed lock file with
  `pip install --require-hashes -r requirements.txt`.
- Poetry: install with `poetry sync` (Poetry 2) and prefix tools with
  `poetry run`.
- Another type checker or runner: replace `typecheck` or `test` and keep the
  same evidence expectations.

To change the defaults for every installation, edit `commands` in a fork of
this pack's `pack.json` and bump its version. To change them for one target
repository, edit the pack-command rule in the Python section of that
repository's `AGENTS.md`. The installer's lock file records that edit, and a
later install refuses to overwrite it unless run with `--force`.

## Combining With Other Packs

- `docker`: `docker-agent` owns Dockerfiles, compose files, and image builds;
  the Python personas hand containerization to it. Install the image's
  dependencies from the same lock file so local, CI, and container
  environments match. The `python-api-docker` profile combines `python` and
  `docker`.
- `supabase`: `supabase-agent` owns migrations, row-level security, edge
  functions, and auth configuration; the Python personas hand schema and
  policy changes to it. Python code acting for a user calls Supabase with
  that user's session so row-level security applies; service-role keys stay
  in trusted server jobs and out of logs.
- Browser verification packs: when one is installed, the Python personas
  hand browser journeys to its owner; otherwise browser gates stay open.
- Core personas keep their roles: `rbac-agent` owns authorization semantics,
  `github-actions-agent` owns CI that runs the pack commands, and
  `security-auditor-agent` provides independent review.

Example installations into another repository:

```bash
node scripts/stacks/install.mjs --target ../example-app --profile python-api-docker --dry-run
node scripts/stacks/install.mjs --target ../example-app --packs python,supabase --dry-run
```

## Changelog

### 0.1.0

- Initial pack: Python rules, `python-feature-agent`, `python-test-agent`,
  `python-feature-implementation`, and `python-testing`.
- Default commands use uv, ruff, mypy, and pytest; routes cover building
  Python behavior and creating Python tests.
