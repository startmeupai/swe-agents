import { spawnSync } from 'node:child_process'
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, posix, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { namePattern, parseFrontmatterText, root as ownRoot } from '../checks/lib.mjs'
import { sanitizationFindings } from '../checks/check-sanitization.mjs'
import { secretFindings } from '../checks/check-secrets.mjs'
import { findManagedBlock, normalized, runtimeDirectories, sha256 } from './engine.mjs'

// `swe-agents contribute`: turns local edits to installed personas and skills,
// plus adopter-authored ones, into a reviewable bundle of patches against the
// canonical files of the source checkout. Local only: never pushes, never calls gh.

const usage = `Usage: node scripts/stacks/contribute.mjs [--target <dir>] [--slug <name>] [--base <branch>] [--apply] [--dry-run]

  --target <dir>    Adopting repository with .agents/stacks.lock.json
                    (default: the current directory).
  --slug <name>     Bundle and branch name (default: <YYYYMMDD>-<target name>).
  --base <branch>   Upstream integration branch the change targets (default: test).
  --apply           In the source checkout, create contrib/<slug> from the
                    fetched base branch and apply the bundle to canonical paths.
  --dry-run         Print the item table; write nothing.

Exit codes: 0 bundle written, 1 error or secret found, 2 nothing to contribute
or a finding that needs a human decision.`

const defaultLockPath = '.agents/stacks.lock.json'
const bundleDirectory = '.agents/contributions'
const upstreamRepository = 'startmeupai/swe-agents'
const commitPattern = /^[0-9a-f]{40}$/
const originPattern = /^(?:core|stacks\/[a-z0-9][a-z0-9-]*)\/(?:agents|skills)\/[^/]/
const slugPattern = /^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/
// Names too generic to flag as an adopter's project name.
const genericNames = new Set([
  'example-app', 'exampleapp', 'project-alpha', 'swe-agents', 'repo', 'project', 'service', 'backend', 'frontend',
  'server', 'client', 'website', 'monorepo', 'workspace', 'source', 'code', 'main', 'test', 'demo', 'agents'
])

class ContributeError extends Error {
  constructor(message, exitCode = 1) {
    super(message)
    this.exitCode = exitCode
  }
}

const byText = (left, right) => (left < right ? -1 : left > right ? 1 : 0)

function run(command, args, { cwd } = {}) {
  // Never block on a credential prompt; a failed fetch reports git's message instead.
  const env = { ...process.env, GIT_TERMINAL_PROMPT: '0' }
  const result = spawnSync(command, args, { cwd, env, maxBuffer: 256 * 1024 * 1024, windowsHide: true })
  if (result.error) {
    if (result.error.code === 'ENOENT') throw new ContributeError(`${command} is required but was not found on PATH`)
    throw result.error
  }
  return { status: result.status, stdout: result.stdout ?? Buffer.alloc(0), stderr: (result.stderr ?? '').toString('utf8').trim() }
}

function git(args, cwd) {
  return run('git', ['-c', 'core.autocrlf=false', '-c', 'core.quotepath=false', ...args], { cwd })
}

function gitText(args, cwd) {
  const result = git(args, cwd)
  return result.status === 0 ? result.stdout.toString('utf8').trim() : null
}

function samePath(left, right) {
  try {
    return realpathSync(left) === realpathSync(right)
  } catch {
    return false
  }
}

function hasNul(buffer) {
  return buffer.subarray(0, 8000).includes(0)
}

function safeRelative(path) {
  return typeof path === 'string' && path !== '' && !path.includes('\\') && posix.normalize(path) === path &&
    !path.startsWith('../') && path !== '..' && !posix.isAbsolute(path)
}

function isComposed(path) {
  return path === 'AGENTS.md' || path === '.github/copilot-instructions.md' || path.startsWith('.codex/')
}

