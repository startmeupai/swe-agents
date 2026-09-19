# Agentic Engineering Reference

This local, sanitized project demonstrates how to organize AI-assisted software
engineering around durable instructions, specialized ownership, reusable
workflows, deterministic checks, evidence, and explicit authority boundaries.
It is a teaching reference, not an application starter or a copy of any product.

> **Publication hold:** The owner must select an open-source license and complete
> the human review checklist before publishing this project.

The repository is suitable for private staging and review. It is not a public
release, a completed curriculum, or a deployable application.

## Purpose and Non-Goals

The project explains a research-to-production operating model that keeps
implementation speed separate from proof. It includes generic patterns for
planning, delivery, browser verification, RBAC, security, CI, and infrastructure.

It intentionally contains no application code, credentials, production
configuration, customer data, private domains, provider accounts, or deployable
cloud resources. The examples are fictional and use `ExampleApp`, `Project
Alpha`, and `example.invalid`.

## System Layers

| Layer | Question | Location |
| --- | --- | --- |
| Instructions | What durable constraints apply? | [`AGENTS.md`](AGENTS.md), [`.github/instructions/`](.github/instructions/) |
| Agents | Who owns the work? | [`.github/agents/`](.github/agents/) |
| Skills | How does the workflow run? | [`.github/skills/`](.github/skills/) |
| Tools | What can inspect or operate systems? | Runtime-specific and intentionally not configured here |
| Scripts | What can be checked deterministically? | [`scripts/checks/`](scripts/checks/) |
| Plans and reports | Where are decisions and evidence preserved? | [`examples/`](examples/) |

Agents describe ownership and boundaries. Skills contain bounded procedures.
Instructions state stable rules. Tools act on systems. Scripts return repeatable
pass/fail results. Plans and reports preserve state beyond a chat session.

## Codex, Claude Code, and GitHub Copilot Setup

Open this directory as its own project so the enclosing checkout's instructions
and configuration are outside the reference project root.

| Tool | Instructions | Native personas | Discoverable skills |
| --- | --- | --- | --- |
| Codex | `AGENTS.md` | `.codex/agents/*.toml` | `.agents/skills/*/SKILL.md` |
| Claude Code | `CLAUDE.md` | `.claude/agents/*.md` | `.claude/skills/*/SKILL.md` |
| GitHub Copilot | `.github/copilot-instructions.md` | `.github/agents/*.agent.md` | `.github/skills/*/SKILL.md` |

The canonical personas and skills live under `.github/`. Run `pnpm sync:setup`
after editing them; it regenerates standalone runtime copies without symlinks.
Run `pnpm check:setup` to detect missing or stale generated files. `pnpm check:all`
includes this check. No account, model, MCP server, credential, deployment target,
or product code is bundled.

Persona examples such as `@research-agent` express routing intent, not a command
syntax shared by every tool. In Codex, ask it to delegate to the named custom
agent; in Claude Code, use `/agents` or ask for the named subagent; in Copilot,
select the custom agent in the agent picker. Availability depends on the client.
For Codex and Claude, explicitly read the relevant `.github/instructions/` files.
Static parity checks do not prove that a tool loaded or invoked an agent; record
those smoke checks separately in the publication checklist.

## Recommended Lifecycle

1. A human states intent, scope, authority, and acceptance criteria.
2. `research-agent` establishes codebase facts with evidence.
3. `planning-agent` produces one staged plan with specialist ownership.
4. `plan-critic-agent` removes blocking design defects before wide writes.
5. `plan-operations-agent` coordinates continuous execution and stage writeback.
6. Specialists implement only the workstreams they own.
7. Deterministic checks prove static, test, policy, and build claims.
8. Independent audit and browser workflows verify plan and runtime behavior.
9. Provider, deployment, human, and production gates remain distinct.
10. Sanitized operational evidence informs the next iteration.

See [agent routing](docs/agent-routing.md), [plan lifecycle](docs/plan-lifecycle.md),
and the [verification model](docs/verification-model.md).

