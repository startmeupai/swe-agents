import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmdirSync, rmSync, statSync, unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, posix, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { StackError, collectCatalog, listValue, loadCore, loadPacks, loadProfiles, namePattern, parseFrontmatterText, read, resolvePacks, root } from '../checks/lib.mjs'
import {
  blockLayout, composeAgentsMd, findManagedBlock, managedBlock, normalized, relativeLinkTargets, routingRows, routingTable,
  runtimeDirectories, runtimeOutputs, sha256
} from './engine.mjs'
import { commitPattern, describeCheckout, git } from './source.mjs'

// The installer as a module: plan, apply, and lock handling shared by
// install.mjs, cli.mjs (init, install, update), contribute.mjs, and the checks.
// Paths in plans and the lock are target-relative POSIX paths.

export const lockPath = '.agents/stacks.lock.json'
export const lockVersion = 2
export const copilotPath = '.github/copilot-instructions.md'
const copilotPointer = `# Copilot Instructions

Follow the repository rules in [AGENTS.md](../AGENTS.md). Personas live in
\`.github/agents/\` and \`.claude/agents/\`; skills live in \`.agents/skills/\`.
Read the persona and the skills it lists before acting.
`

export class InstallError extends Error {
  constructor(message) {
    super(message)
    this.name = 'InstallError'
  }
}

const byKey = ([left], [right]) => (left < right ? -1 : left > right ? 1 : 0)
const sortedObject = object => Object.fromEntries(Object.entries(object).sort(byKey))
const short = commit => (commit ? commit.slice(0, 12) : 'unknown')

function isManagedPath(path) {
  return typeof path === 'string' && !path.includes('\\') && posix.normalize(path) === path && !path.startsWith('../') &&
    !posix.isAbsolute(path) && !/^[A-Za-z]:/.test(path) &&
    (path === 'AGENTS.md' || path === '.codex/config.toml' || runtimeDirectories.some(directory => path.startsWith(`${directory}/`)))
}

function isOriginPath(origin) {
  return typeof origin === 'string' && !origin.includes('\\') && posix.normalize(origin) === origin &&
    /^(?:core|stacks)\/[^/]+\/.+/.test(origin) && !origin.split('/').includes('..')
}

// Installed copies of a canonical file record it as their origin; composed
// files (AGENTS.md, .codex/config.toml, .codex/agents/*.toml) have none.
function originFor(path, source) {
  if (path === 'AGENTS.md' || path.startsWith('.codex/')) return null
  return isOriginPath(source) ? source : null
}

// ---------------------------------------------------------------------------
// Lock file

const emptyLock = Object.freeze({
  path: null, text: null, lockVersion: null, version: null, source: { repo: null, ref: null, commit: null },
  profile: null, packs: [], files: {}, origins: {}, bases: {}, ignored: []
})

