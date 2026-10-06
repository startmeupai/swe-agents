# Browser Verification Rules

Apply these rules to browser specifications, browser verification runs, and
browser evidence.

- Use accessible selectors: role, label, and visible text first, then stable
  test IDs; avoid selectors tied to layout or styling.
- Clean up explicitly: every spec restores the state it mutates and never
  depends on another spec's leftovers.
- Wait for observable application state; browser specs contain no arbitrary
  sleeps and no wall-clock timing thresholds.
- Name the access profile for every browser run and resolve its credentials
  from the environment; never hardcode or substitute a profile.
- A skipped, missing, or unconfigured profile is not a pass; report it as not
  tested.
- Authorization behavior needs both an allowed-profile case and a
  denied-profile case, including direct navigation to the protected route.
- Run browser writes only against non-production environments.
- A `template` evidence manifest stays `not-collected`, with every step
  `not-run` and no artifact, observation, or note; only an `evidence` manifest
  marked `collected` records `pass` or `fail`, with a redacted artifact,
  observation, console/network note, and mutation disclosure for every step.
- Redact personal data, tokens, and signed URLs before evidence is tracked or
  shared.
- Keep browser, provider, deployment, and human gates distinct: a browser pass
  does not prove provider configuration, deployment, or human acceptance.
- Close a gate only from a fresh observed pass with the correct profile; label
  evidence from another environment or an older run as such.
