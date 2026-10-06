import { existsSync } from 'node:fs'
import { dirname, resolve, sep } from 'node:path'
import { finish, label, markdownFiles, read, root } from './lib.mjs'

// Local links resolve from the file that contains them. Canonical personas and
// skills under core/ and stacks/ are checked in place; their generated copies are
// checked too, because the generator rebases links to each copy's location.
const failures = []
let checked = 0

for (const file of markdownFiles()) {
  const content = read(file)
    .replace(/\r\n/g, '\n')
    .replace(/^(\s{0,3})(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\2[^\n]*$/gm, '')
    .replace(/`[^`\n]*`/g, '')
  const targets = [
    ...[...content.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)].map(match => match[1]),
    ...[...content.matchAll(/^\s{0,3}\[[^\]]+\]:\s+(\S+)/gm)].map(match => match[1])
  ]
  for (const raw of targets) {
    let target = raw.trim()
    if (/^([a-z][a-z0-9+.-]*:|#)/i.test(target)) continue
    if (target.startsWith('<') && target.endsWith('>')) target = target.slice(1, -1)
    try {
      target = decodeURIComponent(target.split('#')[0].split('?')[0])
    } catch {
      failures.push(`${label(file)}: malformed link ${raw}`)
      continue
    }
    if (!target) continue
    checked += 1
    const resolved = resolve(dirname(file), target)
    if (!(resolved === root || resolved.startsWith(`${root}${sep}`)) || !existsSync(resolved)) {
      failures.push(`${label(file)}: unresolved local link ${raw}`)
    }
  }
}

finish('Markdown link check', failures, `Markdown link check passed: ${checked} local links.`)