// Reads `.agents/stacks.lock.json`; returns null when the target has none.
// Accepts version 1 (no lockVersion, no origins) and version 2. `files`,
// `origins`, and `bases` keep only entries inside the installer's paths;
// everything else is listed in `ignored`.
export function readLock(target) {
  const path = join(resolve(target), lockPath)
  if (!existsSync(path)) return null
  const text = readFileSync(path, 'utf8').replace(/\r\n/g, '\n')
  let raw
  try {
    raw = JSON.parse(text)
  } catch (error) {
    throw new InstallError(`${lockPath}: invalid JSON (${error.message}); repair or delete it before installing`)
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new InstallError(`${lockPath}: must contain a JSON object; repair or delete it before installing`)
  const version = raw.lockVersion === undefined ? 1 : raw.lockVersion
  if (version !== 1 && version !== 2) throw new InstallError(`${lockPath}: lockVersion ${JSON.stringify(raw.lockVersion)} is not supported by this installer; use a newer swe-agents source`)

  const files = {}
  const ignored = []
  for (const [file, hash] of Object.entries(raw.files ?? {})) {
    if (isManagedPath(file) && typeof hash === 'string' && /^[0-9a-f]{64}$/.test(hash)) files[file] = hash
    else ignored.push(file)
  }
  const origins = {}
  const bases = {}
  if (version >= 2) {
    for (const [file, origin] of Object.entries(raw.origins ?? {})) {
      if (Object.hasOwn(files, file) && originFor(file, origin)) origins[file] = origin
    }
    for (const [file, entry] of Object.entries(raw.bases ?? {})) {
      if (!Object.hasOwn(files, file) || !entry || typeof entry !== 'object' || !commitPattern.test(entry.commit ?? '')) continue
      if (entry.ours !== undefined && !/^[0-9a-f]{64}$/.test(entry.ours)) continue
      bases[file] = entry.ours === undefined ? { commit: entry.commit } : { commit: entry.commit, ours: entry.ours }
    }
  }
  const source = raw.source && typeof raw.source === 'object' ? raw.source : {}
  return {
    path,
    text,
    lockVersion: version,
    version,
    source: {
      repo: typeof source.repo === 'string' ? source.repo : null,
      ref: typeof source.ref === 'string' ? source.ref : null,
      commit: typeof source.commit === 'string' && commitPattern.test(source.commit) ? source.commit : null
    },
    profile: typeof raw.profile === 'string' && raw.profile ? raw.profile : null,
    packs: (Array.isArray(raw.packs) ? raw.packs : [])
      .filter(pack => pack && typeof pack.name === 'string' && namePattern.test(pack.name))
      .map(pack => ({ name: pack.name, version: typeof pack.version === 'string' ? pack.version : null })),
    files,
    origins,
    bases,
    ignored
  }
}

// Version 2 lock text: fixed top-level order, maps sorted by path, LF endings.
// `bases` appears only while a file waits on an older merge base.
export function serializeLock(data) {
  const lock = {
    lockVersion,
    source: { repo: data.source?.repo ?? null, ref: data.source?.ref ?? null, commit: data.source?.commit ?? null },
    profile: data.profile ?? null,
    packs: (data.packs ?? []).map(pack => ({ name: pack.name, version: pack.version ?? null })),
    files: sortedObject(data.files ?? {}),
    origins: sortedObject(data.origins ?? {})
  }
  const bases = sortedObject(data.bases ?? {})
  if (Object.keys(bases).length) lock.bases = bases
  return `${JSON.stringify(lock, null, 2)}\n`
}

function missingCommitMessage(source) {
  return `Cannot determine the source commit${source?.dir ? ` of ${source.dir}` : ''}. The lock records a full 40-character commit, so ` +
    'run the installer from a Git clone of swe-agents, or run the swe-agents CLI, which uses a cached clone.'
}

export function writeLock(target, data) {
  if (!commitPattern.test(data?.source?.commit ?? '')) throw new InstallError(missingCommitMessage(data?.source))
  const text = serializeLock(data)
  const path = join(resolve(target), lockPath)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, text)
  return text
}

// ---------------------------------------------------------------------------
// Three-way merge through `git merge-file` on temporary files.

function isBinary(buffer) {
  return buffer.subarray(0, 8000).includes(0)
}

