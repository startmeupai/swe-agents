import { existsSync } from 'node:fs'
import { allEntries, duplicateProblems, finish, parseFrontmatter } from './lib.mjs'

// Persona and skill names are globally unique across core and every pack, so
// any pack combination installs without collisions.
const { agents, skills } = allEntries()
const entries = [...agents, ...skills]
const failures = duplicateProblems(entries)

// Frontmatter names must not collide either, even where they disagree with the file name.
const declared = entries.map(entry => {
  const name = existsSync(entry.source) ? parseFrontmatter(entry.source).data?.name : null
  return { ...entry, name: typeof name === 'string' && name ? name : entry.name }
})
for (const problem of duplicateProblems(declared)) if (!failures.includes(problem)) failures.push(`frontmatter ${problem}`)

finish('Duplicate-name check', failures, `Duplicate-name check passed: ${agents.length} persona and ${skills.length} skill names are unique across core and all packs.`)
