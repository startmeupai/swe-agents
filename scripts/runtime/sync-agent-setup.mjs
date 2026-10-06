import { existsSync, lstatSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { StackError, collectCatalog, finish, isHidden, label, loadCore, loadPacks, loadProfiles, resolvePacks, root, symbolicLinks, walk } from '../checks/lib.mjs'
import { normalized, runtimeDirectories, runtimeOutputs } from '../stacks/engine.mjs'

// Installs the `reference` profile into this repository's own tool directories
// with the same engine as scripts/stacks/install.mjs, minus AGENTS.md and the lock.
const check = process.argv.includes('--check')
if (process.argv.slice(2).some(argument => argument !== '--check')) {
  throw new Error('Usage: node scripts/runtime/sync-agent-setup.mjs [--check]')
}
const failures = symbolicLinks(root).map(path => `${label(path)}: symbolic links are not portable`)
finish('Runtime source safety', failures, 'Runtime sources contain no symbolic links.')

const core = loadCore()
const packs = loadPacks()
const profile = loadProfiles().get('reference')
if (!core.exists || !core.agents.length || !core.skills.length) failures.push('core: canonical agent and skill catalogs must not be empty')
if (!profile?.data || !Array.isArray(profile.data.packs)) failures.push('profiles/reference.json: missing or invalid')
finish('Runtime catalog', failures, 'Runtime catalog found.')

let catalog
let outputs
try {
  catalog = collectCatalog(resolvePacks(profile.data.packs, packs), { core, packs })
  outputs = runtimeOutputs(catalog, { target: root, mode: 'self' })
} catch (error) {
  failures.push(...(error instanceof StackError ? error.problems : [error.message]))
}
finish('Runtime generation', failures, `Runtime generation resolved profile reference: ${catalog?.packs.map(pack => pack.name).join(', ')}.`)

// Reject stale artifacts instead of deleting local work or quietly retaining old personas.
for (const directory of runtimeDirectories) {
  for (const file of walk(join(root, directory), path => !isHidden(path, join(root, directory)))) {
    if (!outputs.has(label(file))) failures.push(`${label(file)}: stale runtime artifact; review and remove explicitly`)
  }
}
finish('Runtime inventory', failures, 'Runtime inventory contains no stale artifacts.')

for (const [path, { content }] of outputs) {
  const target = join(root, path)
  if (check) {
    if (!existsSync(target) || !lstatSync(target).isFile()) failures.push(`${path}: missing runtime file`)
    else if (!normalized(readFileSync(target)).equals(content)) failures.push(`${path}: differs from canonical setup; run pnpm sync:setup`)
  } else {
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, content)
  }
}
finish('Runtime setup', failures, `Runtime setup ${check ? 'check passed' : 'generated'}: ${catalog.agents.size} personas and ${catalog.skills.size} skills from core and ${catalog.packs.length} packs; ${outputs.size} files.`)
