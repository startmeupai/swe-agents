import { basename, join } from 'node:path'
import { finish, label, read, root, walk } from './lib.mjs'

const failures = []
const agents = walk(join(root, '.github/agents'), path => path.endsWith('.md'))
const skills = walk(join(root, '.github/skills'), path => basename(path) === 'SKILL.md')

for (const file of agents) {
  const content = read(file)
  const numbered = content.match(/^\d+\.\s+/gm) ?? []
  if (numbered.length > 2) failures.push(`${label(file)}: persona contains a large numbered procedure`)
  if (content.includes('## Workflow')) failures.push(`${label(file)}: persona contains a workflow section`)
}

for (const file of skills) {
  const content = read(file)
  if (/^## Persona$/m.test(content)) failures.push(`${label(file)}: skill pretends to be a persona`)
  if (/^You are the /m.test(content)) failures.push(`${label(file)}: skill contains persona language`)
}

finish('Agent/skill separation check', failures, `Agent/skill separation passed: ${agents.length} personas and ${skills.length} skills.`)
