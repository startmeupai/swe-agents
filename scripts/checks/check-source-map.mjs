import { basename, relative } from 'node:path'
import { finish, read, root, walk } from './lib.mjs'

const sourceMapPath = `${root}/SOURCE_MAP.md`
const content = read(sourceMapPath)
const mapped = new Set([...content.matchAll(/^\| `([^`]+)` \|/gm)].map(match => match[1]))
const actual = walk(root)
  .map(path => relative(root, path).split('\\').join('/'))
  .filter(path => path !== 'SOURCE_MAP.md')
const failures = []

for (const path of actual) if (!mapped.has(path)) failures.push(`unmapped artifact: ${path}`)
for (const path of mapped) {
  if (path === 'SOURCE_MAP.md') continue
  if (!actual.includes(path)) failures.push(`stale source-map destination: ${path}`)
}

if (basename(sourceMapPath) !== 'SOURCE_MAP.md') failures.push('source map path is invalid')
finish('Source-map coverage check', failures, `Source-map coverage passed: ${actual.length} artifacts mapped.`)