// Returns { clean, content, conflicts, binary }. `content` holds the merged
// text, with conflict markers when `clean` is false; binary input never merges.
export function threeWayMerge({ ours, base, theirs, labels = ['local', 'base', 'upstream'] }) {
  const inputs = [ours, base, theirs].map(value => normalized(value))
  if (inputs.some(isBinary)) return { clean: false, content: null, conflicts: 0, binary: true }
  const directory = mkdtempSync(join(tmpdir(), 'swe-agents-merge-'))
  try {
    const paths = ['ours', 'base', 'theirs'].map(name => join(directory, name))
    paths.forEach((path, index) => writeFileSync(path, inputs[index]))
    const args = ['merge-file', '-p', '-L', labels[0], '-L', labels[1], '-L', labels[2], ...paths]
    try {
      const output = execFileSync('git', args, { cwd: directory, stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 })
      return { clean: true, content: normalized(output), conflicts: 0, binary: false }
    } catch (error) {
      if (Number.isInteger(error.status) && error.status > 0 && error.status < 128 && error.stdout) {
        return { clean: false, content: normalized(error.stdout), conflicts: error.status, binary: false }
      }
      throw new InstallError(`git merge-file failed: ${error.stderr?.toString().trim() || error.message}`)
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

// The conflict regions of a merge result, marker lines included.
export function conflictHunks(text, limit = 60) {
  const lines = []
  let inside = false
  for (const line of text.split('\n')) {
    if (line.startsWith('<<<<<<< ')) inside = true
    if (inside) lines.push(line)
    if (line.startsWith('>>>>>>> ')) inside = false
  }
  return lines.length > limit ? [...lines.slice(0, limit), `... ${lines.length - limit} more line(s)`] : lines
}

// ---------------------------------------------------------------------------
// Rendering at a source commit (the merge base and the contribute base)

function packNames(packs) {
  if (!Array.isArray(packs)) return null
  return packs.map(pack => (typeof pack === 'string' ? pack : pack?.name)).filter(name => typeof name === 'string' && name)
}

// Renders what the installer wrote at `commit`: checks the commit out into a
// temporary `git worktree`, imports that commit's engine and catalog modules,
// and renders the locked pack list (or the profile when no list is given).
// Returns { render } or { reason }.
export async function renderAtCommitDetailed({ commit, packs = null, profile = null, target, sourceDir = root }) {
  if (!commitPattern.test(commit ?? '')) return { reason: 'the lock has no full source commit' }
  for (const spec of [`${commit}^{commit}`, `${commit}:scripts/stacks/engine.mjs`, `${commit}:scripts/checks/lib.mjs`]) {
    try {
      git(['cat-file', '-e', spec], sourceDir)
    } catch {
      return {
        reason: spec.endsWith('^{commit}')
          ? `commit ${short(commit)} is not in the source checkout ${sourceDir}`
          : `commit ${short(commit)} predates the stack-pack installer`
      }
    }
  }
  const temporary = mkdtempSync(join(tmpdir(), 'swe-agents-base-'))
  const worktree = join(temporary, 'source')
  let added = false
  try {
    git(['worktree', 'add', '--detach', '--quiet', worktree, commit], sourceDir)
    added = true
    const lib = await import(pathToFileURL(join(worktree, 'scripts/checks/lib.mjs')).href)
    const engine = await import(pathToFileURL(join(worktree, 'scripts/stacks/engine.mjs')).href)
    for (const name of ['runtimeOutputs', 'composeAgentsMd', 'managedBlock']) {
      if (typeof engine[name] !== 'function') return { reason: `commit ${short(commit)} has an incompatible engine (no ${name})` }
    }
    const packMap = lib.loadPacks(worktree)
    let names = packNames(packs)
    if (names === null && profile) {
      const found = lib.loadProfiles(worktree).get(profile)
      if (!found?.data || !Array.isArray(found.data.packs)) return { reason: `profile ${profile} does not exist at ${short(commit)}` }
      names = found.data.packs
    }
    const catalog = lib.collectCatalog(lib.resolvePacks(names ?? [], packMap), { core: lib.loadCore(worktree), packs: packMap })
    const outputs = engine.runtimeOutputs(catalog, { target: resolve(target), mode: 'target' })
    const composed = engine.composeAgentsMd(catalog, { target: resolve(target) })
    return {
      render: {
        commit,
        packs: catalog.packs.map(pack => pack.name),
        outputs,
        composed,
        blocks: { fresh: engine.managedBlock(composed.fresh), appended: engine.managedBlock(composed.appended) }
      }
    }
  } catch (error) {
    return { reason: `cannot render ${short(commit)}: ${error.problems?.join('; ') ?? error.message}` }
  } finally {
    if (added) {
      try {
        git(['worktree', 'remove', '--force', worktree], sourceDir)
      } catch {
        // Fall through to the directory removal and prune below.
      }
    }
    rmSync(temporary, { recursive: true, force: true })
    try {
      git(['worktree', 'prune'], sourceDir)
    } catch {
      // A failed prune leaves only Git's own bookkeeping for a missing directory.
    }
  }
}

// Returns { commit, packs, outputs, composed, blocks } or null when the commit
// is missing from the source checkout or predates the installer modules.
// `outputs` is the runtimeOutputs Map (path -> { content, source }); `blocks`
// holds the managed AGENTS.md block for the `fresh` and `appended` layouts.
export async function renderAtCommit(options) {
  return (await renderAtCommitDetailed(options)).render ?? null
}

// ---------------------------------------------------------------------------
// Planning

function currentContent(target, path) {
  const absolute = join(target, path)
  if (!existsSync(absolute)) return null
  if (!statSync(absolute).isFile()) throw new InstallError(`${path}: exists in the target but is not a file`)
  return normalized(readFileSync(absolute))
}

function baseMap(baseOutputs) {
  if (!baseOutputs) return new Map()
  if (baseOutputs instanceof Map) {
    const entries = [...baseOutputs.entries()].filter(([, render]) => render)
    return new Map(entries)
  }
  return baseOutputs.commit ? new Map([[baseOutputs.commit, baseOutputs]]) : new Map()
}

// Picks the merge base for an edited file. Normally the lock's commit, verified
// against the lock hash. A `bases` entry names an older commit for a file that
// was skipped at the last update; after a conflict, a file that changed since
// counts as resolved against the lock's commit.
function chooseBase(context, path, current, lockHash, pick) {
  const entry = context.lock.bases?.[path]
  const lockCommit = context.lock.source?.commit
  if (entry?.ours && sha256(current) !== entry.ours) {
    const render = context.bases.get(lockCommit)
    const content = render ? pick(render) : null
    return content ? { content, commit: lockCommit } : { reason: `no base at ${short(lockCommit)} to merge the resolved file against` }
  }
  const commit = entry?.commit ?? lockCommit
  const render = context.bases.get(commit)
  if (!render) return { reason: `no merge base at ${short(commit)}` }
  const content = pick(render)
  if (!content) return { reason: `not installed at ${short(commit)}` }
  if (sha256(content) !== lockHash) return { reason: `the rendering at ${short(commit)} does not match the lock hash` }
  return { content, commit }
}

// Keeps the lock hash of a file that was not refreshed and remembers the commit
// that hash belongs to, so a later update can still merge it. A conflict's
// `ours` survives only while the source commit stays the same: the version the
// file was resolved against is otherwise unknown.
function skipEdited(context, path, lockHash, note) {
  const previous = context.lock.source?.commit
  const moved = Boolean(previous) && previous !== context.commit
  let base = context.lock.bases?.[path] ?? null
  if (base?.ours && moved) base = { commit: base.commit }
  if (!base && moved) base = { commit: previous }
  return { path, action: 'skip-edited', lock: lockHash, note, ...(base ? { base } : {}) }
}

function mergeLabels(context, path, baseCommit) {
  return [`${path} (local)`, `base ${short(baseCommit)}`, `upstream ${short(context.commit)}`]
}

function conflictStep(context, path, lockHash, base, current, result, note) {
  return {
    path,
    action: 'skip-conflict',
    lock: lockHash,
    note,
    base: { commit: base.commit, ours: sha256(current) },
    conflict: { baseCommit: base.commit, hunks: result.binary ? ['(binary content)'] : conflictHunks(result.content.toString('utf8')) }
  }
}

// Plans one tool-directory file against the lock: create, update, merge, unchanged, or skip.
function planFile(context, path, expected) {
  const { target, force, merge, lock } = context
  const lockHash = lock.files[path]
  const current = currentContent(target, path)
  const hash = sha256(expected)
  if (current === null) return { path, action: lockHash ? 'restore' : 'create', write: expected, lock: hash }
  if (current.equals(expected)) return { path, action: 'unchanged', lock: hash }
  if (lockHash && sha256(current) === lockHash) return { path, action: 'update', write: expected, lock: hash }
  if (force) return { path, action: 'overwrite', write: expected, lock: hash }
  if (!lockHash) return { path, action: 'skip-unowned', lock: null, note: 'exists and was not installed by swe-agents' }
  if (!merge) return skipEdited(context, path, lockHash, 'edited since the last install')
  const base = chooseBase(context, path, current, lockHash, render => render.outputs?.get(path)?.content ?? null)
  if (!base.content) return skipEdited(context, path, lockHash, `edited since the last install; cannot merge: ${base.reason}`)
  const result = threeWayMerge({ ours: current, base: base.content, theirs: expected, labels: mergeLabels(context, path, base.commit) })
  if (!result.clean) {
    return conflictStep(context, path, lockHash, base, current, result, result.binary ? 'edited binary file changed upstream' : 'local edits conflict with the upstream change')
  }
  if (result.content.equals(current)) return { path, action: 'unchanged', lock: hash, note: 'local edits kept; no upstream change to merge' }
  return { path, action: 'merge', write: result.content, lock: hash, note: 'local edits merged with the upstream change' }
}

// AGENTS.md is tracked by its managed block, so project rules outside it stay untouched.
function planAgentsMd(context, composed) {
  const { target, force, merge, lock } = context
  const path = 'AGENTS.md'
  const lockHash = lock.files[path]
  const current = currentContent(target, path)?.toString('utf8') ?? null
  if (current === null) {
    const block = managedBlock(composed.fresh)
    return { path, action: lockHash ? 'restore' : 'create', write: Buffer.from(`${composed.h1}\n\n${block}\n`), lock: sha256(block) }
  }
  const found = findManagedBlock(current)
  if (found?.error) return { path, action: 'skip-edited', lock: lockHash ?? null, note: found.error }
  if (!found) {
    if (lockHash && !force) return skipEdited(context, path, lockHash, 'the managed block markers were removed')
    const block = managedBlock(composed.appended)
    return { path, action: 'append-block', write: Buffer.from(`${current.trimEnd()}\n\n${block}\n`), lock: sha256(block) }
  }
  const layout = blockLayout(found.before) === 'fresh' ? 'fresh' : 'appended'
  const block = managedBlock(composed[layout])
  if (found.block === block) return { path, action: 'unchanged', lock: sha256(block) }
  const updated = { path, action: 'update-block', write: Buffer.from(`${found.before}${block}${found.after}`), lock: sha256(block) }
  if (force || sha256(found.block) === lockHash) return updated
  if (!lockHash) return { path, action: 'skip-unowned', lock: null, note: 'the managed block is not recorded in the lock file' }
  if (!merge) return skipEdited(context, path, lockHash, 'the managed block was edited since the last install')

  const ours = Buffer.from(found.block)
  const base = chooseBase(context, path, ours, lockHash, render => (render.blocks?.[layout] ? Buffer.from(render.blocks[layout]) : null))
  if (!base.content) return skipEdited(context, path, lockHash, `the managed block was edited since the last install; cannot merge: ${base.reason}`)
  // Each side ends with a newline so the end marker merges as a whole line.
  const result = threeWayMerge({
    ours: `${found.block}\n`,
    base: `${base.content.toString('utf8')}\n`,
    theirs: `${block}\n`,
    labels: mergeLabels(context, `${path} managed block`, base.commit)
  })
  if (!result.clean) return conflictStep(context, path, lockHash, base, ours, result, 'local edits to the managed block conflict with the upstream change')
  const merged = result.content.toString('utf8').replace(/\n$/, '')
  const check = findManagedBlock(`${found.before}${merged}${found.after}`)
  if (!check || check.error || check.block !== merged) {
    return conflictStep(context, path, lockHash, base, ours, { binary: false, content: Buffer.from(merged) }, 'the merged managed block lost its markers')
  }
  if (merged === found.block) return { path, action: 'unchanged', lock: sha256(block), note: 'local edits kept; no upstream change to merge' }
  return { path, action: 'merge', write: Buffer.from(`${found.before}${merged}${found.after}`), lock: sha256(block), note: 'local edits merged with the upstream change' }
}

function planRemoval(context, path, lockHash) {
  const current = currentContent(context.target, path)
  if (current === null) return { path, action: 'forget', lock: null }
  if (sha256(current) === lockHash || context.force) return { path, action: 'remove', remove: true, lock: null }
  return { path, action: 'keep-edited', lock: null, note: 'no longer installed but edited locally; now unmanaged' }
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

function cannotInstall(problems) {
  return new InstallError(`Cannot install this selection:\n${problems.map(problem => `- ${problem}`).join('\n')}`)
}

// Requested pack names for a profile (from this source) or an explicit list.
export function requestedPacks({ profile = null, packs = null }) {
  if (profile) {
    const profiles = loadProfiles()
    const found = profiles.get(profile)
    if (!found) throw new InstallError(`Unknown profile ${profile}; available: ${[...profiles.keys()].join(', ') || 'none'}`)
    if (found.error || !Array.isArray(found.data?.packs)) throw new InstallError(`${found.label}: ${found.error ?? 'packs must be a list'}`)
    return found.data.packs
  }
  if (typeof packs === 'string') return packs.split(',').map(name => name.trim()).filter(Boolean)
  return packNames(packs) ?? []
}

// Plans an install or update without writing. `profile` or `packs` (names or
// { name } objects; an empty list installs the core only) selects the catalog.
// With `merge`, edited files are three-way merged against `baseOutputs`: a
// renderAtCommit result or a Map of commit -> result. `source` is
// { repo, ref, commit } for the lock; it defaults to this checkout.
export function planInstall({ target, profile = null, packs = null, force = false, merge = false, baseOutputs = null, source = null } = {}) {
  if (!target) throw new InstallError('A target directory is required')
  const absolute = resolve(target)
  if (!existsSync(absolute) || !statSync(absolute).isDirectory()) throw new InstallError(`Target ${target} is not an existing directory`)
  if (realpathSync(absolute) === realpathSync(root)) {
    throw new InstallError('The target is this repository; use pnpm sync:setup to regenerate its runtime directories')
  }

  const packMap = loadPacks()
  const requested = requestedPacks({ profile, packs })
  let catalog
  try {
    catalog = collectCatalog(resolvePacks(requested, packMap), { core: loadCore(), packs: packMap })
  } catch (error) {
    if (!(error instanceof StackError)) throw error
    throw cannotInstall(error.problems)
  }
  const problems = validatePersonas(catalog)
  if (problems.length) throw cannotInstall(problems)

  const previous = readLock(absolute)
  const lock = previous ?? emptyLock
  let outputs
  try {
    outputs = runtimeOutputs(catalog, { target: absolute, mode: 'target' })
  } catch (error) {
    throw new InstallError(`Cannot install this selection: ${error.message}`)
  }
  const composed = composeAgentsMd(catalog, { target: absolute })
  const resolvedSource = source ?? describeCheckout(root)
  const context = { target: absolute, force, merge, lock, bases: baseMap(baseOutputs), commit: resolvedSource.commit ?? null }

  const steps = [planAgentsMd(context, composed)]
  for (const [path, { content }] of [...outputs].sort(byKey)) steps.push(planFile(context, path, content))
  for (const [path, hash] of Object.entries(lock.files).sort(byKey)) {
    if (path !== 'AGENTS.md' && !outputs.has(path)) steps.push(planRemoval(context, path, hash))
  }
  steps.push(existsSync(join(absolute, copilotPath))
    ? { path: copilotPath, action: 'keep' }
    : { path: copilotPath, action: 'create', write: Buffer.from(copilotPointer) })

  const files = {}
  const bases = {}
  for (const step of steps) {
    if (step.lock) files[step.path] = step.lock
    if (step.lock && step.base) bases[step.path] = step.base
  }
  const origins = {}
  for (const [path, { source: origin }] of outputs) {
    if (files[path] && originFor(path, origin)) origins[path] = origin
  }
  const lockData = {
    lockVersion,
    source: { repo: resolvedSource.repo ?? null, ref: resolvedSource.ref ?? null, commit: resolvedSource.commit ?? null },
    profile: profile ?? null,
    packs: catalog.packs.map(pack => ({ name: pack.name, version: pack.manifest.version })),
    files,
    origins,
    bases
  }
  const lockText = serializeLock(lockData)
  return {
    target: absolute,
    profile: profile ?? null,
    requested,
    catalog,
    outputs,
    composed,
    previous,
    steps,
    source: resolvedSource,
    force,
    merge,
    lockData,
    lockText,
    lockChanged: lockText !== (previous?.text ?? null)
  }
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

// Writes a plan's files and removals, then its lock. Requires a full commit.
export function applyPlan(plan) {
  if (!commitPattern.test(plan.lockData.source.commit ?? '')) throw new InstallError(missingCommitMessage(plan.source))
  for (const step of plan.steps.filter(item => item.write || item.remove)) {
    const absolute = join(plan.target, step.path)
    if (step.remove) {
      unlinkSync(absolute)
      pruneEmptyDirectories(plan.target, step.path)
    } else {
      mkdirSync(dirname(absolute), { recursive: true })
      writeFileSync(absolute, step.write)
    }
  }
  if (plan.lockChanged) writeLock(plan.target, plan.lockData)
  return plan
}

// ---------------------------------------------------------------------------
// Reporting shared by install.mjs and cli.mjs

function sourceLabel(source) {
  if (!source?.commit) return 'swe-agents (commit unknown)'
  const where = [source.ref, source.repo].filter(Boolean).join(', ')
  return `swe-agents@${short(source.commit)}${where ? ` (${where})` : ''}`
}

export function changeCount(plan) {
  return plan.steps.filter(step => step.write || step.remove).length + (plan.lockChanged ? 1 : 0)
}

export function reportPlan(plan, { command = 'install', dryRun = false, targetLabel = plan.target, log = console.log, extra = [] } = {}) {
  log(`swe-agents ${command}${dryRun ? ' (dry run)' : ''}`)
  log(`  target:  ${targetLabel}`)
  log(`  request: ${plan.profile ? `profile ${plan.profile}` : `packs ${plan.requested.join(', ') || '(core only)'}`}`)
  log(`  packs:   ${plan.catalog.packs.map(pack => `${pack.name}@${pack.manifest.version}`).join(', ') || 'none (core only)'}`)
  log(`  source:  ${sourceLabel(plan.source)}`)
  for (const line of extra) log(`  ${line}`)
  log(`  catalog: ${plan.catalog.agents.size} personas, ${plan.catalog.skills.size} skills`)
  log('')
  for (const step of plan.steps) {
    if ((step.action === 'unchanged' && !step.note) || step.action === 'keep') continue
    log(`  ${step.action.padEnd(13)} ${step.path}${step.note ? `  (${step.note})` : ''}`)
  }
  if (plan.lockChanged) log(`  ${(plan.previous === null ? 'create' : 'update').padEnd(13)} ${lockPath}`)
  const counts = {}
  for (const step of plan.steps) counts[step.action] = (counts[step.action] ?? 0) + 1
  log(`\nSummary: ${Object.entries(counts).map(([action, count]) => `${count} ${action}`).join(', ')}`)
  if (plan.source?.dirty) {
    log('\nNote: the source checkout has uncommitted changes under core/, stacks/, profiles/, or scripts/. The lock records HEAD, so a later update cannot merge files rendered from those changes.')
  }
}

function unresolvedLinks(plan) {
  const installed = new Set([...plan.outputs.keys(), 'AGENTS.md', copilotPath])
  const unresolved = new Set()
  const markdown = [
    ['AGENTS.md', 'core and pack AGENTS.md', Buffer.from(plan.composed.fresh)],
    ...[...plan.outputs].filter(([path]) => path.endsWith('.md')).map(([path, { content, source }]) => [path, source, content])
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
      if (!installed.has(resolved) && !existsSync(join(plan.target, resolved))) unresolved.add(`${resolved} (linked from ${source})`)
    }
  }
  return unresolved
}

export function reportOutcome(plan, { command = 'install', dryRun = false, log = console.log, sourceDir = plan.source?.dir ?? root, links = true, routing = true } = {}) {
  const conflicts = plan.steps.filter(step => step.action === 'skip-conflict')
  const skipped = plan.steps.filter(step => step.action.startsWith('skip') && step.action !== 'skip-conflict')
  const released = plan.steps.filter(step => step.action === 'keep-edited')
  if (conflicts.length) {
    log(`\n${conflicts.length} file(s) conflict with the upstream change; nothing was written to them:`)
    for (const step of conflicts) {
      const origin = plan.lockData.origins[step.path]
      log(`  ${step.path}${origin ? `  (origin ${origin})` : ''}`)
      for (const line of step.conflict?.hunks ?? []) log(`    ${line}`)
      if (origin && step.conflict?.baseCommit && plan.source?.commit) {
        log(`    upstream change: git -C ${sourceDir} diff ${short(step.conflict.baseCommit)} ${short(plan.source.commit)} -- ${origin}`)
      }
    }
    log(`Edit each file so it keeps the local intent and carries the upstream change, then rerun ${command}; it then merges against the new version. --force replaces the files with the upstream version instead.`)
  }
  if (skipped.length) {
    log(`\nSkipped ${skipped.length} file(s) to protect local content; review them, then rerun with --force to overwrite:`)
    for (const step of skipped) log(`  ${step.path}: ${step.note}`)
  }
  if (released.length) {
    log(`\nLeft ${released.length} edited file(s) that this selection no longer installs; they are now unmanaged, so delete them if unneeded:`)
    for (const step of released) log(`  ${step.path}`)
  }
  if (plan.previous?.ignored?.length) log(`\nIgnored ${plan.previous.ignored.length} lock entr(ies) outside the installer's paths: ${plan.previous.ignored.join(', ')}`)
  for (const name of ['CLAUDE.md', 'CLAUDE.local.md']) {
    if (existsSync(join(plan.target, name))) log(`\nWarning: ${name} exists; Claude Code then skips AGENTS.md by default. Fold its content into AGENTS.md.`)
  }
  if (links) {
    const unresolved = unresolvedLinks(plan)
    if (unresolved.size) {
      log(`\nNote: ${unresolved.size} relative link target(s) do not exist in the target:`)
      for (const item of unresolved) log(`  ${item}`)
    }
  }
  if (routing) {
    log('\nRouting table for the installed personas (paste into your routing guide):\n')
    log(routingTable(routingRows(plan.catalog, root)))
  }
  const count = changeCount(plan)
  log('')
  if (dryRun) log(count ? `Result (dry run): ${count} change(s) planned; nothing written` : 'Result (dry run): no changes')
  else log(count ? `Result: ${count} change(s) written` : 'Result: no changes')
}

// `install`: plan, report, and write. Returns the exit code.
export function runInstall({ target, targetLabel = target, profile = null, packs = null, force = false, dryRun = false, source = null, log = console.log }) {
  if (!existsSync(target) || !statSync(target).isDirectory()) throw new InstallError(`Target ${targetLabel} is not an existing directory`)
  const plan = planInstall({ target, profile, packs, force, source })
  if (!dryRun && !commitPattern.test(plan.lockData.source.commit ?? '')) throw new InstallError(missingCommitMessage(plan.source))
  reportPlan(plan, { command: 'install', dryRun, targetLabel, log })
  if (!dryRun) applyPlan(plan)
  reportOutcome(plan, { command: 'install', dryRun, log })
  return 0
}

// `update`: reinstall the locked selection from `source`, three-way merging
// edited files against the rendering at the lock's commit unless `merge` is
// false. Returns 2 when any file still needs a human decision, else 0.
export async function runUpdate({ target, targetLabel = target, source, force = false, merge = true, dryRun = false, log = console.log }) {
  const absolute = resolve(target)
  const previous = readLock(absolute)
  if (!previous) throw new InstallError(`${lockPath} not found in ${targetLabel}; run swe-agents init or install first`)
  const selection = previous.profile ? { profile: previous.profile } : { packs: previous.packs.map(pack => pack.name) }
  const bases = new Map()
  const extra = [`from:    ${previous.source.commit ? short(previous.source.commit) : 'unknown commit'} (lock version ${previous.lockVersion})`]
  if (force) extra.push('merge:   off (--force replaces edited files)')
  else if (!merge) extra.push('merge:   off (--no-merge)')
  else if (previous.lockVersion < 2) {
    extra.push('merge:   off for this run: a version 1 lock records no origins; this update writes a version 2 lock')
  } else if (!previous.source.commit) {
    extra.push('merge:   off: the lock has no source commit')
  } else {
    const commits = [...new Set([previous.source.commit, ...Object.values(previous.bases).map(entry => entry.commit)])]
    const reasons = []
    for (const commit of commits) {
      const { render, reason } = await renderAtCommitDetailed({
        commit, packs: previous.packs.map(pack => pack.name), profile: previous.profile, target: absolute, sourceDir: source?.dir ?? root
      })
      if (render) bases.set(commit, render)
      else reasons.push(reason)
    }
    extra.push(bases.has(previous.source.commit)
      ? `merge:   three-way against ${short(previous.source.commit)}`
      : `merge:   unavailable (${reasons.join('; ')}); edited files are skipped`)
  }
  const plan = planInstall({ target: absolute, ...selection, force, merge: merge && !force, baseOutputs: bases, source })
  if (!dryRun && !commitPattern.test(plan.lockData.source.commit ?? '')) throw new InstallError(missingCommitMessage(plan.source))
  reportPlan(plan, { command: 'update', dryRun, targetLabel, log, extra })
  if (!dryRun) applyPlan(plan)
  reportOutcome(plan, { command: 'update', dryRun, log, sourceDir: source?.dir ?? root, links: false, routing: false })
  return plan.steps.some(step => step.action.startsWith('skip')) ? 2 : 0
}
