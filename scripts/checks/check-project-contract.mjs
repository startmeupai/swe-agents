import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { finish, read, root } from './lib.mjs'

const failures = []
const packagePath = join(root, 'package.json')
const lockPath = join(root, 'pnpm-lock.yaml')
const workspacePath = join(root, 'pnpm-workspace.yaml')
const nodeVersionPath = join(root, '.nvmrc')
const workflowPath = join(root, '.github/workflows/reference-checks.yml')
const codeownersPath = join(root, '.github/CODEOWNERS')
const licensePath = join(root, 'LICENSE')
const attributesPath = join(root, '.gitattributes')
const reviewPath = join(root, 'REVIEW_CHECKLIST.md')

function normalizeLineEndings(content) {
  return content.replace(/\r\n/g, '\n')
}

let packageJson
try {
  packageJson = JSON.parse(read(packagePath))
} catch (error) {
  failures.push(`package.json: invalid JSON (${error.message})`)
}

const nodeVersion = read(nodeVersionPath).trim()
if (!/^22\.\d+\.\d+$/.test(nodeVersion)) failures.push('.nvmrc: expected an exact Node.js 22 version')
if (packageJson) {
  if (packageJson.private !== true) failures.push('package.json: private must remain true')
  if (packageJson.name !== 'swe-agents') failures.push('package.json: package name must be swe-agents')
  if (!/^\d+\.\d+\.\d+$/.test(packageJson.version)) failures.push('package.json: expected a public semantic version')
  if (packageJson.license !== 'Apache-2.0') failures.push('package.json: license must be Apache-2.0')
  if (packageJson.engines?.node !== nodeVersion) failures.push('package.json: engines.node must match .nvmrc exactly')
  const pnpmVersion = packageJson.packageManager?.match(/^pnpm@(\d+\.\d+\.\d+)$/)?.[1]
  if (!pnpmVersion) failures.push('package.json: packageManager must pin an exact pnpm version')
  if (packageJson.engines?.pnpm !== pnpmVersion) failures.push('package.json: engines.pnpm must match packageManager')
  if (!packageJson.scripts?.['check:all']) failures.push('package.json: check:all script is required')
}

if (!existsSync(licensePath) || !read(licensePath).includes('Apache License')) {
  failures.push('LICENSE: Apache-2.0 license text is required')
}

if (!existsSync(attributesPath) || !normalizeLineEndings(read(attributesPath)).includes('* text=auto eol=lf')) {
  failures.push('.gitattributes: repository text files must use LF line endings')
}

if (!existsSync(lockPath)) {
  failures.push('pnpm-lock.yaml: committed lockfile is required')
} else {
  const lock = normalizeLineEndings(read(lockPath))
  if (!/^lockfileVersion: ['"]9\.0['"]$/m.test(lock)) failures.push('pnpm-lock.yaml: expected lockfileVersion 9.0')
  if (!/^importers:$/m.test(lock) || !/^  \.: \{\}$/m.test(lock)) failures.push('pnpm-lock.yaml: root importer is missing')
}

if (!existsSync(workspacePath)) {
  failures.push('pnpm-workspace.yaml: standalone workspace boundary is required')
} else if (normalizeLineEndings(read(workspacePath)) !== 'packages: []\n') {
  failures.push('pnpm-workspace.yaml: expected an empty standalone package list')
}

if (!existsSync(workflowPath)) {
  failures.push('.github/workflows/reference-checks.yml: required CI workflow is missing')
} else {
  const workflow = normalizeLineEndings(read(workflowPath))
  const requiredFragments = [
    'permissions:\n  contents: read',
    'concurrency:',
    'timeout-minutes:',
    'os: [ubuntu-latest, windows-latest]',
    'node-version-file: .nvmrc',
    'pnpm install --frozen-lockfile',
    'pnpm check:all'
  ]
  for (const fragment of requiredFragments) {
    if (!workflow.includes(fragment)) failures.push(`reference-checks.yml: missing contract fragment: ${fragment.split('\n')[0]}`)
  }
  if (/\b(?:actions|checks|contents|deployments|id-token|issues|packages|pull-requests|security-events|statuses):\s*write\b/.test(workflow)) {
    failures.push('reference-checks.yml: workflow must not grant write permissions')
  }
  if (workflow.includes('${{ secrets.')) failures.push('reference-checks.yml: reference checks must not consume secrets')
}

if (!existsSync(codeownersPath)) failures.push('.github/CODEOWNERS: ownership policy is missing')
else {
  const activeRules = read(codeownersPath).split(/\r?\n/).filter(line => line.trim() && !line.trim().startsWith('#'))
  if (!activeRules.some(line => line.includes('@nhawat'))) {
    failures.push('.github/CODEOWNERS: an active maintainer must own the repository')
  }
}

const review = read(reviewPath)
if (!review.includes('- [x] Actual maintainers are configured in `.github/CODEOWNERS`.')) {
  failures.push('REVIEW_CHECKLIST.md: CODEOWNERS readiness evidence is missing')
}

finish('Project-contract check', failures, 'Project contract passed: runtime, package manager, CI, license, and ownership policy are consistent.')
