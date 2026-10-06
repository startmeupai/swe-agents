import { existsSync, lstatSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import {
  StackError, allEntries, arrayOf, collectCatalog, duplicateProblems, finish, label, loadProfiles, namePattern, packKinds,
  read, resolvePacks, root, scopeFor, semverPattern
} from './lib.mjs'

// Stack packs and profiles: manifests, files, dependency graph, and profile resolution.
const failures = []
const catalog = allEntries()
const { core, packs } = catalog
const manifestFields = ['name', 'kind', 'version', 'description', 'requires', 'conflicts', 'detect', 'commands', 'agents', 'skills', 'routes']
const packEntries = ['pack.json', 'README.md', 'AGENTS.md', 'agents', 'skills']
const routeFields = ['outcome', 'owner', 'skills']
// Names that moved from the earlier single-catalog layout keep their names; new pack names use the `<pack>-` prefix.
const legacyNames = new Set([
  'cf-agent', 'e2e-hardening-agent', 'plan-hv-agent', 'playwright-generator-agent', 'playwright-healer-agent',
  'playwright-investigator-agent', 'test-and-prove-agent', 'ui-agent', 'ui-sm-agent',
  'cloudflare-ops', 'e2e-hardening', 'plan-hv-automation', 'playwright-testing', 'test-and-prove', 'ui-replication',
  'ui-sm-verification', 'ui-visual-verification'
])

function isStringList(value) {
  return Array.isArray(value) && value.every(item => typeof item === 'string' && item.trim())
}

function listProblems(where, field, value) {
  if (!isStringList(value)) return [`${where}: ${field} must be a list of non-empty strings`]
  return new Set(value).size === value.length ? [] : [`${where}: ${field} contains a duplicate`]
}

function sameSet(where, field, declared, present, noun) {
  const problems = []
  const declaredSet = new Set(arrayOf(declared))
  const presentSet = new Set(present)
  for (const name of presentSet) if (!declaredSet.has(name)) problems.push(`${where}: ${field} does not list ${noun} ${name}, which exists`)
  for (const name of declaredSet) if (!presentSet.has(name)) problems.push(`${where}: ${field} lists ${name}, but no ${noun} file exists`)
  return problems
}

function visible(directory) {
  return existsSync(directory) ? readdirSync(directory).filter(name => !name.startsWith('.')) : []
}

function wordPattern(names) {
  const escaped = [...names].sort((left, right) => right.length - left.length).map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  return escaped.length ? new RegExp(`(?<![A-Za-z0-9_-])(${escaped.join('|')})(?![A-Za-z0-9_-])`, 'g') : null
}

// Core: rules fragment and catalogs exist.
if (!core.exists) failures.push('core: directory is missing')
if (!existsSync(core.agentsMd)) failures.push('core/AGENTS.md: rules fragment is missing')
if (!core.agents.length) failures.push('core/agents: no personas found')
if (!core.skills.length) failures.push('core/skills: no skills found')

// Stacks directory layout.
const stacksDirectory = join(root, 'stacks')
if (!existsSync(stacksDirectory)) failures.push('stacks: directory is missing')
else {
  for (const entry of readdirSync(stacksDirectory).filter(name => !name.startsWith('.')).sort()) {
    const stats = lstatSync(join(stacksDirectory, entry))
    if (stats.isFile() && entry !== 'README.md') failures.push(`stacks/${entry}: only pack directories and README.md belong in stacks/`)
  }
}
if (!packs.size) failures.push('stacks: no packs found')

for (const pack of packs.values()) {
  const where = `${pack.dirLabel}/pack.json`
  for (const entry of readdirSync(pack.dir).filter(name => !name.startsWith('.')).sort()) {
    if (!packEntries.includes(entry)) failures.push(`${pack.dirLabel}/${entry}: unexpected entry; packs contain only ${packEntries.join(', ')}`)
  }
  for (const file of ['README.md', 'AGENTS.md']) {
    if (!existsSync(join(pack.dir, file))) failures.push(`${pack.dirLabel}/${file}: missing`)
  }
  const readmePath = join(pack.dir, 'README.md')
  if (existsSync(readmePath) && !/^## .*changelog/im.test(read(readmePath))) failures.push(`${pack.dirLabel}/README.md: needs a Changelog section`)
  for (const entry of visible(join(pack.dir, 'agents'))) {
    if (!entry.endsWith('.md') || !lstatSync(join(pack.dir, 'agents', entry)).isFile()) failures.push(`${pack.dirLabel}/agents/${entry}: agents/ holds only persona .md files`)
  }
  for (const skill of pack.skills) if (!existsSync(skill.source)) failures.push(`${skill.dirLabel}: missing SKILL.md`)
  for (const entry of visible(join(pack.dir, 'skills'))) {
    if (!lstatSync(join(pack.dir, 'skills', entry)).isDirectory()) failures.push(`${pack.dirLabel}/skills/${entry}: skills/ holds only skill folders`)
  }

  if (!pack.manifest) {
    failures.push(`${where}: ${pack.error}`)
    continue
  }
  const manifest = pack.manifest
  for (const field of Object.keys(manifest)) {
    if (!manifestFields.includes(field)) failures.push(`${where}: unsupported field ${field}`)
  }
  for (const field of manifestFields) if (!(field in manifest)) failures.push(`${where}: missing field ${field}`)
  if (manifest.name !== pack.name) failures.push(`${where}: name must equal its directory name ${pack.name}`)
  if (!namePattern.test(pack.name)) failures.push(`${where}: pack directory name must be kebab-case`)
  if (!packKinds.includes(manifest.kind)) failures.push(`${where}: kind must be one of ${packKinds.join(', ')}`)
  if (typeof manifest.version !== 'string' || !semverPattern.test(manifest.version)) failures.push(`${where}: version must be a semantic version such as 0.1.0`)
  if (typeof manifest.description !== 'string' || !manifest.description.trim() || /\n/.test(manifest.description)) {
    failures.push(`${where}: description must be one non-empty line`)
  }
  for (const field of ['requires', 'conflicts', 'detect', 'agents', 'skills']) failures.push(...listProblems(where, field, manifest[field]))
  for (const field of ['requires', 'conflicts']) {
    for (const name of arrayOf(manifest[field])) {
      if (name === pack.name) failures.push(`${where}: ${field} must not name the pack itself`)
      else if (!packs.has(name)) failures.push(`${where}: ${field} names unknown pack ${name}`)
    }
  }
  for (const name of arrayOf(manifest.requires)) {
    if (arrayOf(manifest.conflicts).includes(name)) failures.push(`${where}: ${name} is both required and conflicting`)
  }
  if (!manifest.commands || typeof manifest.commands !== 'object' || Array.isArray(manifest.commands)) {
    failures.push(`${where}: commands must be an object of named commands`)
  } else {
    for (const [key, command] of Object.entries(manifest.commands)) {
      if (!/^[a-z][a-z0-9_-]*$/.test(key)) failures.push(`${where}: command key ${key} must be lowercase`)
      if (typeof command !== 'string' || !command.trim() || /\n/.test(command)) failures.push(`${where}: command ${key} must be one non-empty line`)
    }
  }
  failures.push(...sameSet(where, 'agents', manifest.agents, pack.agents.map(entry => entry.name), 'persona'))
  failures.push(...sameSet(where, 'skills', manifest.skills, pack.skills.map(entry => entry.name), 'skill'))
  for (const entry of [...pack.agents, ...pack.skills]) {
    if (!entry.name.startsWith(`${pack.name}-`) && !legacyNames.has(entry.name)) {
      failures.push(`${entry.label}: new pack ${entry.kind === 'agent' ? 'persona' : 'skill'} names start with ${pack.name}-`)
    }
  }

  // Routes name owners and skills that are always installed with this pack.
  const owners = scopeFor(pack.name, 'agents', catalog)
  const skills = scopeFor(pack.name, 'skills', catalog)
  if (!Array.isArray(manifest.routes)) failures.push(`${where}: routes must be a list`)
  else {
    manifest.routes.forEach((route, index) => {
      const at = `${where}: routes[${index}]`
      if (!route || typeof route !== 'object' || Array.isArray(route)) {
        failures.push(`${at} must be an object with outcome, owner, and skills`)
        return
      }
      for (const field of Object.keys(route)) if (!routeFields.includes(field)) failures.push(`${at} has unsupported field ${field}`)
      if (typeof route.outcome !== 'string' || !route.outcome.trim() || route.outcome.includes('|')) failures.push(`${at}: outcome must be one line of text without |`)
      if (!owners.has(route.owner)) failures.push(`${at}: owner ${route.owner} is not a persona in core, ${pack.name}, or a required pack`)
      failures.push(...listProblems(at, 'skills', route.skills))
      for (const skill of arrayOf(route.skills)) {
        if (!skills.has(skill)) failures.push(`${at}: skill ${skill} is not in core, ${pack.name}, or a required pack`)
      }
    })
  }
}

// Dependency graph: every pack resolves on its own (no unknown requires, cycles, or internal conflicts).
const graphProblems = new Set()
for (const pack of packs.values()) {
  if (!pack.manifest) continue
  try {
    resolvePacks([pack.name], packs)
  } catch (error) {
    if (!(error instanceof StackError)) throw error
    for (const problem of error.problems) graphProblems.add(`stacks/${pack.name}: ${problem}`)
  }
}
failures.push(...graphProblems)
failures.push(...duplicateProblems([...catalog.agents, ...catalog.skills]))

// Boundary for installed content: core never names a pack persona or skill. A
// pack names only skills from its own `requires` chain; it may hand off to
// another pack's persona when that pack is installed. Pack READMEs may discuss combinations.
const packEntryOwners = new Map()
const packSkillOwners = new Map()
for (const pack of packs.values()) {
  for (const entry of pack.agents) packEntryOwners.set(entry.name, pack.name)
  for (const entry of pack.skills) {
    packEntryOwners.set(entry.name, pack.name)
    packSkillOwners.set(entry.name, pack.name)
  }
}
function mentions(file, pattern) {
  return pattern && existsSync(file) && file.endsWith('.md') ? new Set([...read(file).matchAll(pattern)].map(found => found[1])) : new Set()
}
const corePattern = wordPattern(packEntryOwners.keys())
for (const file of [core.agentsMd, ...core.agents.map(entry => entry.source), ...core.skills.flatMap(entry => entry.files)]) {
  for (const name of mentions(file, corePattern)) failures.push(`${label(file)}: core must not name ${packEntryOwners.get(name)} pack entry ${name}`)
}
const skillPattern = wordPattern(packSkillOwners.keys())
for (const pack of packs.values()) {
  const allowed = scopeFor(pack.name, 'skills', catalog)
  for (const file of [pack.agentsMd, ...pack.agents.map(entry => entry.source), ...pack.skills.flatMap(entry => entry.files)]) {
    for (const name of mentions(file, skillPattern)) {
      if (!allowed.has(name)) failures.push(`${label(file)}: names skill ${name} from pack ${packSkillOwners.get(name)}, which ${pack.name} does not require`)
    }
  }
}

// Profiles: valid, resolvable, collision-free; `reference` covers every pack.
const profiles = loadProfiles()
if (!profiles.has('reference')) failures.push('profiles/reference.json: the reference profile is required')
for (const profile of profiles.values()) {
  const where = profile.label
  if (profile.error) {
    failures.push(`${where}: ${profile.error}`)
    continue
  }
  const data = profile.data
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    failures.push(`${where}: must contain a JSON object`)
    continue
  }
  for (const field of Object.keys(data)) if (!['name', 'description', 'packs'].includes(field)) failures.push(`${where}: unsupported field ${field}`)
  if (data.name !== profile.name) failures.push(`${where}: name must equal ${profile.name}`)
  if (!namePattern.test(profile.name)) failures.push(`${where}: profile names are kebab-case`)
  if (typeof data.description !== 'string' || !data.description.trim()) failures.push(`${where}: description is missing`)
  failures.push(...listProblems(where, 'packs', data.packs))
  if (!isStringList(data.packs) || !data.packs.length) {
    failures.push(`${where}: packs must list at least one pack`)
    continue
  }
  try {
    const resolved = resolvePacks(data.packs, packs)
    collectCatalog(resolved, { core, packs })
    if (profile.name === 'reference') {
      for (const name of packs.keys()) if (!resolved.includes(name)) failures.push(`${where}: reference must include pack ${name}`)
    }
  } catch (error) {
    if (!(error instanceof StackError)) throw error
    for (const problem of error.problems) failures.push(`${where}: ${problem}`)
  }
}

finish('Stack-pack check', failures, `Stack-pack check passed: ${packs.size} packs and ${profiles.size} profiles resolve without conflicts.`)
