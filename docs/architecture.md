# Architecture

The reference separates durable knowledge by responsibility, and separates what
it ships from how a repository receives it.

```text
core/ (stack-neutral)  +  stacks/<pack>/ (chosen by a profile or --packs)
  -> installer (scripts/stacks/install.mjs)
  -> target AGENTS.md, per-client persona and skill copies, lock file

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

Rules constrain all work in their scope. Personas define the owner, inputs,
outputs, boundaries, and handoff. Skills define a bounded workflow. Scripts
verify structure and policy without model judgment. Plans preserve execution
state, while reports and evidence preserve findings and observations.

No layer should impersonate another: a persona is not a runbook, a skill is not
an authority grant, a pack is not a product or an application starter, a
profile is not an authority grant, an installed pack is not proof that its
commands pass, a script is not browser evidence, and a plan checkbox is not
proof unless its exact condition has been satisfied.
