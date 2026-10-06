import { relative } from 'node:path'
import { finish, read, root, walk } from './lib.mjs'

// Every repository file needs a SOURCE_MAP.md row. A destination ending in `/**`
// covers every file under that directory, such as `stacks/python/**`.
const content = read(`${root}/SOURCE_MAP.md`)
const rows = [...content.matchAll(/^\| `([^`]+)` \|/gm)].map(match => match[1])
const exact = new Set(rows.filter(path => !path.endsWith('/**')))
const prefixes = rows.filter(path => path.endsWith('/**')).map(path => path.slice(0, -2))
const actual = walk(root)
  .map(path => relative(root, path).split('\\').join('/'))
  .filter(path => path !== 'SOURCE_MAP.md')
const actualSet = new Set(actual)
const failures = []

const seen = new Set()
for (const row of rows) {
  if (seen.has(row)) failures.push(`duplicate source-map destination: ${row}`)
  seen.add(row)
}
for (const path of actual) {
  if (!exact.has(path) && !prefixes.some(prefix => path.startsWith(prefix))) failures.push(`unmapped artifact: ${path}`)
}
for (const path of exact) {
  if (path !== 'SOURCE_MAP.md' && !actualSet.has(path)) failures.push(`stale source-map destination: ${path}`)
}
for (const prefix of prefixes) {
  if (!actual.some(path => path.startsWith(prefix))) failures.push(`stale source-map destination: ${prefix}** matches no files`)
}

finish('Source-map coverage check', failures, `Source-map coverage passed: ${actual.length} artifacts mapped by ${exact.size} file rows and ${prefixes.length} directory rows.`)
