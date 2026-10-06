import { existsSync, lstatSync, readdirSync, readFileSync } from 'node:fs'
import { basename, dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

export function walk(start, predicate = () => true) {
  if (!existsSync(start)) return []
  const files = []
  for (const entry of readdirSync(start).sort()) {
    if (entry === 'node_modules' || entry === '.git') continue
    const path = join(start, entry)
    const stats = lstatSync(path)
    if (stats.isSymbolicLink()) continue
    if (stats.isDirectory()) files.push(...walk(path, predicate))
    else if (predicate(path)) files.push(path)
  }
  return files
}

export function symbolicLinks(start) {
  if (!existsSync(start)) return []
  const links = []
  for (const entry of readdirSync(start).sort()) {
    if (entry === 'node_modules' || entry === '.git') continue
    const path = join(start, entry)
    const stats = lstatSync(path)
    if (stats.isSymbolicLink()) links.push(path)
    else if (stats.isDirectory()) links.push(...symbolicLinks(path))
  }
  return links
}

export function markdownFiles() {
  return walk(root, path => path.endsWith('.md'))
}

export function read(path) {
  return readFileSync(path, 'utf8')
}

export function label(path, base = root) {
  return relative(base, path).split('\\').join('/')
}

export function finish(title, failures, success) {
  if (failures.length > 0) {
    console.error(`${title} failed (${failures.length}):`)
    for (const failure of failures) console.error(`- ${failure}`)
    process.exit(1)
  }
  console.log(success)
}

// ---------------------------------------------------------------------------
// Frontmatter: the YAML subset personas and skills use. Scalars, quoted
// scalars, `|`/`>` block scalars, block lists (`key:` then `  - item`), flow
// lists (`[a, b]`), and one level of nested map (`metadata:`). Anything else is
// reported in `problems` instead of being guessed.

function unquote(value) {
  const text = value.trim()
  if (text.length >= 2 && text.startsWith('"') && text.endsWith('"')) {
    try {
      return JSON.parse(text)
    } catch {
      return text.slice(1, -1)
    }
  }
  if (text.length >= 2 && text.startsWith("'") && text.endsWith("'")) return text.slice(1, -1).replaceAll("''", "'")
  return text
}

function stripComment(value) {
  const text = value.trim()
  if (text.startsWith('"') || text.startsWith("'")) return text
  return text.replace(/\s+#.*$/, '').trim()
}

function splitFlow(value) {
  const items = []
  let current = ''
  let quote = null
  for (const character of value) {
    if (quote) {
      if (character === quote) quote = null
      current += character
    } else if (character === '"' || character === "'") {
      quote = character
      current += character
    } else if (character === ',') {
      items.push(current)
      current = ''
    } else current += character
  }
  items.push(current)
  return items.map(item => unquote(item)).filter(item => item !== '')
}

function scalar(value) {
  const text = stripComment(value)
  if (text.startsWith('[') && text.endsWith(']')) return splitFlow(text.slice(1, -1))
  return unquote(text)
}

function parseBlock(key, raw, block, problems) {
  const indicator = raw.match(/^([|>])[+-]?$/)
  const content = block.filter(line => line.trim() !== '')
  if (indicator) {
    const indent = Math.min(...content.map(line => line.match(/^\s*/)[0].length))
    const lines = block.map(line => line.slice(Math.min(indent, line.length)))
    const text = indicator[1] === '|' ? lines.join('\n') : lines.map(line => line.trim()).join(' ').replace(/ {2,}/g, ' ')
    return text.trim()
  }
  if (raw !== '') {
    // A plain scalar may continue on more-indented lines; YAML folds them with spaces.
    const value = scalar(raw)
    if (!content.length) return value
    if (Array.isArray(value)) {
      problems.push(`${key}: unexpected lines after a flow list`)
      return value
    }
    return [value, ...content.map(line => line.trim())].join(' ')
  }
  if (!content.length) return ''
  if (/^\s*-(\s|$)/.test(content[0])) {
    const items = []
    for (const line of content) {
      const item = line.match(/^\s*-(?:\s+(.*))?$/)
      if (!item) problems.push(`${key}: unsupported list line "${line.trim()}"`)
      else items.push(scalar(item[1] ?? ''))
    }
    return items
  }
  const map = {}
  for (const line of content) {
    const entry = line.match(/^\s+([A-Za-z0-9_][A-Za-z0-9_.-]*):(?:\s+(.*))?$/)
    if (!entry) problems.push(`${key}: unsupported nested line "${line.trim()}"`)
    else map[entry[1]] = scalar(entry[2] ?? '')
  }
  return map
}

export function parseFrontmatterText(text) {
  const content = text.replace(/^\uFEFF/, '')
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  if (!match) return { content, data: null, body: content, frontmatter: null, problems: [] }
  const lines = match[1].split(/\r?\n/)
  const data = {}
  const problems = []
  let index = 0
  while (index < lines.length) {
    const line = lines[index]
    index += 1
    if (!line.trim() || /^\s*#/.test(line)) continue
    const field = line.match(/^([A-Za-z][A-Za-z0-9_-]*):(?:[ \t]+(.*?))?[ \t]*$/)
    if (!field) {
      problems.push(`unsupported frontmatter line "${line.trim()}"`)
      continue
    }
    const raw = (field[2] ?? '').trim()
    const block = []
    // Indented lines belong to this key; so do column-0 list items after an empty value.
    while (index < lines.length) {
      const next = lines[index]
      const belongs = next.trim() === '' || /^[ \t]/.test(next) || (raw === '' && /^-(\s|$)/.test(next))
      if (!belongs) break
      block.push(next)
      index += 1
    }
    while (block.length && block.at(-1).trim() === '') block.pop()
    if (Object.hasOwn(data, field[1])) problems.push(`duplicate frontmatter field ${field[1]}`)
    data[field[1]] = parseBlock(field[1], raw, block, problems)
  }
  return { content, data, body: content.slice(match[0].length), frontmatter: match[1], problems }
}

export function parseFrontmatter(path) {
  return parseFrontmatterText(read(path))
}

// Accepts a parsed list, a comma-separated string (`Read, Grep`), or a flow list string.
export function listValue(value) {
  if (value === undefined || value === null) return null
  if (Array.isArray(value)) return value.map(item => String(item).trim()).filter(Boolean)
  if (typeof value !== 'string') return null
  const text = value.trim().replace(/^\[|\]$/g, '')
  return splitFlow(text).map(item => item.trim()).filter(Boolean)
}

// ---------------------------------------------------------------------------
// Tools: canonical personas use Claude Code tool names directly.

export const claudeTools = ['Read', 'Grep', 'Glob', 'Bash', 'Edit', 'Write', 'NotebookEdit', 'WebFetch', 'WebSearch', 'Agent']
export const editTools = ['Edit', 'Write', 'NotebookEdit']

// Omitted tools grant every tool; a declared list without an edit tool is read-only.
export function readOnlyFor(tools) {
  if (tools === null || tools === undefined) return false
  return !tools.some(tool => editTools.includes(tool))
}

// ---------------------------------------------------------------------------
// Catalog: core and stack packs.

export const packKinds = ['language', 'framework', 'platform', 'verification']
export const namePattern = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/
export const semverPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/

// Dot entries, such as editor or operating-system metadata, are never catalog content.
export function isHidden(path, base) {
  return relative(base, path).split(/[\\/]/).some(segment => segment.startsWith('.'))
}

function directoryEntries(directory) {
  if (!existsSync(directory)) return []
  return readdirSync(directory).filter(entry => !entry.startsWith('.')).sort().map(entry => {
    const path = join(directory, entry)
    return { entry, path, stats: lstatSync(path) }
  })
}

function agentEntries(directory, pack, base) {
  return directoryEntries(directory)
    .filter(({ entry, stats }) => stats.isFile() && entry.endsWith('.md'))
    .map(({ path }) => ({ kind: 'agent', name: basename(path, '.md'), pack, source: path, label: label(path, base) }))
}

function skillEntries(directory, pack, base) {
  return directoryEntries(directory)
    .filter(({ stats }) => stats.isDirectory())
    .map(({ entry, path }) => ({
      kind: 'skill',
      name: entry,
      pack,
      dir: path,
      dirLabel: label(path, base),
      source: join(path, 'SKILL.md'),
      label: label(join(path, 'SKILL.md'), base),
      files: walk(path, file => !isHidden(file, path))
    }))
}

export function loadCore(base = root) {
  const dir = join(base, 'core')
  return {
    dir,
    exists: existsSync(dir),
    agentsMd: join(dir, 'AGENTS.md'),
    agents: agentEntries(join(dir, 'agents'), null, base),
    skills: skillEntries(join(dir, 'skills'), null, base)
  }
}

export function loadPacks(base = root) {
  const packs = new Map()
  for (const { entry, path, stats } of directoryEntries(join(base, 'stacks'))) {
    if (!stats.isDirectory()) continue
    const manifestPath = join(path, 'pack.json')
    const pack = {
      name: entry,
      dir: path,
      dirLabel: label(path, base),
      manifestPath,
      manifest: null,
      error: null,
      agentsMd: join(path, 'AGENTS.md'),
      agents: agentEntries(join(path, 'agents'), entry, base),
      skills: skillEntries(join(path, 'skills'), entry, base)
    }
    if (!existsSync(manifestPath)) pack.error = 'missing pack.json'
    else {
      try {
        pack.manifest = JSON.parse(read(manifestPath))
        if (!pack.manifest || typeof pack.manifest !== 'object' || Array.isArray(pack.manifest)) {
          pack.manifest = null
          pack.error = 'pack.json must contain a JSON object'
        }
      } catch (error) {
        pack.error = `invalid pack.json (${error.message})`
      }
    }
    packs.set(entry, pack)
  }
  return packs
}

export function loadProfiles(base = root) {
  const profiles = new Map()
  for (const { entry, path, stats } of directoryEntries(join(base, 'profiles'))) {
    if (!stats.isFile() || !entry.endsWith('.json')) continue
    const profile = { name: basename(entry, '.json'), path, label: label(path, base), data: null, error: null }
    try {
      profile.data = JSON.parse(read(path))
    } catch (error) {
      profile.error = `invalid JSON (${error.message})`
    }
    profiles.set(profile.name, profile)
  }
  return profiles
}

export function arrayOf(value) {
  return Array.isArray(value) ? value.filter(item => typeof item === 'string') : []
}

export class StackError extends Error {
  constructor(problems) {
    super(problems.join('\n'))
    this.problems = problems
  }
}

// Orders packs so that every pack follows the packs it requires. Throws a
// StackError listing unknown packs, invalid manifests, cycles, and conflicts.
export function resolvePacks(names, packs = loadPacks()) {
  const order = []
  const problems = []
  const state = new Map()
  const visit = (name, trail) => {
    if (state.get(name) === 'done') return
    if (state.get(name) === 'visiting') {
      problems.push(`dependency cycle: ${[...trail.slice(trail.indexOf(name)), name].join(' -> ')}`)
      return
    }
    const pack = packs.get(name)
    const requiredBy = trail.length ? ` (required by ${trail.at(-1)})` : ''
    if (!pack) {
      problems.push(`unknown pack ${name}${requiredBy}`)
      return
    }
    if (!pack.manifest) {
      problems.push(`pack ${name} has an unusable manifest: ${pack.error}`)
      return
    }
    state.set(name, 'visiting')
    for (const dependency of arrayOf(pack.manifest.requires)) visit(dependency, [...trail, name])
    state.set(name, 'done')
    order.push(name)
  }
  for (const name of names) visit(name, [])
  const selected = new Set(order)
  const reported = new Set()
  for (const name of order) {
    for (const other of arrayOf(packs.get(name).manifest.conflicts)) {
      const key = [name, other].sort().join(' and ')
      if (selected.has(other) && !reported.has(key)) {
        reported.add(key)
        problems.push(`packs ${key} conflict and cannot be installed together`)
      }
    }
  }
  if (problems.length) throw new StackError([...new Set(problems)])
  return order
}

// Every pack a pack depends on, itself included; tolerant of broken manifests.
export function packChain(name, packs) {
  try {
    return resolvePacks([name], packs)
  } catch {
    return [name, ...arrayOf(packs.get(name)?.manifest?.requires)]
  }
}

export function duplicateProblems(entries) {
  const problems = []
  for (const kind of ['agent', 'skill']) {
    const seen = new Map()
    for (const entry of entries.filter(item => item.kind === kind)) {
      if (seen.has(entry.name)) {
        problems.push(`duplicate ${kind === 'agent' ? 'persona' : 'skill'} name ${entry.name}: ${seen.get(entry.name).label} and ${entry.label}`)
      } else seen.set(entry.name, entry)
    }
  }
  return problems
}

// Core plus the named packs (already resolved), keyed by persona and skill name.
export function collectCatalog(packNames, { core = loadCore(), packs = loadPacks() } = {}) {
  const selected = packNames.map(name => {
    const pack = packs.get(name)
    if (!pack) throw new StackError([`unknown pack ${name}`])
    return pack
  })
  const entries = [...core.agents, ...core.skills, ...selected.flatMap(pack => [...pack.agents, ...pack.skills])]
  const problems = duplicateProblems(entries)
  if (problems.length) throw new StackError(problems)
  return {
    core,
    packs: selected,
    agents: new Map(entries.filter(entry => entry.kind === 'agent').map(entry => [entry.name, entry])),
    skills: new Map(entries.filter(entry => entry.kind === 'skill').map(entry => [entry.name, entry]))
  }
}

// Names a core persona may use (core only) or a pack persona may use (core,
// its own pack, and every pack in its `requires` chain).
export function scopeFor(pack, kind, { core, packs }) {
  const names = new Set(core[kind].map(entry => entry.name))
  if (pack === null) return names
  for (const name of packChain(pack, packs)) {
    for (const entry of packs.get(name)?.[kind] ?? []) names.add(entry.name)
  }
  return names
}

// Every persona and skill across core and all packs, for whole-repository checks.
export function allEntries(base = root) {
  const core = loadCore(base)
  const packs = loadPacks(base)
  return {
    core,
    packs,
    agents: [...core.agents, ...[...packs.values()].flatMap(pack => pack.agents)],
    skills: [...core.skills, ...[...packs.values()].flatMap(pack => pack.skills)]
  }
}

// Leading backticked names of the top-level bullets in a `## Related Skills` section.
export function relatedSkillBullets(content) {
  const section = content.replace(/\r\n/g, '\n').match(/^## Related Skills[ \t]*\n([\s\S]*?)(?=^## |(?![\s\S]))/m)
  if (!section) return null
  return section[1].split('\n').filter(line => line.startsWith('- ')).map(line => ({
    line,
    name: line.match(/^- `([^`]+)`/)?.[1] ?? null
  }))
}
