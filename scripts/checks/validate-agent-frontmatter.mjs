import { basename, join } from 'node:path'
import { finish, label, parseFrontmatter, root, toolAliases, toolList, walk } from './lib.mjs'

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
  // A read-only claim must be enforced by tools, and a tool list without edit must be advertised.
  const tools = toolList(data.tools)
  const claimsReadOnly = /\bread-only\b/i.test(data.description ?? '')
  if (tools) {
    if (!tools.length) failures.push(`${label(file)}: tools must be a one-line list such as ['read', 'search'], or be omitted`)
    if (new Set(tools).size !== tools.length) failures.push(`${label(file)}: tools contains a duplicate alias`)
    for (const tool of tools) {
      if (!toolAliases[tool]) failures.push(`${label(file)}: unsupported tool alias ${tool}; use ${Object.keys(toolAliases).join(', ')}`)
    }
  }
  const readOnly = tools !== null && !tools.includes('edit')
  if (claimsReadOnly && !readOnly) failures.push(`${label(file)}: read-only persona must declare tools without edit`)
  if (readOnly && !claimsReadOnly) failures.push(`${label(file)}: persona without edit must say Read-only in its description`)
}

if (files.length === 0) failures.push('.github/agents: no persona files found')
finish('Agent validation', failures, `Agent validation passed: ${files.length} personas.`)
