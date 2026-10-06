import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, rmdirSync, statSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, join, posix, resolve } from 'node:path'
import { StackError, collectCatalog, listValue, loadCore, loadPacks, loadProfiles, namePattern, parseFrontmatterText, read, resolvePacks, root } from '../checks/lib.mjs'
import {
  blockLayout, composeAgentsMd, findManagedBlock, managedBlock, normalized, relativeLinkTargets, routingRows, routingTable,
  runtimeDirectories, runtimeOutputs, sha256
} from './engine.mjs'

const usage = `Usage: node scripts/stacks/install.mjs --target <dir> (--profile <name> | --packs a,b,c) [--dry-run] [--force]

  --target <dir>     Existing repository directory to install into (required).
  --profile <name>   Install a profile from profiles/<name>.json.
  --packs a,b,c      Install an explicit pack list; required packs are added.
  --dry-run          Print the plan and the routing table; write nothing.
  --force            Overwrite files edited since the last install and files
                     the installer did not create; remove edited files that
                     the selection no longer installs.`

const lockPath = '.agents/stacks.lock.json'
const copilotPath = '.github/copilot-instructions.md'
const copilotPointer = `# Copilot Instructions

Follow the repository rules in [AGENTS.md](../AGENTS.md). Personas live in
\`.github/agents/\` and \`.claude/agents/\`; skills live in \`.agents/skills/\`.
Read the persona and the skills it lists before acting.
`

function fail(message) {
  console.error(message)
  process.exit(1)
}

function parseArguments(argv) {
  const options = { dryRun: false, force: false }
  const valueOf = (argument, index) => {
    const inline = argument.indexOf('=')
    if (inline !== -1) return [argument.slice(inline + 1), index]
    const value = argv[index + 1]
    if (value === undefined || value.startsWith('--')) fail(`${argument} needs a value\n\n${usage}`)
    return [value, index + 1]
  }
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    const flag = argument.split('=')[0]
    if (argument === '--') continue
    if (flag === '--help' || flag === '-h') {
      console.log(usage)
      process.exit(0)
    } else if (flag === '--dry-run') options.dryRun = true
    else if (flag === '--force') options.force = true
    else if (['--target', '--profile', '--packs'].includes(flag)) {
      const [value, next] = valueOf(argument, index)
      options[flag.slice(2)] = value
      index = next
    } else fail(`Unknown argument ${argument}\n\n${usage}`)
  }
  if (!options.target) fail(`--target is required\n\n${usage}`)
  if (Boolean(options.profile) === Boolean(options.packs)) fail(`Use exactly one of --profile or --packs\n\n${usage}`)
  return options
}

