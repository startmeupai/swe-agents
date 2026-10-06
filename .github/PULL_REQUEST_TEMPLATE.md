# Summary

<!-- Explain the problem and the focused change that solves it. -->

Origin: <!-- fork | adopter repository (sanitized) -->

Pack(s) affected: <!-- name each stack pack, or write "none" -->

## Verification

<!-- List only checks that actually ran, with their results. -->

- [ ] `pnpm check:all`
- [ ] Ran `pnpm check:stacks`
- [ ] Canonical `core/` or `stacks/` changes were regenerated with
      `pnpm sync:setup`
- [ ] Each changed pack has a version bump and a changelog entry
- [ ] `SOURCE_MAP.md` covers every added, removed, or renamed artifact
- [ ] Runtime, provider, browser, deployment, and human checks are identified as
      run or not run

## Safety and Scope

- [ ] The pull request targets the `test` branch
- [ ] No credentials, customer data, private domains, or proprietary code were
      added
- [ ] The change is portable and does not assume a specific product repository
- [ ] Core files do not name a stack pack, pack persona, pack skill, or pack
      command
- [ ] Security-sensitive details were reported privately instead of included
      here

## Remaining Limitations

<!-- State anything that still needs verification or a maintainer decision. -->
