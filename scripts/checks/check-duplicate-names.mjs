import { basename, join } from 'node:path'
import { finish, label, parseFrontmatter, root, walk } from './lib.mjs'

const groups = [
  walk(join(root, '.github/agents'), path => path.endsWith('.md')),
  walk(join(root, '.github/skills'), path => basename(path) === 'SKILL.md')
]
const failures = []
let count = 0

for (const files of groups) {
  const seen = new Map()
  for (const file of files) {
    const { data } = parseFrontmatter(file)
    if (!data?.name) continue
    count += 1
    if (seen.has(data.name)) failures.push(`duplicate name ${data.name}: ${seen.get(data.name)} and ${label(file)}`)
    else seen.set(data.name, label(file))
  }
}

finish('Duplicate-name check', failures, `Duplicate-name check passed: ${count} names are unique within their catalogs.`)