function sourceCommit() {
  try {
    const run = args => execFileSync('git', args, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
    if (realpathSync(run(['rev-parse', '--show-toplevel'])) !== realpathSync(root)) return null
    const commit = run(['rev-parse', 'HEAD'])
    return /^[0-9a-f]{40}$/.test(commit) ? commit : null
  } catch {
    return null
  }
}

function readLock(target) {
  const path = join(target, lockPath)
  if (!existsSync(path)) return { files: {}, text: null }
  let lock
  try {
    lock = JSON.parse(readFileSync(path, 'utf8'))
  } catch (error) {
    fail(`${lockPath}: invalid JSON (${error.message}); repair or delete it before installing`)
  }
  const files = {}
  const ignored = []
  for (const [path, hash] of Object.entries(lock?.files ?? {})) {
    const safe = posix.normalize(path) === path && !path.startsWith('../') && !posix.isAbsolute(path) &&
      (path === 'AGENTS.md' || path === '.codex/config.toml' || runtimeDirectories.some(directory => path.startsWith(`${directory}/`)))
    if (safe && /^[0-9a-f]{64}$/.test(hash)) files[path] = hash
    else ignored.push(path)
  }
  return { files, ignored, text: readFileSync(path, 'utf8').replace(/\r\n/g, '\n') }
}

function currentContent(target, path) {
  const absolute = join(target, path)
  if (!existsSync(absolute)) return null
  if (!statSync(absolute).isFile()) fail(`${path}: exists in the target but is not a file`)
  return normalized(readFileSync(absolute))
}

// Plans one tool-directory file against the lock: create, update, unchanged, or skip.
function planFile(target, path, expected, lockHash, force) {
  const current = currentContent(target, path)
  const hash = sha256(expected)
  if (current === null) return { path, action: lockHash ? 'restore' : 'create', write: expected, lock: hash }
  if (current.equals(expected)) return { path, action: 'unchanged', lock: hash }
  if (lockHash && sha256(current) === lockHash) return { path, action: 'update', write: expected, lock: hash }
  if (force) return { path, action: 'overwrite', write: expected, lock: hash }
  return {
    path,
    action: lockHash ? 'skip-edited' : 'skip-unowned',
    lock: lockHash ?? null,
    note: lockHash ? 'edited since the last install' : 'exists and was not installed by swe-agents'
  }
}

// AGENTS.md is tracked by its managed block, so project rules outside it stay untouched.
function planAgentsMd(target, composed, lockHash, force) {
  const path = 'AGENTS.md'
  const current = currentContent(target, path)?.toString('utf8') ?? null
  if (current === null) {
    const block = managedBlock(composed.fresh)
    return { path, action: lockHash ? 'restore' : 'create', write: Buffer.from(`${composed.h1}\n\n${block}\n`), lock: sha256(block) }
  }
  const found = findManagedBlock(current)
  if (found?.error) return { path, action: 'skip-edited', lock: lockHash ?? null, note: found.error }
  if (!found) {
    if (lockHash && !force) return { path, action: 'skip-edited', lock: lockHash, note: 'the managed block markers were removed' }
    const block = managedBlock(composed.appended)
    return { path, action: 'append-block', write: Buffer.from(`${current.trimEnd()}\n\n${block}\n`), lock: sha256(block) }
  }
  const block = managedBlock(blockLayout(found.before) === 'fresh' ? composed.fresh : composed.appended)
  if (found.block === block) return { path, action: 'unchanged', lock: sha256(block) }
  if (!force && sha256(found.block) !== lockHash) {
    return {
      path,
      action: lockHash ? 'skip-edited' : 'skip-unowned',
      lock: lockHash ?? null,
      note: lockHash ? 'the managed block was edited since the last install' : 'the managed block is not recorded in the lock file'
    }
  }
  return { path, action: 'update-block', write: Buffer.from(`${found.before}${block}${found.after}`), lock: sha256(block) }
}

function planRemoval(target, path, lockHash, force) {
  const current = currentContent(target, path)
  if (current === null) return { path, action: 'forget', lock: null }
  if (sha256(current) === lockHash || force) return { path, action: 'remove', remove: true, lock: null }
  return { path, action: 'keep-edited', lock: null, note: 'no longer installed but edited locally; now unmanaged' }
}

function pruneEmptyDirectories(target, path) {
  let directory = dirname(join(target, path))
  const stop = resolve(target)
  while (resolve(directory).startsWith(stop) && resolve(directory) !== stop) {
    if (readdirSync(directory).length) return
    rmdirSync(directory)
    directory = dirname(directory)
  }
}

function validatePersonas(catalog) {
  const problems = []
  for (const entry of catalog.agents.values()) {
    const { data, problems: parse } = parseFrontmatterText(read(entry.source))
    if (!data || parse.length) problems.push(`${entry.label}: invalid frontmatter`)
    else {
      if (data.name !== entry.name) problems.push(`${entry.label}: name must equal ${entry.name}`)
      for (const skill of listValue(data.skills) ?? []) {
        if (!catalog.skills.has(skill)) problems.push(`${entry.label}: skill ${skill} is not part of this selection`)
      }
    }
  }
  for (const entry of catalog.skills.values()) {
    if (!namePattern.test(entry.name)) problems.push(`${entry.dirLabel}: invalid skill name`)
    if (!existsSync(entry.source)) problems.push(`${entry.dirLabel}: missing SKILL.md`)
  }
  for (const pack of catalog.packs) {
    if (!existsSync(pack.agentsMd)) problems.push(`${pack.dirLabel}: missing AGENTS.md`)
    const declared = [...(pack.manifest.agents ?? []), ...(pack.manifest.skills ?? [])].sort().join(',')
    const present = [...pack.agents, ...pack.skills].map(entry => entry.name).sort().join(',')
    if (declared !== present) problems.push(`${pack.dirLabel}: pack.json agents and skills do not match the files present; run pnpm check:stacks`)
  }
  if (!existsSync(catalog.core.agentsMd)) problems.push('core/AGENTS.md: missing')
  return problems
}

const options = parseArguments(process.argv.slice(2))
// pnpm runs scripts from the package root; INIT_CWD keeps paths relative to the caller.
const target = resolve(process.env.INIT_CWD ?? process.cwd(), options.target)
if (!existsSync(target) || !statSync(target).isDirectory()) fail(`Target ${options.target} is not an existing directory`)
if (realpathSync(target) === realpathSync(root)) fail('The target is this repository; use pnpm sync:setup to regenerate its runtime directories')

const packs = loadPacks()
let requested
if (options.profile) {
  const profiles = loadProfiles()
  const profile = profiles.get(options.profile)
  if (!profile) fail(`Unknown profile ${options.profile}; available: ${[...profiles.keys()].join(', ') || 'none'}`)
  if (profile.error || !Array.isArray(profile.data?.packs)) fail(`${profile.label}: ${profile.error ?? 'packs must be a list'}`)
  requested = profile.data.packs
} else {
  requested = options.packs.split(',').map(name => name.trim()).filter(Boolean)
  if (!requested.length) fail('--packs needs at least one pack name')
}

let catalog
try {
  catalog = collectCatalog(resolvePacks(requested, packs), { core: loadCore(), packs })
} catch (error) {
  if (!(error instanceof StackError)) throw error
  fail(`Cannot install this selection:\n${error.problems.map(problem => `- ${problem}`).join('\n')}`)
}
const problems = validatePersonas(catalog)
if (problems.length) fail(`Cannot install this selection:\n${problems.map(problem => `- ${problem}`).join('\n')}`)

const lock = readLock(target)
let outputs
try {
  outputs = runtimeOutputs(catalog, { target, mode: 'target' })
} catch (error) {
  fail(`Cannot install this selection: ${error.message}`)
}

const composed = composeAgentsMd(catalog, { target })
const plan = [planAgentsMd(target, composed, lock.files['AGENTS.md'], options.force)]
for (const [path, { content }] of [...outputs].sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))) {
  plan.push(planFile(target, path, content, lock.files[path], options.force))
}
for (const [path, hash] of Object.entries(lock.files).sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))) {
  if (path !== 'AGENTS.md' && !outputs.has(path)) plan.push(planRemoval(target, path, hash, options.force))
}
const copilotPlan = existsSync(join(target, copilotPath))
  ? { path: copilotPath, action: 'keep' }
  : { path: copilotPath, action: 'create', write: Buffer.from(copilotPointer) }
