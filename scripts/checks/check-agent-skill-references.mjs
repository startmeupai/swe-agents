import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { finish, label, read, root, walk } from './lib.mjs'

const files = walk(join(root, '.github/agents'), path => path.endsWith('.md'))
const failures = []
let references = 0

for (const file of files) {
  const content = read(file)
  const matches = [...content.matchAll(/\]\((\.\.\/skills\/[^)]+\/SKILL\.md)\)/g)]
  if (matches.length === 0) failures.push(`${label(file)}: no linked related skill`)
  for (const match of matches) {
    references += 1
    const target = join(dirname(file), match[1])
    if (!existsSync(target)) failures.push(`${label(file)}: missing skill ${match[1]}`)
  }
}

finish('Agent-to-skill reference check', failures, `Agent-to-skill references passed: ${references} links.`)
