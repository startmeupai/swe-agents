import { existsSync } from 'node:fs'
import { allEntries, finish, read } from './lib.mjs'

// Personas own outcomes and skills own procedures, across core and every pack.
const failures = []
const { agents, skills } = allEntries()

for (const entry of agents) {
  const content = read(entry.source)
  const numbered = content.match(/^\d+\.\s+/gm) ?? []
  if (numbered.length > 2) failures.push(`${entry.label}: persona contains a large numbered procedure`)
  if (/^## Workflow\b/m.test(content)) failures.push(`${entry.label}: persona contains a workflow section`)
}

for (const entry of skills) {
  if (!existsSync(entry.source)) continue
  const content = read(entry.source)
  if (/^## Persona$/m.test(content)) failures.push(`${entry.label}: skill pretends to be a persona`)
  if (/^You are the /m.test(content)) failures.push(`${entry.label}: skill contains persona language`)
}

finish('Agent/skill separation check', failures, `Agent/skill separation passed: ${agents.length} personas and ${skills.length} skills.`)