## Conditional Specialist Routing

Use only the specialists required by the task. A browser defect goes to the
investigator, broad browser coverage to the generator, a failing specification
to the healer, RBAC to the RBAC owner, and infrastructure to its infrastructure
owner. Do not force every change through an identical agent chain.

## Shared-Checkout Write Safety

Assume other people or agents may share the checkout and Git index. Assign
disjoint write ownership, inspect existing changes, edit only authorized files,
and never revert, stash, stage, commit, or publish another worker's changes.
Read-only research can run in parallel; overlapping contract changes should be
serialized.

## Deterministic Verification

Use the exact Node.js version in [`.nvmrc`](.nvmrc). The package pins pnpm and
commits its lockfile; every check itself uses only Node.js standard-library APIs.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm check:setup
pnpm check:agents
pnpm check:skills
pnpm check:references
pnpm check:sanitization
pnpm lint:markdown
pnpm check:all
```

Each command proves only its named layer. A green static check does not prove a
browser journey, provider action, deployment, or human approval.

The workflow in [`.github/workflows/reference-checks.yml`](.github/workflows/reference-checks.yml)
runs the frozen install and full check suite on Linux and Windows. The workflow
file is not evidence that either hosted job has run; the publication checklist
keeps that gate open until GitHub records both results.

## Browser Evidence Example

The tracked browser manifest is a schema-validated template, not runtime proof.
Its status is `not-collected`, each step is `not-run`, and it references no
screenshots. A collected evidence manifest must include timestamps, observations,
console/network notes, mutation disclosures, and existing non-empty PNG files.
The deterministic browser-evidence check rejects missing or duplicate artifacts
and prevents templates from claiming a pass.

## Provenance and Repository Operations

[`PROVENANCE.json`](PROVENANCE.json) records the private source base revision and
explicitly avoids claiming a clean worktree or byte-for-byte ancestry.
[`SOURCE_MAP.md`](SOURCE_MAP.md) records artifact-level derivation. Neither file
contains a local filesystem path.

Contribution, security, ownership, and release expectations are documented in
[`CONTRIBUTING.md`](CONTRIBUTING.md), [`SECURITY.md`](SECURITY.md), the
[comment-only CODEOWNERS template](.github/CODEOWNERS), and
[`docs/releases-and-versioning.md`](docs/releases-and-versioning.md). Actual
owners, a private reporting contact, licensing, CI results, and publication
approval remain open human gates.

## Least Privilege

Give an agent only the read/write scope, environment, resource, and duration it
needs. Prefer read-only credentials. Re-authorize mutations at apply time.
Never let model output directly authorize writes, tool calls, or tenant access.
Production-impacting and destructive actions require explicit authority.

## Adapting This Reference

1. Replace the fictional directory conventions with the destination repository's.
2. Keep the instruction/agent/skill separation intact.
3. Remove personas and skills that have no real owner or workflow.
4. Add repository-specific deterministic checks before adding prose rules.
5. Define plan/report directories and lifecycle transitions explicitly.
6. Add access profiles without embedding credentials or personal information.
7. Update [`SOURCE_MAP.md`](SOURCE_MAP.md) for every adapted artifact.
8. Run all checks and complete [`REVIEW_CHECKLIST.md`](REVIEW_CHECKLIST.md).

## Human Review Before Publication

The owner must verify technical accuracy, sanitization, naming, trigger quality,
script portability, cross-platform runtime behavior, examples, and licensing.
The authoritative open list is [`REVIEW_CHECKLIST.md`](REVIEW_CHECKLIST.md).

## Further Reading

- [Architecture](docs/architecture.md)
- [Agent routing](docs/agent-routing.md)
- [Plan lifecycle](docs/plan-lifecycle.md)
- [Verification model](docs/verification-model.md)
- [Security boundaries](docs/security-boundaries.md)
- [Workshop example](docs/workshop-example.md)
- [Source map](SOURCE_MAP.md)
