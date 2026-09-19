import { basename, dirname, join, relative } from 'node:path'
import { finish, root, walk } from './lib.mjs'

const examples = join(root, 'examples')
const files = walk(examples)
const allowedRoots = new Set(['plans', 'reports', 'handoffs', 'browser-evidence'])
const failures = []

for (const file of files) {
  const rel = relative(examples, file).split('\\').join('/')
  const first = rel.split('/')[0]
  if (!allowedRoots.has(first)) failures.push(`${rel}: artifact is outside an expected directory`)
  if (dirname(file) === examples) failures.push(`${basename(file)}: artifacts may not live at the examples root`)
}

const planFiles = walk(join(examples, 'plans'), path => path.endsWith('.md'))
const reportFiles = walk(join(examples, 'reports'), path => path.endsWith('.md'))
if (planFiles.length < 3) failures.push('examples/plans: expected at least three plan lifecycle examples')
if (reportFiles.length < 3) failures.push('examples/reports: expected at least three report examples')

finish('Artifact-path check', failures, `Artifact-path check passed: ${files.length} example artifacts.`)
