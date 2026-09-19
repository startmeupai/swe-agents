import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { finish, label, markdownFiles, read, root } from './lib.mjs'

const failures = []
let checked = 0

for (const file of markdownFiles()) {
  const content = read(file).replace(/```[\s\S]*?```/g, '')
  for (const match of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    let target = match[1].trim()
    if (/^(https?:|mailto:|#)/.test(target)) continue
    if (target.startsWith('<') && target.endsWith('>')) target = target.slice(1, -1)
    target = decodeURIComponent(target.split('#')[0])
    if (!target) continue
    checked += 1
    const resolved = resolve(dirname(file), target)
    if (!resolved.startsWith(root) || !existsSync(resolved)) {
      failures.push(`${label(file)}: unresolved local link ${match[1]}`)
    }
  }
}

finish('Markdown link check', failures, `Markdown link check passed: ${checked} local links.`)
