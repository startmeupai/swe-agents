# Architecture

The reference separates durable knowledge by responsibility, and separates what
it ships from how a repository receives it.

```text
core/ (stack-neutral)  +  stacks/<pack>/ (suggested by detection, chosen by a profile or --packs)
  -> swe-agents CLI (scripts/stacks/cli.mjs): init, install, update
  -> target AGENTS.md, per-client persona and skill copies, lock file
  -> swe-agents contribute: bundle of patches and new files
  -> pull request to the test branch, promoted to main by a maintainer

human intent
  -> repository rules (core rules plus one section per installed pack)
  -> persona ownership (core or pack)
  -> skill workflow
  -> tools and local scripts
  -> plans, reports, handoffs, and evidence
```

The core holds the process personas, skills, and rules that apply to any
repository; it never names a pack. A stack pack adds the owners, skills, rules,
and commands for one language, framework, platform, or verification stack. A
profile names a combination of packs. The installer copies the core and the
selected packs into each client's discovery paths and records what it wrote in
a lock file. See [stack packs](stack-packs.md) for the contract.

The loop runs in both directions. `update` reinstalls the locked selection
from the locked source and merges local edits three ways, so an adopting
repository keeps its changes and still receives upstream fixes. `contribute`
maps those edits, and new personas and skills, back onto canonical paths as a
sanitized bundle. The core `upstream-agent` drives both and owns the only
outward-facing steps, a fork, a push, and a pull request, each behind a human
gate.

Rules constrain all work in their scope. Personas define the owner, inputs,
outputs, boundaries, and handoff. Skills define a bounded workflow. Scripts
verify structure and policy without model judgment. Plans preserve execution
state, while reports and evidence preserve findings and observations.

No layer should impersonate another: a persona is not a runbook, a skill is not
an authority grant, a pack is not a product or an application starter, a
profile is not an authority grant, an installed pack is not proof that its
commands pass, a contribution bundle is not an approved change, a script is
not browser evidence, and a plan checkbox is not proof unless its exact
condition has been satisfied.
