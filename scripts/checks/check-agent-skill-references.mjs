import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { allEntries, finish, listValue, parseFrontmatter, read, root, scopeFor } from './lib.mjs'

// Persona `skills` frontmatter resolves within each persona's install scope,
// and every persona has a route in docs/agent-routing.md.
const catalog = allEntries()
const routingPath = join(root, 'docs/agent-routing.md')
const routing = existsSync(routingPath) ? read(routingPath) : ''
const failures = []
const skillNames = new Set(catalog.skills.map(entry => entry.name))
const personaNames = new Set(catalog.agents.map(entry => entry.name))
let references = 0

if (!routing) failures.push('docs/agent-routing.md: routing guide is missing')

for (const entry of catalog.agents) {
  const { data } = parseFrontmatter(entry.source)
  const skills = listValue(data?.skills) ?? []
  if (!skills.length) failures.push(`${entry.label}: no related skill in frontmatter skills`)
  const scope = scopeFor(entry.pack, 'skills', catalog)
  for (const skill of skills) {
    references += 1
    if (!skillNames.has(skill)) failures.push(`${entry.label}: missing skill ${skill}`)
    else if (!scope.has(skill)) failures.push(`${entry.label}: skill ${skill} is outside the persona's install scope`)
  }
  if (routing && !routing.includes(`| \`${entry.name}\` |`)) failures.push(`docs/agent-routing.md: no route for persona ${entry.name}`)
}

// Rows owned by a known persona must name existing skills.
for (const match of routing.matchAll(/^\| [^|\n]+ \| `([a-z0-9-]+)` \| ([^\n]*?) \|$/gm)) {
  if (!personaNames.has(match[1])) continue
  for (const skill of match[2].matchAll(/`([a-z0-9-]+)`/g)) {
    if (!skillNames.has(skill[1])) failures.push(`docs/agent-routing.md: route for ${match[1]} names unknown skill ${skill[1]}`)
  }
}

finish('Agent-to-skill reference check', failures, `Agent-to-skill references passed: ${references} skill references from ${catalog.agents.length} personas.`)
