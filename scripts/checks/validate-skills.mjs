import { basename, dirname, join } from 'node:path'
import { finish, label, parseFrontmatter, root, walk } from './lib.mjs'

const directory = join(root, '.github/skills')
const files = walk(directory, path => basename(path) === 'SKILL.md')
const failures = []
const requiredSections = [
  'Trigger Conditions',
  'Required Inputs',
  'Workflow',
  'Deterministic Checks',
  'Safety and Permission Boundaries',
  'Required Evidence',
  'Completion Condition',
  'Example'
]

for (const file of files) {
  const { content, data } = parseFrontmatter(file)
  if (!data) {
    failures.push(`${label(file)}: missing YAML frontmatter`)
    continue
  }
  const expectedName = basename(dirname(file))
  if (data.name !== expectedName) failures.push(`${label(file)}: name must equal ${expectedName}`)
  if (!data.description) failures.push(`${label(file)}: description is missing`)
  for (const section of requiredSections) {
    if (!content.includes(`## ${section}`)) failures.push(`${label(file)}: missing section ${section}`)
  }
  const numberedSteps = content.match(/^\d+\.\s+/gm) ?? []
  if (numberedSteps.length < 3) failures.push(`${label(file)}: workflow must contain at least three numbered steps`)
}

if (files.length === 0) failures.push('.github/skills: no skills found')
finish('Skill validation', failures, `Skill validation passed: ${files.length} skills.`)
