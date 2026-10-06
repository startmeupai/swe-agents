import { realpathSync } from 'node:fs'
import { basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { finish, label, read, root, symbolicLinks, walk } from './lib.mjs'

// Exact public identifiers that may contain a forbidden term. Everything else
// that contains the term, such as a private host or repository path, still fails.
export const publicIdentity = [
  [['start', 'meup', 'ai'].join(''), 'swe-agents'].join('/'),
  ['contact', ['start', 'meup', '.ai'].join('')].join('@')
]
export const forbiddenTerms = [
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
export const absolutePathPatterns = [
  /\/Users\/[A-Za-z0-9._-]+\//,
  /\/home\/[A-Za-z0-9._-]+\//,
  /\/private\/(?:tmp|var)\//,
  /[A-Za-z]:[\\/]Users[\\/][A-Za-z0-9._-]+[\\/]/,
  /file:\/\/\/(?:Users|home|private)\//i,
  /(?:^|[\s"'(])~\/[A-Za-z0-9._-]/m
]

// Findings for one file, in the order this check reports them. `pathLabel` is
// the repository-relative POSIX path; `content` is the file text.
export function sanitizationFindings(content, pathLabel) {
  const findings = []
  const scannable = publicIdentity.reduce((text, allowed) => text.split(allowed).join(''), content)
  for (const term of forbiddenTerms) {
    if (pathLabel.toLowerCase().includes(term.toLowerCase())) findings.push(`${pathLabel}: forbidden repository-specific term in path`)
    if (scannable.toLowerCase().includes(term.toLowerCase())) findings.push(`${pathLabel}: forbidden repository-specific term`)
  }
  for (const pattern of absolutePathPatterns) {
    if (pattern.test(content)) findings.push(`${pathLabel}: absolute local path detected`)
  }
  return findings
}

function invokedDirectly() {
  try {
    return Boolean(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))
  } catch {
    return false
  }
}

if (invokedDirectly()) {
  const ownFile = 'check-sanitization.mjs'
  const files = walk(root, path => basename(path) !== ownFile)
  const failures = []
  for (const file of files) failures.push(...sanitizationFindings(read(file), label(file)))
  for (const path of symbolicLinks(root)) failures.push(`${label(path)}: symbolic links are not allowed`)
  finish('Sanitization check', failures, `Sanitization check passed: ${files.length} files scanned.`)
}
