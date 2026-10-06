import { existsSync } from 'node:fs'
import { allEntries, finish, parseFrontmatter } from './lib.mjs'

// Canonical skills: core/skills/<name>/SKILL.md and stacks/<pack>/skills/<name>/SKILL.md.
const skills = allEntries().skills
const failures = []
const allowedFields = ['name', 'description', 'license', 'compatibility', 'metadata', 'allowed-tools']
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

function escape(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

for (const entry of skills) {
  const where = entry.label
  if (!existsSync(entry.source)) {
    failures.push(`${entry.dirLabel}: missing SKILL.md`)
    continue
  }
  const { content, data, problems } = parseFrontmatter(entry.source)
  if (!data) {
    failures.push(`${where}: missing YAML frontmatter`)
    continue
  }
  for (const problem of problems) failures.push(`${where}: ${problem}`)
  for (const field of Object.keys(data)) {
    if (!allowedFields.includes(field)) failures.push(`${where}: unsupported frontmatter field ${field}; use ${allowedFields.join(', ')}`)
  }
  if (data.name !== entry.name) failures.push(`${where}: name must equal ${entry.name}`)
  // Agent Skills naming: lowercase letters, digits, and single hyphens, at most 64 characters.
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.name) || entry.name.length > 64) {
    failures.push(`${where}: folder name must be lowercase kebab-case of at most 64 characters`)
  }
  if (typeof data.description !== 'string' || !data.description.trim()) failures.push(`${where}: description is missing`)
  else if (data.description.length > 1024) failures.push(`${where}: description exceeds 1024 characters`)
  for (const field of ['license', 'compatibility', 'allowed-tools']) {
    if (field in data && (typeof data[field] !== 'string' || !data[field].trim())) failures.push(`${where}: ${field} must be a non-empty string`)
  }
  if (typeof data.compatibility === 'string' && data.compatibility.length > 500) failures.push(`${where}: compatibility exceeds 500 characters`)
  if ('metadata' in data && (typeof data.metadata !== 'object' || Array.isArray(data.metadata))) {
    failures.push(`${where}: metadata must be a map of string keys to string values`)
  }
  for (const section of requiredSections) {
    if (!new RegExp(`^## ${escape(section)}[ \\t]*$`, 'm').test(content)) failures.push(`${where}: missing section ${section}`)
  }
  const workflow = content.replace(/\r\n/g, '\n').match(/^## Workflow[ \t]*\n([\s\S]*?)(?=^## |(?![\s\S]))/m)?.[1] ?? ''
  const numberedSteps = workflow.match(/^\d+\.\s+/gm) ?? []
  if (numberedSteps.length < 3) failures.push(`${where}: Workflow must contain at least three numbered steps`)
}

if (skills.length === 0) failures.push('core/skills: no skills found')
finish('Skill validation', failures, `Skill validation passed: ${skills.length} skills (${skills.filter(entry => !entry.pack).length} core).`)
