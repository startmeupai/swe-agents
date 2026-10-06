#!/usr/bin/env node
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { createInterface } from 'node:readline/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { SourceError, findCheckout, findLayoutRoot, resolveSource } from './source.mjs'

// The `swe-agents` command. It resolves a source checkout (this clone, or a
// cached clone under `npx`), imports the installer modules from that checkout,
// and runs one command against a target repository.

const here = dirname(fileURLToPath(import.meta.url))
const packageRoot = findLayoutRoot(here) ?? resolve(here, '../..')
const lockFile = '.agents/stacks.lock.json'
const npxCommand = 'npx --yes github:startmeupai/swe-agents'

const usage = `Usage: swe-agents <command> [options]

  swe-agents init       [--target <dir>] [--packs a,b | --profile <name>] [--yes] [--dry-run] [--ref <git-ref>]
  swe-agents detect     [--target <dir>] [--json]
  swe-agents install    --target <dir> (--profile <name> | --packs a,b) [--dry-run] [--force]
  swe-agents update     [--target <dir>] [--dry-run] [--force] [--no-merge] [--ref <git-ref>]
  swe-agents contribute [--target <dir>] [--slug <name>] [--base <branch>] [--apply] [--dry-run]
  swe-agents --help | --version

Commands:
  init        Detect packs, show the suggestion and the plan, confirm, install,
              and print next steps.
  detect      List the packs whose detect patterns match the target.
  install     Install a profile or pack list (same as scripts/stacks/install.mjs).
  update      Reinstall the locked profile or pack list from the lock's source
              and ref, three-way merging files edited since the last install.
  contribute  Bundle local persona and skill improvements for upstream review.

Options:
  --target <dir>     Adopting repository. Defaults to the current directory
                     unless that is a swe-agents checkout; install requires it.
  --profile <name>   Install profiles/<name>.json; init skips detection.
  --packs a,b        Install these packs and the packs they require; init
                     skips detection.
  --yes              init: install without asking.
  --dry-run          Print the plan; write nothing.
  --force            install, update: overwrite edited, unowned, and
                     conflicting files; remove edited files no longer installed.
  --no-merge         update: keep edited files as they are instead of merging.
  --ref <git-ref>    init, update: source branch, tag, or commit for the cached
                     clone; update defaults to the lock's source.ref, then main.
  --json             detect: print { "packs": [...] } as JSON.
  --slug <name>      contribute: bundle name.
  --base <branch>    contribute: upstream branch for --apply (default test).
  --apply            contribute: create contrib/<slug> in the source checkout
                     and apply the bundle there.

Source: run inside a swe-agents clone, the CLI uses that clone as it is.
Otherwise it uses $SWE_AGENTS_HOME/source (default .swe-agents/source in the
home directory), cloned from https://github.com/startmeupai/swe-agents or from
SWE_AGENTS_REPO when set; init and update fetch and fast-forward it.

Exit codes: 0 success, 1 error, 2 a human decision is needed or nothing was done.`

const commands = {
  init: { values: ['target', 'packs', 'profile', 'ref'], flags: ['yes', 'dry-run'] },
  detect: { values: ['target'], flags: ['json'] },
  install: { values: ['target', 'packs', 'profile'], flags: ['dry-run', 'force'] },
  update: { values: ['target', 'ref'], flags: ['dry-run', 'force', 'no-merge'] },
  contribute: { values: ['target', 'slug', 'base'], flags: ['apply', 'dry-run'] }
}

class UsageError extends Error {}

const camel = name => name.replace(/-([a-z])/g, (all, letter) => letter.toUpperCase())

