import { allEntries, claudeTools, finish, listValue, namePattern, parseFrontmatter, readOnlyFor, relatedSkillBullets, scopeFor } from './lib.mjs'

// Canonical personas: core/agents/*.md and stacks/<pack>/agents/*.md, Claude Code format.
const catalog = allEntries()
const files = catalog.agents
const failures = []
const allowedFields = ['name', 'description', 'tools', 'skills']
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

function escape(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

for (const entry of files) {
  const where = entry.label
  const { content, data, problems } = parseFrontmatter(entry.source)
  if (!data) {
    failures.push(`${where}: missing YAML frontmatter`)
    continue
  }
  for (const problem of problems) failures.push(`${where}: ${problem}`)
  for (const field of Object.keys(data)) {
    if (field === 'model') failures.push(`${where}: remove model; models inherit from the user's client`)
    else if (!allowedFields.includes(field)) failures.push(`${where}: unsupported frontmatter field ${field}; use ${allowedFields.join(', ')}`)
  }
  if (data.name !== entry.name) failures.push(`${where}: name must equal ${entry.name}`)
  if (!namePattern.test(entry.name)) failures.push(`${where}: file name must be kebab-case`)
  if (typeof data.description !== 'string' || !data.description.trim()) failures.push(`${where}: description is missing`)
  for (const section of requiredSections) {
    if (!new RegExp(`^## ${escape(section)}[ \\t]*$`, 'm').test(content)) failures.push(`${where}: missing section ${section}`)
  }

  // A read-only claim must be enforced by tools, and a tool list without an edit tool must be advertised.
  const tools = listValue(data.tools)
  if (tools) {
    if (!tools.length) failures.push(`${where}: tools must list Claude Code tool names, or be omitted to grant all tools`)
    if (new Set(tools).size !== tools.length) failures.push(`${where}: tools contains a duplicate`)
    for (const tool of tools) {
      if (!claudeTools.includes(tool)) failures.push(`${where}: unsupported tool ${tool}; use ${claudeTools.join(', ')}`)
    }
  }
  const claimsReadOnly = /\bread-only\b/i.test(typeof data.description === 'string' ? data.description : '')
  const readOnly = readOnlyFor(tools)
  if (claimsReadOnly && !readOnly) failures.push(`${where}: a Read-only persona must declare tools without Edit, Write, or NotebookEdit`)
  if (readOnly && !claimsReadOnly) failures.push(`${where}: a persona without Edit, Write, and NotebookEdit must say Read-only in its description`)

  // Skills are declared by name in frontmatter and resolve within the persona's install scope.
  const skills = listValue(data.skills)
  if (skills === null || !Array.isArray(data.skills)) failures.push(`${where}: skills must be a YAML block list of skill names`)
  else {
    if (!skills.length) failures.push(`${where}: skills must name at least one skill`)
    if (new Set(skills).size !== skills.length) failures.push(`${where}: skills contains a duplicate`)
    const scope = scopeFor(entry.pack, 'skills', catalog)
    const allowed = entry.pack === null ? 'core skills' : `core skills or skills of ${entry.pack} and the packs it requires`
    for (const skill of skills) {
      if (!scope.has(skill)) failures.push(`${where}: skill ${skill} is not one of the ${allowed}`)
    }
  }

  // Related Skills mirrors the frontmatter as backticked names; links are generated per client.
  if (/\]\([^)]*(?:\.\.\/skills\/|SKILL\.md)/.test(content)) failures.push(`${where}: link skills by backticked name, not by relative SKILL.md path`)
  const bullets = relatedSkillBullets(content)
  if (bullets) {
    if (!bullets.length) failures.push(`${where}: Related Skills needs one bullet per skill`)
    for (const bullet of bullets) {
      if (!bullet.name) failures.push(`${where}: Related Skills bullet must start with a backticked skill name: ${bullet.line}`)
    }
    if (skills) {
      const named = new Set(bullets.map(bullet => bullet.name).filter(Boolean))
      for (const skill of skills) if (!named.has(skill)) failures.push(`${where}: skill ${skill} is missing from Related Skills`)
      for (const name of named) if (!skills.includes(name)) failures.push(`${where}: Related Skills names ${name}, which is not in frontmatter skills`)
    }
  }
}

if (files.length === 0) failures.push('core/agents: no persona files found')
const packCount = new Set(files.map(entry => entry.pack).filter(Boolean)).size
finish('Agent validation', failures, `Agent validation passed: ${files.length} personas (${files.filter(entry => !entry.pack).length} core, ${packCount} packs).`)
