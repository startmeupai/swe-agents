import { basename } from 'node:path'
import { finish, label, read, root, symbolicLinks, walk } from './lib.mjs'

const ownFile = 'check-sanitization.mjs'
const files = walk(root, path => basename(path) !== ownFile)
const failures = []
const forbiddenTerms = [
  ['byblos', 'ai'].join(''),
  ['start', 'meup'].join(''),
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
  const pathLabel = label(file)
  for (const term of forbiddenTerms) {
    if (pathLabel.toLowerCase().includes(term.toLowerCase())) failures.push(`${pathLabel}: forbidden repository-specific term in path`)
    if (content.toLowerCase().includes(term.toLowerCase())) failures.push(`${pathLabel}: forbidden repository-specific term`)
  }
  for (const pattern of absolutePathPatterns) {
    if (pattern.test(content)) failures.push(`${pathLabel}: absolute local path detected`)
  }
}

for (const path of symbolicLinks(root)) failures.push(`${label(path)}: symbolic links are not allowed`)

finish('Sanitization check', failures, `Sanitization check passed: ${files.length} files scanned.`)
