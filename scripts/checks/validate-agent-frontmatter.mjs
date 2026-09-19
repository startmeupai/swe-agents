import { basename, join } from 'node:path'
import { finish, label, parseFrontmatter, root, walk } from './lib.mjs'

const directory = join(root, '.github/agents')
const files = walk(directory, path => path.endsWith('.md'))
const failures = []
const requiredSections = [
  'Purpose and Responsibility',
  'When to Use',
  'Inputs',
  'Expected Output',
  'Boundaries and Prohibited Actions',
  'Verification Expectations',
  'Handoff Expectations',
  'Related Skills',
  'Example Invocation'
]

for (const file of files) {
  const { content, data } = parseFrontmatter(file)
  if (!data) {
    failures.push(`${label(file)}: missing YAML frontmatter`)
    continue
  }
  const expectedName = basename(file, '.agent.md')
  if (data.name !== expectedName) failures.push(`${label(file)}: name must equal ${expectedName}`)
  if (!data.description) failures.push(`${label(file)}: description is missing`)
  for (const section of requiredSections) {
    if (!content.includes(`## ${section}`)) failures.push(`${label(file)}: missing section ${section}`)
  }
}

if (files.length === 0) failures.push('.github/agents: no persona files found')
finish('Agent validation', failures, `Agent validation passed: ${files.length} personas.`)