function parseOptions(command, argv) {
  const spec = commands[command]
  const options = { help: false }
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--') continue
    if (argument === '--help' || argument === '-h') {
      options.help = true
      continue
    }
    if (!argument.startsWith('--')) throw new UsageError(`Unexpected argument ${argument}`)
    const inline = argument.indexOf('=')
    const name = argument.slice(2, inline === -1 ? undefined : inline)
    if (spec.flags.includes(name)) {
      if (inline !== -1) throw new UsageError(`--${name} takes no value`)
      options[camel(name)] = true
    } else if (spec.values.includes(name)) {
      let value
      if (inline !== -1) value = argument.slice(inline + 1)
      else {
        value = argv[index + 1]
        index += 1
      }
      if (value === undefined || value.startsWith('--') || !value.trim()) throw new UsageError(`--${name} needs a value`)
      options[camel(name)] = value
    } else throw new UsageError(`Unknown option ${argument} for ${command}`)
  }
  if (options.packs !== undefined && options.profile !== undefined) throw new UsageError('Use either --profile or --packs, not both')
  return options
}

function packageVersion() {
  try {
    return JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8')).version ?? 'unknown'
  } catch {
    return 'unknown'
  }
}

function samePath(left, right) {
  try {
    return realpathSync(left) === realpathSync(right)
  } catch {
    return false
  }
}

function isSweAgentsCheckout(directory) {
  return ['core', 'stacks', 'profiles'].every(entry => existsSync(join(directory, entry))) &&
    existsSync(join(directory, 'scripts/stacks/engine.mjs'))
}

// pnpm runs scripts from the package root; INIT_CWD keeps paths relative to the caller.
function resolveTarget(options, { required = false } = {}) {
  const caller = resolve(process.env.INIT_CWD ?? process.cwd())
  let target
  let label
  if (options.target) {
    target = resolve(caller, options.target)
    label = options.target
  } else {
    if (required) throw new UsageError('--target is required')
    if (samePath(caller, packageRoot) || isSweAgentsCheckout(caller)) {
      throw new UsageError('--target is required when running inside the swe-agents checkout')
    }
    target = caller
    label = caller
  }
  if (!existsSync(target) || !statSync(target).isDirectory()) throw new UsageError(`Target ${label} is not an existing directory`)
  return { target, label }
}

function printNotes(source) {
  for (const note of source.notes ?? []) console.error(`Note: ${note}`)
}

async function importFromSource(source, relative) {
  const path = join(source.dir, ...relative.split('/'))
  if (!existsSync(path)) {
    throw new SourceError(`${source.dir} at ${source.ref} has no ${relative}; it predates the swe-agents CLI. Use a newer --ref.`)
  }
  return import(pathToFileURL(path).href)
}

async function sourceModules(source) {
  return {
    installer: await importFromSource(source, 'scripts/stacks/installer.mjs'),
    detect: await importFromSource(source, 'scripts/stacks/detect.mjs'),
    lib: await importFromSource(source, 'scripts/checks/lib.mjs')
  }
}

function splitPacks(value) {
  const names = value.split(',').map(name => name.trim()).filter(Boolean)
  if (!names.length) throw new UsageError('--packs needs at least one pack name')
  return names
}

// ---------------------------------------------------------------------------
// detect

function printDetection(detected, label, { lib, packs }) {
  if (!detected.length) {
    console.log(`No pack matched in ${label}; the core installs on its own. Add packs with --packs.`)
    return
  }
  const rows = detected.map(pack => [
    pack.name,
    pack.kind ?? '',
    pack.requires.join(', ') || '-',
    `${pack.matches.slice(0, 3).join(', ')}${pack.matchCount > 3 ? ` (+${pack.matchCount - 3} more)` : ''}`
  ])
  const header = ['pack', 'kind', 'pulls in', 'matched files']
  const widths = header.map((title, column) => Math.max(title.length, ...rows.map(row => row[column].length)))
  const line = row => `  ${row.map((cell, column) => (column === row.length - 1 ? cell : cell.padEnd(widths[column]))).join('   ')}`
  console.log(`Packs detected in ${label}:\n`)
  console.log(line(header))
  for (const row of rows) console.log(line(row))
  try {
    const selected = new Set(lib.resolvePacks(detected.map(pack => pack.name), packs))
    for (const profile of lib.loadProfiles().values()) {
      if (!Array.isArray(profile.data?.packs) || profile.name === 'reference') continue
      const resolved = new Set(lib.resolvePacks(profile.data.packs, packs))
      if (resolved.size === selected.size && [...resolved].every(name => selected.has(name))) {
        console.log(`\nThis selection equals the ${profile.name} profile; pass --profile ${profile.name} to follow that profile on update.`)
      }
    }
  } catch {
    // A conflicting detection is reported by the installer itself.
  }
}