plan.push(copilotPlan)

const files = {}
for (const step of plan) if (step.lock) files[step.path] = step.lock
const commit = sourceCommit()
const lockText = `${JSON.stringify({
  source: { repo: 'swe-agents', commit },
  profile: options.profile ?? null,
  packs: catalog.packs.map(pack => ({ name: pack.name, version: pack.manifest.version })),
  files: Object.fromEntries(Object.entries(files).sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0)))
}, null, 2)}\n`
const lockChanged = lockText !== lock.text

const changes = plan.filter(step => step.write || step.remove)
const skipped = plan.filter(step => step.action.startsWith('skip'))
const released = plan.filter(step => step.action === 'keep-edited')
const counts = {}
for (const step of plan) counts[step.action] = (counts[step.action] ?? 0) + 1

console.log(`swe-agents install${options.dryRun ? ' (dry run)' : ''}`)
console.log(`  target:  ${options.target}`)
console.log(`  request: ${options.profile ? `profile ${options.profile}` : `packs ${requested.join(', ')}`}`)
console.log(`  packs:   ${catalog.packs.map(pack => `${pack.name}@${pack.manifest.version}`).join(', ')}`)
console.log(`  source:  swe-agents${commit ? `@${commit.slice(0, 12)}` : ' (commit unknown)'}`)
console.log(`  catalog: ${catalog.agents.size} personas, ${catalog.skills.size} skills`)
console.log('')
for (const step of plan) {
  if (step.action === 'unchanged' || step.action === 'keep') continue
  console.log(`  ${step.action.padEnd(13)} ${step.path}${step.note ? `  (${step.note})` : ''}`)
}
if (lockChanged) console.log(`  ${(lock.text === null ? 'create' : 'update').padEnd(13)} ${lockPath}`)
console.log(`\nSummary: ${Object.entries(counts).map(([action, count]) => `${count} ${action}`).join(', ')}`)

