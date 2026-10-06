import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { finish, label, read, root, walk } from './lib.mjs'

// Adopting repositories point this at their own plan directory.
const planDirectory = join(root, 'examples/plans')
const files = walk(planDirectory, path => path.endsWith('.md'))
const statuses = new Set(['Pending', 'In progress', 'Blocked', 'In review', 'Complete'])
const stageFields = ['Goal', 'Assigned Specialist', 'Dependencies', 'Status']
const gateTag = /^- \[ \] \*\*(?:(?:Browser|Provider|Deployment|Operations|Legal|Human) gate|Blocked on [^*:]+):\*\*/
const failures = []
let stageCount = 0

function personaExists(name) {
  return existsSync(join(root, '.github/agents', `${name}.agent.md`))
}

for (const file of files) {
  const content = read(file).replace(/\r\n/g, '\n').replace(/```[\s\S]*?```/g, '')
  const lines = content.split('\n')
  lines.forEach((line, index) => {
    const box = line.match(/^\s*([-*+]) \[(.)\]/)
    if (box && (box[1] !== '-' || ![' ', 'x'].includes(box[2]))) {
      failures.push(`${label(file)}:${index + 1}: tasks use "- [ ]" or "- [x]" only`)
    }
    for (const match of line.matchAll(/\(Specialist: `?([a-z0-9-]+)`?\)/g)) {
      if (!personaExists(match[1])) failures.push(`${label(file)}:${index + 1}: unknown task specialist ${match[1]}`)
    }
  })

  for (const section of content.split(/^(?=## )/m).filter(part => /^## Stage \d+:/.test(part))) {
    stageCount += 1
    const heading = section.split('\n')[0]
    const where = `${label(file)}: ${heading.slice(3)}`
    for (const field of stageFields) {
      if (!section.includes(`**${field}:**`)) failures.push(`${where}: missing **${field}:**`)
    }
    const owner = section.match(/^\*\*Assigned Specialist:\*\* `([a-z0-9-]+)`/m)?.[1]
    if (section.includes('**Assigned Specialist:**') && (!owner || !personaExists(owner))) {
      failures.push(`${where}: assigned specialist must name an existing persona in backticks`)
    }
    const status = section.match(/^\*\*Status:\*\* (.+)$/m)?.[1].trim()
    if (status && !statuses.has(status)) failures.push(`${where}: unknown status "${status}"; use ${[...statuses].join(', ')}`)
    const openBoxes = section.split('\n').filter(line => line.startsWith('- [ ]'))
    if (status === 'Complete' && openBoxes.length) failures.push(`${where}: Complete stage has ${openBoxes.length} open box(es)`)
    if (status === 'Blocked' || status === 'In review') {
      for (const box of openBoxes) {
        if (!gateTag.test(box)) failures.push(`${where}: open box needs a gate or Blocked on tag: ${box.slice(6, 60)}`)
      }
    }
  }
}

if (files.length === 0) failures.push(`${label(planDirectory)}: no plans found`)
finish('Plan check', failures, `Plan check passed: ${files.length} plans, ${stageCount} stages.`)