function packOfOrigin(origin) {
  return origin.match(/^stacks\/([^/]+)\//)?.[1] ?? null
}

function patchName(origin) {
  return `patches/${origin.split('/').join('__')}.patch`
}

// .claude/ copies are the content source of truth, then .agents/, then .github/.
function familyRank(path) {
  if (path.startsWith('.claude/')) return 0
  if (path.startsWith('.agents/')) return 1
  if (path.startsWith('.github/')) return 2
  return 3
}

// ---------------------------------------------------------------------------
// Lock

function readLockFile(target, lockRelative) {
  const path = join(target, lockRelative)
  if (!existsSync(path)) {
    throw new ContributeError(`${lockRelative} not found in the target; install swe-agents there first`, 2)
  }
  let lock
  try {
    lock = JSON.parse(readFileSync(path, 'utf8'))
  } catch (error) {
    throw new ContributeError(`${lockRelative}: invalid JSON (${error.message})`)
  }
  if (!lock || typeof lock !== 'object' || Array.isArray(lock)) throw new ContributeError(`${lockRelative}: expected a JSON object`)
  const version = lock.lockVersion ?? 1
  if (version !== 1 && version !== 2) throw new ContributeError(`${lockRelative}: unsupported lockVersion ${version}; update swe-agents`)
  const files = new Map()
  for (const [file, hash] of Object.entries(lock.files ?? {})) {
    if (safeRelative(file) && typeof hash === 'string' && /^[0-9a-f]{64}$/.test(hash)) files.set(file, hash)
  }
  const origins = new Map()
  for (const [file, origin] of Object.entries(version === 2 ? lock.origins ?? {} : {})) {
    if (files.has(file) && safeRelative(origin) && originPattern.test(origin)) origins.set(file, origin)
  }
  // Paths still waiting on an older merge base after a skipped update conflict (installer `bases`).
  const pending = new Set()
  for (const [file, entry] of Object.entries(version === 2 && lock.bases && typeof lock.bases === 'object' ? lock.bases : {})) {
    if (files.has(file) && entry && typeof entry === 'object') pending.add(file)
  }
  const packs = (Array.isArray(lock.packs) ? lock.packs : [])
    .map(pack => (typeof pack === 'string' ? pack : pack?.name))
    .filter(name => typeof name === 'string' && namePattern.test(name))
  const source = lock.source && typeof lock.source === 'object' ? lock.source : {}
  return {
    version,
    files,
    origins,
    pending,
    packs,
    profile: typeof lock.profile === 'string' ? lock.profile : null,
    source: {
      repo: typeof source.repo === 'string' ? source.repo : null,
      ref: typeof source.ref === 'string' ? source.ref : null,
      commit: typeof source.commit === 'string' && commitPattern.test(source.commit) ? source.commit : null
    }
  }
}

// ---------------------------------------------------------------------------
// Pristine rendered content at the lock commit

function ensureCommit(root, commit) {
  if (git(['cat-file', '-e', `${commit}^{commit}`], root).status === 0) return
  git(['fetch', '--quiet', 'origin', commit], root)
  if (git(['cat-file', '-e', `${commit}^{commit}`], root).status !== 0) {
    throw new ContributeError(`The lock's source commit ${commit.slice(0, 12)} is not in the source checkout; fetch it there first`)
  }
}

// Renders the installed outputs as they were at `commit` from a temporary worktree.
async function renderInWorktree({ root, commit, packs, target }) {
  const directory = mkdtempSync(join(tmpdir(), 'swe-agents-base-'))
  const worktree = join(directory, 'source')
  try {
    const added = git(['worktree', 'add', '--detach', '--quiet', worktree, commit], root)
    if (added.status !== 0) throw new ContributeError(`Cannot check out ${commit.slice(0, 12)} in a temporary worktree: ${added.stderr}`)
    const enginePath = join(worktree, 'scripts/stacks/engine.mjs')
    const libraryPath = join(worktree, 'scripts/checks/lib.mjs')
    if (!existsSync(enginePath) || !existsSync(libraryPath)) return null
    const library = await import(pathToFileURL(libraryPath).href)
    const engine = await import(pathToFileURL(enginePath).href)
    const catalogPacks = library.loadPacks(worktree)
    const catalog = library.collectCatalog(library.resolvePacks(packs, catalogPacks), { core: library.loadCore(worktree), packs: catalogPacks })
    return { outputs: engine.runtimeOutputs(catalog, { target, mode: 'target' }) }
  } finally {
    git(['worktree', 'remove', '--force', worktree], root)
    rmSync(directory, { recursive: true, force: true })
    git(['worktree', 'prune'], root)
  }
}

// Prefers the installer's renderer (shared with `update`); falls back to a local
// worktree render when the installer module is unavailable.
async function renderBase({ root, commit, packs, profile, target }) {
  let installer = null
  try {
    installer = await import('./installer.mjs')
  } catch (error) {
    if (error?.code !== 'ERR_MODULE_NOT_FOUND') console.error(`Note: installer.mjs could not be loaded (${error.message}); rendering the base directly`)
  }
  if (typeof installer?.renderAtCommitDetailed === 'function') {
    const { render, reason } = await installer.renderAtCommitDetailed({ commit, packs, profile, target, sourceDir: root })
    if (render?.outputs instanceof Map) return { outputs: render.outputs }
    throw new ContributeError(`Cannot render the installed files at ${commit.slice(0, 12)}: ${reason ?? 'unknown reason'}`, /predates/.test(reason ?? '') ? 2 : 1)
  }
  if (typeof installer?.renderAtCommit === 'function' && samePath(root, ownRoot)) {
    const rendered = await installer.renderAtCommit({ commit, packs, profile, target })
    const outputs = rendered instanceof Map ? rendered : rendered?.outputs
    if (outputs instanceof Map) return { outputs }
  }
  return renderInWorktree({ root, commit, packs, target })
}

// ---------------------------------------------------------------------------
// Diffs

// Unified diff of `before` -> `after`, labelled with the canonical `origin` path.
function unifiedDiff(before, after, origin, scratch) {
  const directory = mkdtempSync(join(scratch, 'diff-'))
  writeFileSync(join(directory, 'before'), before)
  writeFileSync(join(directory, 'after'), after)
  const result = git(['diff', '--no-index', '--no-color', '--no-ext-diff', '--no-renames', '--full-index', '-U3', 'before', 'after'], directory)
  rmSync(directory, { recursive: true, force: true })
  if (result.status === 0) return null
  if (result.status !== 1) throw new ContributeError(`git diff failed for ${origin}: ${result.stderr}`)
  const lines = result.stdout.toString('utf8').split('\n')
  const start = lines.findIndex(line => line.startsWith('@@'))
  if (start === -1) return null
  const index = lines.slice(0, start).find(line => line.startsWith('index '))?.match(/^index ([0-9a-f]+)\.\.([0-9a-f]+)(?: (\d+))?$/)
  const header = [`diff --git a/${origin} b/${origin}`]
  if (index) header.push(`index ${index[1]}..${index[2]} ${index[3] ?? '100644'}`)
  header.push(`--- a/${origin}`, `+++ b/${origin}`)
  const body = lines.slice(start).join('\n')
  return `${header.join('\n')}\n${body.endsWith('\n') ? body : `${body}\n`}`
}

// Carries the adopter's change from the rendered copy onto the canonical file.
function mergeOntoCanonical(canonical, base, current, scratch) {
  const directory = mkdtempSync(join(scratch, 'merge-'))
  const paths = ['canonical', 'base', 'current'].map(name => join(directory, name))
  writeFileSync(paths[0], canonical)
  writeFileSync(paths[1], base)
  writeFileSync(paths[2], current)
  const result = git(['merge-file', '-p', '-L', 'canonical', '-L', 'installed', '-L', 'adopter', ...paths], directory)
  rmSync(directory, { recursive: true, force: true })
  return result.status === 0 ? result.stdout : null
}

function addedLines(patch) {
  return patch.split('\n').filter(line => line.startsWith('+') && !line.startsWith('+++')).map(line => line.slice(1)).join('\n')
}

// ---------------------------------------------------------------------------
// Scans

function projectNames(target) {
  const names = new Set([basename(resolve(target))])
  try {
    const manifest = JSON.parse(readFileSync(join(target, 'package.json'), 'utf8'))
    if (typeof manifest?.name === 'string') for (const part of manifest.name.split('/')) names.add(part.replace(/^@/, ''))
  } catch {
    // No package.json, or not JSON; nothing to add.
  }
  try {
    const name = readFileSync(join(target, 'pyproject.toml'), 'utf8').match(/^\s*name\s*=\s*["']([^"']+)["']/m)?.[1]
    if (name) names.add(name)
  } catch {
    // No pyproject.toml; nothing to add.
  }
  return [...names].map(name => name.trim().toLowerCase()).filter(name => name.length >= 4 && !genericNames.has(name))
}

function scan(item, content, pathLabel, names) {
  const sanitization = sanitizationFindings(content, pathLabel)
  const lower = content.toLowerCase()
  if (names.some(name => lower.includes(name) || pathLabel.toLowerCase().includes(name))) {
    sanitization.push(`${pathLabel}: adopter project name detected; generalize it to ExampleApp`)
  }
  const secrets = secretFindings(content, pathLabel)
  item.checks = { sanitization: sanitization.length ? 'warn' : 'pass', secrets: secrets.length ? 'fail' : 'pass' }
  item.findings = [...new Set([...secrets, ...sanitization])]
}

// ---------------------------------------------------------------------------
// Target inventory

function walkRuntime(target, directory) {
  const files = []
  const links = []
  const visit = (absolute, relativePath) => {
    for (const entry of readdirSync(absolute).sort(byText)) {
      if (entry.startsWith('.')) continue
      const path = join(absolute, entry)
      const label = `${relativePath}/${entry}`
      const stats = lstatSync(path)
      if (stats.isSymbolicLink()) links.push(label)
      else if (stats.isDirectory()) visit(path, label)
      else if (stats.isFile()) files.push(label)
    }
  }
  const start = join(target, directory)
  if (existsSync(start) && lstatSync(start).isDirectory()) visit(start, directory)
  return { files, links }
}

function readCurrent(target, path) {
  const absolute = join(target, path)
  if (!existsSync(absolute) || !statSync(absolute).isFile()) return null
  return normalized(readFileSync(absolute))
}

function installedPackFor(name, packs) {
  return [...packs].sort((left, right) => right.length - left.length).find(pack => name.startsWith(`${pack}-`)) ?? null
}

// ---------------------------------------------------------------------------
// Items

async function collectItems({ root, target, lock, scratch }) {
  const skipped = []
  const skip = (targetPath, reason) => skipped.push({ targetPath, reason })
  const origins = new Map(lock.origins)
  let rendered
  let originsDerived = 0
  const base = async () => {
    if (rendered === undefined) {
      ensureCommit(root, lock.source.commit)
      try {
        rendered = await renderBase({ root, commit: lock.source.commit, packs: lock.packs, profile: lock.profile, target })
      } catch (error) {
        if (error instanceof ContributeError) throw error
        throw new ContributeError(`Cannot render the installed files at ${lock.source.commit.slice(0, 12)}: ${error.message}`)
      }
      if (rendered === null) {
        throw new ContributeError(`The lock's source commit ${lock.source.commit.slice(0, 12)} predates the stack engine; re-run install to upgrade the lock`, 2)
      }
      // A v1 lock has no origins; the rendered outputs carry each file's canonical source.
      for (const [path, { source }] of rendered.outputs) {
        if (lock.files.has(path) && !origins.has(path) && !isComposed(path) && safeRelative(source) && originPattern.test(source)) {
          origins.set(path, source)
          originsDerived += 1
        }
      }
    }
    return rendered
  }

  // Managed files edited since the install, grouped by canonical origin.
  const edited = new Map()
  for (const [path, hash] of [...lock.files].sort(([left], [right]) => byText(left, right))) {
    if (path === 'AGENTS.md') {
      const text = readCurrent(target, path)?.toString('utf8') ?? null
      const found = text === null ? null : findManagedBlock(text)
      if (text === null) skip(path, 'deleted locally; deletions are not proposed upstream')
      else if (!found || found.error || sha256(found.block) !== hash) {
        skip(path, 'managed block edited; it is composed from the core and pack rules, so carry the change to core/AGENTS.md or the pack AGENTS.md by hand')
      }
      continue
    }
    const current = readCurrent(target, path)
    if (current === null) {
      skip(path, 'deleted locally; deletions are not proposed upstream')
      continue
    }
    if (sha256(current) === hash) continue
    if (lock.pending.has(path)) {
      skip(path, 'an update conflict is unresolved for this file; run swe-agents update, resolve it, then contribute')
      continue
    }
    if (isComposed(path)) {
      skip(path, 'composed file; carry the change to the persona it was generated from by hand')
      continue
    }
    await base()
    const origin = origins.get(path)
    if (!origin) {
      skip(path, 'no canonical origin recorded; re-run install to upgrade the lock')
      continue
    }
    if (!edited.has(origin)) edited.set(origin, [])
    edited.get(origin).push({ path, current, hash })
  }

  const items = []
  for (const [origin, copies] of [...edited].sort(([left], [right]) => byText(left, right))) {
    copies.sort((left, right) => familyRank(left.path) - familyRank(right.path) || byText(left.path, right.path))
    const [chosen, ...others] = copies
    const baseContent = (await base()).outputs.get(chosen.path)?.content ?? null
    const canonicalBlob = git(['cat-file', 'blob', `${lock.source.commit}:${origin}`], root)
    if (baseContent === null || canonicalBlob.status !== 0) {
      skip(chosen.path, `${origin} does not exist at the lock's source commit`)
      continue
    }
    const canonical = canonicalBlob.stdout
    if (hasNul(baseContent) || hasNul(chosen.current) || hasNul(canonical)) {
      skip(chosen.path, 'binary file; copy the change by hand')
      continue
    }
    const notes = []
    if (sha256(baseContent) !== chosen.hash) notes.push('the rendered base differs from the installed copy recorded in the lock; review the patch for unrelated lines')
    const merged = mergeOntoCanonical(canonical, baseContent, chosen.current, scratch)
    let patch
    let patchBase
    if (merged !== null) {
      if (merged.equals(canonical)) {
        skip(chosen.path, 'the local change disappears when mapped onto the canonical file')
        continue
      }
      patch = unifiedDiff(canonical, merged, origin, scratch)
      patchBase = 'canonical'
    } else {
      patch = unifiedDiff(baseContent, chosen.current, origin, scratch)
      patchBase = 'rendered'
      notes.push('the change overlaps lines the installer rewrites (links or frontmatter); the patch is against the installed form and may need manual application')
    }
    if (!patch) {
      skip(chosen.path, 'no textual difference from the rendered base')
      continue
    }
    if (others.length) notes.push(`also edited: ${others.map(copy => copy.path).join(', ')}; only ${chosen.path} is in the patch`)
    items.push({
      kind: 'edit',
      targetPath: chosen.path,
      origin,
      pack: packOfOrigin(origin),
      patch: patchName(origin),
      patchBase,
      decision: 'auto',
      checks: null,
      findings: [],
      notes,
      appliedCleanly: null,
      content: patch
    })
  }

  // Unmanaged files in the tool directories: adopter-authored personas and skills.
  const personas = new Map()
  const skills = new Map()
  for (const directory of runtimeDirectories) {
    const { files, links } = walkRuntime(target, directory)
    for (const link of links) skip(link, 'symbolic link; not followed')
    for (const path of files) {
      if (lock.files.has(path)) continue
      const parts = path.split('/')
      const persona = parts.length === 3 && parts[1] === 'agents' && (
        parts[0] === '.claude' ? parts[2].match(/^(.+)\.md$/)?.[1]
          : parts[0] === '.github' ? parts[2].match(/^(.+?)(?:\.agent)?\.md$/)?.[1]
            : parts[0] === '.codex' ? parts[2].match(/^(.+)\.toml$/)?.[1]?.replaceAll('_', '-')
              : undefined)
      if (persona && namePattern.test(persona)) {
        if (!personas.has(persona)) personas.set(persona, [])
        personas.get(persona).push(path)
      } else if (parts[1] === 'skills' && parts.length >= 4 && namePattern.test(parts[2])) {
        const key = `${parts[2]}/${parts.slice(3).join('/')}`
        if (!skills.has(key)) skills.set(key, { name: parts[2], suffix: parts.slice(3).join('/'), paths: [] })
        skills.get(key).paths.push(path)
      } else {
        skip(path, 'not a persona or skill file the installer recognizes')
      }
    }
  }
  const installedPacks = lock.packs
  const newItem = (targetPath, copies, proposedOrigin, pack, decision, notes) => {
    if (existsSync(join(root, proposedOrigin))) {
      decision = 'needs-decision'
      notes.push(`${proposedOrigin} already exists upstream; compare before replacing it`)
    }
    items.push({
      kind: 'new',
      targetPath,
      proposedOrigin,
      pack,
      file: `files/${proposedOrigin}`,
      decision,
      checks: null,
      findings: [],
      copies,
      notes,
      appliedCleanly: null,
      content: normalized(readFileSync(join(target, targetPath)))
    })
  }
  for (const [name, paths] of [...personas].sort(([left], [right]) => byText(left, right))) {
    paths.sort((left, right) => familyRank(left) - familyRank(right) || byText(left, right))
    const source = paths.find(path => path.endsWith('.md'))
    if (!source) {
      skip(paths[0], 'Codex-only persona; write a Markdown persona under .claude/agents/ to contribute it')
      continue
    }
    const notes = []
    const { data } = parseFrontmatterText(readFileSync(join(target, source), 'utf8'))
    if (data?.name !== name) notes.push(`frontmatter name should be ${name}`)
    if (source.startsWith('.github/')) notes.push('taken from the Copilot copy; restore its skills list before review')
    const pack = installedPackFor(name, installedPacks)
    const proposedOrigin = pack ? `stacks/${pack}/agents/${name}.md` : `core/agents/${name}.md`
    newItem(source, paths, proposedOrigin, pack, pack && !notes.length ? 'auto' : 'needs-decision', notes)
  }
  // A new file inside an installed skill joins that skill's canonical directory.
  const skillOrigins = new Map()
  if (skills.size && [...lock.files.keys()].some(path => path.split('/')[1] === 'skills' && !origins.has(path))) await base()
  for (const path of lock.files.keys()) {
    const parts = path.split('/')
    const origin = origins.get(path)
    if (parts[1] !== 'skills' || parts.length < 4 || !origin) continue
    const suffix = parts.slice(3).join('/')
    if (origin.endsWith(`/${suffix}`)) skillOrigins.set(parts[2], origin.slice(0, -(suffix.length + 1)))
  }
  for (const { name, suffix, paths } of [...skills.values()].sort((left, right) => byText(`${left.name}/${left.suffix}`, `${right.name}/${right.suffix}`))) {
    paths.sort((left, right) => familyRank(left) - familyRank(right) || byText(left, right))
    const managed = skillOrigins.get(name)
    const pack = managed ? packOfOrigin(managed) : installedPackFor(name, installedPacks)
    const directory = managed ?? (pack ? `stacks/${pack}/skills/${name}` : `core/skills/${name}`)
    newItem(paths[0], paths, `${directory}/${suffix}`, pack, managed || pack ? 'auto' : 'needs-decision', [])
  }

  const names = projectNames(target)
  for (const item of items) {
    if (item.kind === 'edit') scan(item, addedLines(item.content), item.origin, names)
    else scan(item, item.content.toString('utf8'), item.proposedOrigin, names)
  }
  return { items, skipped, originsDerived }
}

// ---------------------------------------------------------------------------
// Bundle output

function manifestItem(item) {
  const { content, ...rest } = item
  return rest
}

function itemTable(items) {
  const rows = items.map(item => [
    item.kind,
    item.decision,
    item.checks.sanitization,
    item.checks.secrets,
    `${item.targetPath} -> ${item.origin ?? item.proposedOrigin}`
  ])
  const header = ['KIND', 'DECISION', 'SANITIZATION', 'SECRETS', 'TARGET PATH -> CANONICAL PATH']
  const widths = header.map((title, column) => Math.max(title.length, ...rows.map(row => row[column].length)))
  return [header, ...rows].map(row => `  ${row.map((cell, column) => (column === row.length - 1 ? cell : cell.padEnd(widths[column]))).join('  ')}`).join('\n')
}

function escapeCell(text) {
  return String(text).replaceAll('|', '\\|')
}

function summaryMarkdown({ manifest, skipped, apply }) {
  const items = manifest.items
  const packs = [...new Set(items.map(item => item.pack).filter(Boolean))].sort(byText)
  const lines = [
    `# Contribution Bundle ${manifest.slug}`,
    '',
    'Prepared by `swe-agents contribute` from an adopting repository. Nothing here has left this',
    'machine. Review every patch and file, generalize anything project-specific, and only then',
    'apply the bundle in a swe-agents checkout.',
    '',
    '## Source',
    '',
    '| Field | Value |',
    '| --- | --- |',
    `| Repository | ${escapeCell(manifest.source.repo ?? 'unknown')} |`,
    `| Ref | ${escapeCell(manifest.source.ref ?? 'unknown')} |`,
    `| Commit | \`${manifest.source.commit}\` |`,
    `| Integration branch | \`${manifest.base}\` |`,
    `| Lock version | ${manifest.lockVersion}${manifest.originsDerived ? ' (origins derived from the rendered base)' : ''} |`,
    '',
    '## Items',
    '',
    '| Kind | Target path | Canonical path | Pack | Decision | Sanitization | Secrets | Applied |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
    ...items.map(item => `| ${item.kind} | \`${escapeCell(item.targetPath)}\` | \`${escapeCell(item.origin ?? item.proposedOrigin)}\` | ${item.pack ?? 'core'} | ${item.decision} | ${item.checks.sanitization} | ${item.checks.secrets} | ${item.appliedCleanly === null ? 'not run' : item.appliedCleanly ? 'clean' : 'needs attention'} |`)
  ]
  const notes = items.flatMap(item => [...item.findings, ...item.notes.map(note => `${item.origin ?? item.proposedOrigin}: ${note}`)])
  if (notes.length) lines.push('', '## Findings and Notes', '', ...notes.map(note => `- ${note}`))
  if (skipped.length) {
    lines.push('', '## Not Included', '', ...skipped.map(entry => `- \`${entry.targetPath}\`: ${entry.reason}`))
  }
  lines.push(
    '',
    '## Checks',
    '',
    '- Sanitization reuses the forbidden-term and absolute-path patterns of',
    '  `scripts/checks/check-sanitization.mjs`, plus the adopter project name, on added lines',
    `  and new files: ${items.filter(item => item.checks.sanitization === 'pass').length} pass, ${items.filter(item => item.checks.sanitization === 'warn').length} warn.`,
    '- Secrets reuse the patterns of `scripts/checks/check-secrets.mjs`:',
    `  ${items.filter(item => item.checks.secrets === 'pass').length} pass, ${items.filter(item => item.checks.secrets === 'fail').length} fail.`,
    '- Patches labelled `canonical` apply to the canonical file at the lock commit; patches',
    '  labelled `rendered` were computed against the installed copy and may need manual work.',
    '- These scans do not replace review: they cannot recognize every product name, customer, or',
    '  internal command.'
  )
  lines.push('', '## Next Steps', '')
  if (apply) {
    lines.push(
      `1. In the swe-agents checkout, review \`git status\` on \`${apply.branch}\`: patched files are staged and new files are untracked.`,
      '2. Resolve any conflict markers and finish every item marked "needs attention".'
    )
  } else {
    lines.push(
      '1. Review each patch under `patches/` and each file under `files/`.',
      `2. From a swe-agents checkout, run \`swe-agents contribute --target <this-repository> --slug ${manifest.slug} --apply\`.`
    )
  }
  lines.push(
    '3. Generalize project-specific names, commands, paths, and domains to `ExampleApp`,',
    '   `Project Alpha`, and `example.invalid`.',
    '4. Decide the destination of every `needs-decision` item (core or a pack).',
    '5. Bump the version and add a changelog entry for each changed pack; core-only edits need none.',
    '6. Run `pnpm sync:setup && pnpm check:all` in the swe-agents checkout.',
    `7. After explicit approval, push \`contrib/${manifest.slug}\` to your fork and open the pull request:`,
    '',
    '```bash',
    `gh pr create --repo ${upstreamRepository} --base ${manifest.base} --head <fork-owner>:contrib/${manifest.slug}`,
    '```',
    '',
    `8. Delete \`${bundleDirectory}/${manifest.slug}/\` from this repository once the pull request exists.`,
    '',
    'The branch name includes the slug; pass `--slug` with a neutral name if the default reveals',
    'the project name.',
    '',
    '## Pull Request Body Draft',
    '',
    '```markdown',
    '# Summary',
    '',
    '<!-- Explain the problem and the focused change that solves it. -->',
    '',
    'Origin: adopter repository (sanitized)',
    '',
    `Pack(s) affected: ${packs.length ? packs.join(', ') : 'none'}`,
    '',
    'Changes:',
    '',
    ...items.map(item => `- ${item.kind} \`${item.origin ?? item.proposedOrigin}\`${item.decision === 'needs-decision' ? ' (destination needs a maintainer decision)' : ''}`),
    '',
    '## Verification',
    '',
    '- [ ] `pnpm sync:setup && pnpm check:all`',
    '- [ ] Ran `pnpm check:stacks`',
    '- [ ] Each changed pack has a version bump and a changelog entry',
    '- [ ] `SOURCE_MAP.md` covers every added, removed, or renamed artifact',
    '',
    '## Safety and Scope',
    '',
    '- [ ] Project-specific names, commands, paths, and domains were generalized to `ExampleApp`,',
    '      `Project Alpha`, and `example.invalid`',
    '- [ ] No credentials, customer data, private domains, or proprietary code were added',
    '- [ ] Core files do not name a stack pack, pack persona, pack skill, or pack command',
    '',
    '## Remaining Limitations',
    '',
    '<!-- State anything that still needs verification or a maintainer decision. -->',
    '',
    'By submitting this contribution, I agree that it is licensed under the Apache License 2.0.',
    '```',
    ''
  )
  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// --apply

// Every check that can refuse --apply runs before the bundle is written.
function prepareApply({ root, base, slug }) {
  if (!samePath(gitText(['rev-parse', '--show-toplevel'], root) ?? '', root)) {
    throw new ContributeError('--apply needs the swe-agents source to be a git checkout')
  }
  if (gitText(['status', '--porcelain', '--untracked-files=no'], root)) {
    throw new ContributeError('--apply needs a clean swe-agents checkout; commit or stash its changes first')
  }
  const branch = `contrib/${slug}`
  if (git(['check-ref-format', '--branch', branch], root).status !== 0) throw new ContributeError(`${branch} is not a valid branch name; choose another --slug`)
  if (git(['rev-parse', '--verify', '--quiet', `refs/heads/${branch}`], root).status === 0) {
    throw new ContributeError(`Branch ${branch} already exists in the swe-agents checkout; delete it or choose another --slug`)
  }
  // A fork clone conventionally names the upstream repository `upstream`.
  const remote = git(['remote', 'get-url', 'upstream'], root).status === 0 ? 'upstream' : 'origin'
  const fetched = git(['fetch', '--quiet', remote, `+refs/heads/${base}:refs/remotes/${remote}/${base}`], root)
  if (fetched.status !== 0) throw new ContributeError(`Cannot fetch ${base} from ${remote}: ${fetched.stderr}`)
  return { branch, remote, baseRef: `${remote}/${base}` }
}

// Creates the contribution branch and applies each item; records what applied cleanly.
function applyItems({ root, plan, bundle, items }) {
  const switched = git(['switch', '--quiet', '--no-track', '-c', plan.branch, plan.baseRef], root)
  if (switched.status !== 0) throw new ContributeError(`Cannot create ${plan.branch} from ${plan.baseRef}: ${switched.stderr}`)
  for (const item of items) {
    if (item.kind === 'edit') {
      const applied = git(['apply', '--3way', '--whitespace=nowarn', join(bundle, item.patch)], root)
      item.appliedCleanly = applied.status === 0
      if (!item.appliedCleanly) item.notes.push(`git apply --3way did not apply cleanly: ${applied.stderr.split('\n').slice(0, 3).join(' ')}`)
    } else {
      const destination = join(root, item.proposedOrigin)
      if (existsSync(destination)) {
        item.appliedCleanly = false
        item.notes.push(`${item.proposedOrigin} already exists on ${plan.branch}; left untouched`)
      } else {
        mkdirSync(dirname(destination), { recursive: true })
        writeFileSync(destination, item.content)
        item.appliedCleanly = true
      }
    }
  }
  return plan
}

// ---------------------------------------------------------------------------
// Entry point

export async function runContribute(options = {}) {
  const root = resolve(options.root ?? ownRoot)
  const baseBranch = options.base ?? 'test'
  const caller = process.env.INIT_CWD ?? process.cwd()
  let scratch = null
  try {
    if (!options.target && samePath(caller, root)) throw new ContributeError('--target is required when running inside the swe-agents checkout')
    const target = resolve(caller, options.target ?? '.')
    if (!existsSync(target) || !statSync(target).isDirectory()) throw new ContributeError(`Target ${options.target ?? target} is not an existing directory`)
    if (samePath(target, root)) throw new ContributeError('The target is the swe-agents checkout itself; run contribute against an adopting repository')
    if (git(['rev-parse', '--git-dir'], root).status !== 0) throw new ContributeError('The swe-agents source is not a git checkout; the base at the lock commit cannot be rendered')
    if (!/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(baseBranch)) throw new ContributeError(`Invalid --base ${baseBranch}`)

    let lockRelative = defaultLockPath
    try {
      const installer = await import('./installer.mjs')
      if (typeof installer.lockPath === 'string') lockRelative = installer.lockPath
    } catch {
      // The installer module is optional here; the lock path is fixed by contract.
    }
    const lock = readLockFile(target, lockRelative)
    if (!lock.source.commit) {
      throw new ContributeError(`${lockRelative} records no source commit; re-run install from a git checkout to upgrade the lock`, 2)
    }

    const createdAt = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
    const defaultName = basename(target).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'adopter'
    const slug = options.slug ?? `${createdAt.slice(0, 10).replaceAll('-', '')}-${defaultName}`
    if (!slugPattern.test(slug) || slug.includes('..') || slug.endsWith('.lock') || slug.endsWith('.')) {
      throw new ContributeError(`Invalid --slug ${slug}; use letters, digits, ".", "_", and "-"`)
    }

    scratch = mkdtempSync(join(tmpdir(), 'swe-agents-contribute-'))
    const { items, skipped, originsDerived } = await collectItems({ root, target, lock, scratch })
    const bundleLabel = `${bundleDirectory}/${slug}/`
    const bundle = join(target, bundleDirectory, slug)
    const secretHit = items.some(item => item.checks.secrets === 'fail')
    const sanitizationHit = items.some(item => item.checks.sanitization === 'warn')

    console.log(`swe-agents contribute${options.dryRun ? ' (dry run)' : ''}`)
    console.log(`  target:  ${target}`)
    console.log(`  source:  ${lock.source.repo ?? 'unknown'}@${lock.source.commit.slice(0, 12)} (lock v${lock.version}${originsDerived ? `, ${originsDerived} origin(s) derived from the rendered base` : ''})`)
    console.log(`  base:    ${baseBranch}`)
    console.log(`  bundle:  ${bundleLabel}`)
    console.log('')
    if (items.length) console.log(itemTable(items))
    else console.log('  No edited managed files and no adopter-authored personas or skills found.')
    const findings = items.flatMap(item => item.findings)
    if (findings.length) {
      console.log('\nFindings:')
      for (const finding of findings) console.log(`  ${finding}`)
    }
    if (skipped.length) {
      console.log(`\nNot included (${skipped.length}):`)
      for (const entry of skipped) console.log(`  ${entry.targetPath}: ${entry.reason}`)
    }
    const counts = ['edit', 'new'].map(kind => `${items.filter(item => item.kind === kind).length} ${kind}`).join(', ')
    console.log(`\nSummary: ${counts}, ${skipped.length} not included`)

    const manifest = {
      bundleVersion: 1,
      slug,
      createdAt,
      source: { repo: lock.source.repo, ref: lock.source.ref, commit: lock.source.commit },
      base: baseBranch,
      lockVersion: lock.version,
      originsDerived: originsDerived > 0,
      items: items.map(manifestItem),
      skipped,
      apply: null
    }
    const result = { exitCode: 0, slug, bundle: null, manifest, items: manifest.items, skipped }

    if (secretHit) {
      console.error('\nResult: possible secret found; nothing written. Remove it from the listed files and rerun.')
      return { ...result, exitCode: 1 }
    }
    if (!items.length) {
      console.log('\nResult: nothing to contribute')
      return { ...result, exitCode: 2 }
    }
    if (options.dryRun) {
      console.log(`\nResult (dry run): ${items.length} item(s) planned; nothing written`)
      return { ...result, exitCode: sanitizationHit ? 2 : 0 }
    }

    const applyPlan = options.apply ? prepareApply({ root, base: baseBranch, slug }) : null
    if (existsSync(bundle)) {
      let ours = false
      try {
        ours = JSON.parse(readFileSync(join(bundle, 'manifest.json'), 'utf8'))?.bundleVersion === 1
      } catch {
        ours = false
      }
      if (!ours) throw new ContributeError(`${bundleLabel} exists and is not a contribution bundle; choose another --slug`)
      rmSync(bundle, { recursive: true, force: true })
    }
    for (const item of items) {
      const path = join(bundle, item.kind === 'edit' ? item.patch : item.file)
      mkdirSync(dirname(path), { recursive: true })
      writeFileSync(path, item.content)
    }
    const writeRecords = () => {
      manifest.items = items.map(manifestItem)
      writeFileSync(join(bundle, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
      writeFileSync(join(bundle, 'SUMMARY.md'), summaryMarkdown({ manifest, skipped, apply: manifest.apply }))
    }
    writeRecords()
    if (applyPlan) {
      manifest.apply = applyItems({ root, plan: applyPlan, bundle, items })
      writeRecords()
    }

    console.log(`\nResult: bundle written to ${bundleLabel}`)
    const unclean = items.filter(item => item.appliedCleanly === false)
    if (manifest.apply) {
      console.log(`\nApplied onto ${manifest.apply.branch} (from ${manifest.apply.baseRef}) in the swe-agents checkout.`)
      if (unclean.length) {
        console.log(`${unclean.length} item(s) need attention:`)
        for (const item of unclean) console.log(`  ${item.origin ?? item.proposedOrigin}: ${item.notes.at(-1)}`)
      }
      console.log('\nRemaining manual steps (nothing was pushed):')
      console.log('  1. Generalize project-specific content to ExampleApp, Project Alpha, and example.invalid.')
      console.log('  2. Bump changed pack versions and add changelog entries.')
      console.log('  3. Run pnpm sync:setup && pnpm check:all, then commit.')
      console.log(`  4. After approval, push ${manifest.apply.branch} to your fork and run:`)
      console.log(`     gh pr create --repo ${upstreamRepository} --base ${baseBranch} --head <fork-owner>:${manifest.apply.branch}`)
    } else {
      console.log(`Review ${bundleLabel}SUMMARY.md, then rerun with --apply from a swe-agents checkout.`)
    }
    return { ...result, bundle, items: manifest.items, exitCode: sanitizationHit || unclean.length ? 2 : 0 }
  } catch (error) {
    if (!(error instanceof ContributeError)) throw error
    console.error(error.message)
    return { exitCode: error.exitCode, error: error.message }
  } finally {
    if (scratch) rmSync(scratch, { recursive: true, force: true })
  }
}

function parseArguments(argv) {
  const options = { apply: false, dryRun: false }
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    const flag = argument.split('=')[0]
    if (argument === '--') continue
    if (flag === '--help' || flag === '-h') return { help: true }
    if (flag === '--apply') options.apply = true
    else if (flag === '--dry-run') options.dryRun = true
    else if (['--target', '--slug', '--base'].includes(flag)) {
      const inline = argument.indexOf('=')
      const value = inline === -1 ? argv[index + 1] : argument.slice(inline + 1)
      if (value === undefined || value === '' || (inline === -1 && value.startsWith('--'))) return { error: `${flag} needs a value` }
      if (inline === -1) index += 1
      options[flag.slice(2)] = value
    } else return { error: `Unknown argument ${argument}` }
  }
  if (options.apply && options.dryRun) return { error: 'Use either --apply or --dry-run, not both' }
  return options
}

function invokedDirectly() {
  try {
    return Boolean(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))
  } catch {
    return false
  }
}

if (invokedDirectly()) {
  const options = parseArguments(process.argv.slice(2))
  if (options.help) {
    console.log(usage)
  } else if (options.error) {
    console.error(`${options.error}\n\n${usage}`)
    process.exitCode = 1
  } else {
    process.exitCode = (await runContribute(options)).exitCode
  }
}