if (!options.dryRun) {
  for (const step of changes) {
    const absolute = join(target, step.path)
    if (step.remove) {
      unlinkSync(absolute)
      pruneEmptyDirectories(target, step.path)
    } else {
      mkdirSync(dirname(absolute), { recursive: true })
      writeFileSync(absolute, step.write)
    }
  }
  if (lockChanged) {
    mkdirSync(dirname(join(target, lockPath)), { recursive: true })
    writeFileSync(join(target, lockPath), lockText)
  }
}

if (skipped.length) {
  console.log(`\nSkipped ${skipped.length} file(s) to protect local content; review them, then rerun with --force to overwrite:`)
  for (const step of skipped) console.log(`  ${step.path}: ${step.note}`)
}
if (released.length) {
  console.log(`\nLeft ${released.length} edited file(s) that this selection no longer installs; they are now unmanaged, so delete them if unneeded:`)
  for (const step of released) console.log(`  ${step.path}`)
}
if (lock.ignored?.length) console.log(`\nIgnored ${lock.ignored.length} lock entr(ies) outside the installer's paths: ${lock.ignored.join(', ')}`)
for (const name of ['CLAUDE.md', 'CLAUDE.local.md']) {
  if (existsSync(join(target, name))) console.log(`\nWarning: ${name} exists; Claude Code then skips AGENTS.md by default. Fold its content into AGENTS.md.`)
}

// Relative links that will not resolve inside the target, such as this repository's own documentation.
const installed = new Set([...outputs.keys(), 'AGENTS.md', copilotPath])
const unresolved = new Set()
const markdown = [
  ['AGENTS.md', 'core and pack AGENTS.md', Buffer.from(composed.fresh)],
  ...[...outputs].filter(([path]) => path.endsWith('.md')).map(([path, { content, source }]) => [path, source, content])
]
for (const [path, source, content] of markdown) {
  for (const link of relativeLinkTargets(content.toString('utf8'))) {
    let linkPath = link.split(/[?#]/)[0]
    try {
      linkPath = decodeURIComponent(linkPath)
    } catch {
      // Keep the raw path when it is not valid percent-encoding.
    }
    const resolved = posix.normalize(posix.join(posix.dirname(path), linkPath)).replace(/\/$/, '')
    if (!installed.has(resolved) && !existsSync(join(target, resolved))) unresolved.add(`${resolved} (linked from ${source})`)
  }
}
if (unresolved.size) {
  console.log(`\nNote: ${unresolved.size} relative link target(s) do not exist in the target:`)
  for (const item of unresolved) console.log(`  ${item}`)
}

console.log('\nRouting table for the installed personas (paste into your routing guide):\n')
console.log(routingTable(routingRows(catalog, root)))

const changeCount = changes.length + (lockChanged ? 1 : 0)
console.log('')
if (options.dryRun) console.log(changeCount ? `Result (dry run): ${changeCount} change(s) planned; nothing written` : 'Result (dry run): no changes')
else console.log(changeCount ? `Result: ${changeCount} change(s) written` : 'Result: no changes')
