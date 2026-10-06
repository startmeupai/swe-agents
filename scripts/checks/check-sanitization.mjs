import { basename } from 'node:path'
import { finish, label, read, root, symbolicLinks, walk } from './lib.mjs'

const ownFile = 'check-sanitization.mjs'
const files = walk(root, path => basename(path) !== ownFile)
const failures = []
// Exact public identifiers that may contain a forbidden term. Everything else
// that contains the term, such as a private host or repository path, still fails.
const publicIdentity = [
  [['start', 'meup', 'ai'].join(''), 'swe-agents'].join('/'),
  ['contact', ['start', 'meup', '.ai'].join('')].join('@')
]
const forbiddenTerms = [
  ['start', 'meup'].join(''),
  ['byblos', 'ai'].join(''),
  ['smu', 'ai'].join(''),
  ['ced', 'ra'].join(''),
  ['kal', 'da'].join(''),
  ['tyros', 'ai'].join(''),
  ['pyra', 'midre'].join(''),
  ['mena', 'gri'].join(''),
  ['router', 'ai'].join(''),
  ['shield', 'wall'].join(''),
  ['repo', 'manager'].join(''),
  ['deep', '_db'].join(''),
  ['Agent', 'WorkspaceShell'].join(''),
  ['Prompt', 'FormV5'].join(''),
  ['require', 'ModuleAccessAsync'].join(''),
  ['DEFAULT', '_PLATFORM_MODULE_ID'].join(''),
  ['DEFAULT', '_PLATFORM_PROJECT_ID'].join('')
]
const absolutePathPatterns = [
  /\/Users\/[A-Za-z0-9._-]+\//,
  /\/home\/[A-Za-z0-9._-]+\//,
  /\/private\/(?:tmp|var)\//,
  /[A-Za-z]:[\\/]Users[\\/][A-Za-z0-9._-]+[\\/]/,
  /file:\/\/\/(?:Users|home|private)\//i,
  /(?:^|[\s"'(])~\/[A-Za-z0-9._-]/m
]

for (const file of files) {
  const content = read(file)
  const scannable = publicIdentity.reduce((text, allowed) => text.split(allowed).join(''), content)
  const pathLabel = label(file)
  for (const term of forbiddenTerms) {
    if (pathLabel.toLowerCase().includes(term.toLowerCase())) failures.push(`${pathLabel}: forbidden repository-specific term in path`)
    if (scannable.toLowerCase().includes(term.toLowerCase())) failures.push(`${pathLabel}: forbidden repository-specific term`)
  }
  for (const pattern of absolutePathPatterns) {
    if (pattern.test(content)) failures.push(`${pathLabel}: absolute local path detected`)
  }
}

for (const path of symbolicLinks(root)) failures.push(`${label(path)}: symbolic links are not allowed`)

finish('Sanitization check', failures, `Sanitization check passed: ${files.length} files scanned.`)