async function runDetect(options) {
  const { target, label } = resolveTarget(options)
  const source = resolveSource({ forUpdate: false })
  printNotes(source)
  const { detect, lib } = await sourceModules(source)
  const packs = lib.loadPacks()
  const detected = detect.detectPacks(target, packs)
  if (options.json) console.log(JSON.stringify({ packs: detected }, null, 2))
  else printDetection(detected, label, { lib, packs })
  return 0
}

// ---------------------------------------------------------------------------
// init

// y/N prompt; end of input or an interrupt counts as no.
async function confirm(question) {
  const prompt = createInterface({ input: process.stdin, output: process.stdout })
  const closed = new Promise(resolveClosed => prompt.once('close', () => resolveClosed('')))
  try {
    const answer = await Promise.race([prompt.question(question), closed])
    return /^y(?:es)?$/i.test(String(answer).trim())
  } catch (error) {
    if (error?.code === 'ABORT_ERR') return false
    throw error
  } finally {
    prompt.close()
  }
}

function nextSteps(plan, label) {
  const ownCheckout = findCheckout(here)
  const run = ownCheckout
    ? command => `node ${join(ownCheckout, 'scripts/stacks/cli.mjs')} ${command} --target ${plan.target}`
    : command => `${npxCommand} ${command}`
  const lines = [
    '',
    'Next steps:',
    `  1. Review and commit what was installed in ${label}: AGENTS.md, ${lockFile}, .agents/, .claude/, .codex/, .github/.`,
    '  2. Verify discovery in each client you use: Claude Code lists the personas under /context and the',
    '     skills under /skills; Codex lists the skills under /skills; GitHub Copilot shows the personas in its agent picker.',
    `  3. Pull upstream improvements later; edited files are three-way merged: ${run('update')}`,
    `  4. Offer your own persona and skill improvements back: ${run('contribute')}`
  ]
  if (plan.catalog.agents.has('upstream-agent')) lines.push('  The upstream-agent persona is now installed; ask it to drive update and contribute for you.')
  for (const line of lines) console.log(line)
}

async function runInit(options) {
  const { target, label } = resolveTarget(options)
  const source = resolveSource({ ref: options.ref ?? null, forUpdate: true })
  printNotes(source)
  const { installer, detect, lib } = await sourceModules(source)
  let selection
  if (options.profile) selection = { profile: options.profile }
  else if (options.packs) selection = { packs: splitPacks(options.packs) }
  else {
    const packs = lib.loadPacks()
    const detected = detect.detectPacks(target, packs)
    printDetection(detected, label, { lib, packs })
    console.log('')
    selection = { packs: detected.map(pack => pack.name) }
  }
  if (installer.readLock(target)) {
    console.log(`Note: ${label} already has ${lockFile}. init reinstalls this selection without merging; swe-agents update merges local edits.\n`)
  }
  const plan = installer.planInstall({ target, ...selection, source })
  const preview = options.dryRun || !options.yes
  installer.reportPlan(plan, { command: 'init', dryRun: options.dryRun, targetLabel: label })
  if (options.dryRun) {
    installer.reportOutcome(plan, { command: 'init', dryRun: true, routing: false })
    return 0
  }
  if (preview) {
    if (!process.stdin.isTTY || !process.stdout.isTTY) {
      console.log('\nNothing written: no terminal to confirm in. Review the plan above, then rerun with --yes to install.')
      return 2
    }
    if (!(await confirm(`\nInstall ${installer.changeCount(plan)} change(s) into ${label}? [y/N] `))) {
      console.log('Nothing written.')
      return 2
    }
  }
  installer.applyPlan(plan)
  installer.reportOutcome(plan, { command: 'init', dryRun: false })
  nextSteps(plan, label)
  return 0
}

// ---------------------------------------------------------------------------
// install, update, contribute

async function runInstallCommand(options) {
  const { target, label } = resolveTarget(options, { required: true })
  if (!options.profile && !options.packs) throw new UsageError('Use exactly one of --profile or --packs')
  const source = resolveSource({ forUpdate: false })
  printNotes(source)
  const { installer } = await sourceModules(source)
  return installer.runInstall({
    target,
    targetLabel: label,
    profile: options.profile ?? null,
    packs: options.packs ? splitPacks(options.packs) : null,
    force: Boolean(options.force),
    dryRun: Boolean(options.dryRun),
    source
  })
}

function lockedSource(target) {
  const path = join(target, lockFile)
  if (!existsSync(path)) throw new UsageError(`${lockFile} not found in the target; run swe-agents init or install first`)
  try {
    const source = JSON.parse(readFileSync(path, 'utf8'))?.source ?? {}
    return { ref: typeof source.ref === 'string' ? source.ref : null, repo: typeof source.repo === 'string' ? source.repo : null }
  } catch (error) {
    throw new UsageError(`${lockFile}: invalid JSON (${error.message}); repair or delete it first`)
  }
}

async function runUpdateCommand(options) {
  const { target, label } = resolveTarget(options)
  const locked = lockedSource(target)
  const source = resolveSource({ ref: options.ref ?? locked.ref, forUpdate: true, repo: locked.repo })
  printNotes(source)
  const { installer } = await sourceModules(source)
  return installer.runUpdate({
    target,
    targetLabel: label,
    source,
    force: Boolean(options.force),
    merge: !options.noMerge,
    dryRun: Boolean(options.dryRun)
  })
}

async function runContributeCommand(options) {
  if (options.apply && options.dryRun) throw new UsageError('Use either --apply or --dry-run, not both')
  const { target } = resolveTarget(options)
  const source = resolveSource({ forUpdate: false })
  printNotes(source)
  let module
  try {
    module = await importFromSource(source, 'scripts/stacks/contribute.mjs')
  } catch (error) {
    console.error('contribute is not available in this source checkout')
    console.error(`  (${error.message})`)
    return 1
  }
  if (typeof module.runContribute !== 'function') {
    console.error('contribute is not available in this source checkout')
    return 1
  }
  // runContribute returns { exitCode, ... } and prints its own errors.
  const result = await module.runContribute({
    root: source.dir,
    target,
    slug: options.slug,
    base: options.base,
    apply: Boolean(options.apply),
    dryRun: Boolean(options.dryRun)
  })
  return Number.isInteger(result?.exitCode) ? result.exitCode : 1
}

// ---------------------------------------------------------------------------

const runners = { init: runInit, detect: runDetect, install: runInstallCommand, update: runUpdateCommand, contribute: runContributeCommand }

async function main(argv) {
  const [command, ...rest] = argv
  if (!command || ['--help', '-h', 'help'].includes(command)) {
    console.log(usage)
    return 0
  }
  if (['--version', '-v', 'version'].includes(command)) {
    console.log(`swe-agents ${packageVersion()}`)
    return 0
  }
  if (!Object.hasOwn(commands, command)) throw new UsageError(`Unknown command ${command}`)
  const options = parseOptions(command, rest)
  if (options.help) {
    console.log(usage)
    return 0
  }
  return runners[command](options)
}

try {
  process.exitCode = await main(process.argv.slice(2))
} catch (error) {
  if (error instanceof UsageError) {
    console.error(`${error.message}\n\nRun swe-agents --help for usage.`)
    process.exitCode = 1
  } else if (error instanceof SourceError || ['SourceError', 'InstallError'].includes(error?.name)) {
    console.error(error.message)
    process.exitCode = 1
  } else {
    throw error
  }
}
