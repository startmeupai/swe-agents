import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { finish, root } from './lib.mjs'

const requiredFiles = [
  'README.md',
  'AGENTS.md',
  'CLAUDE.md',
  'CONTRIBUTING.md',
  'CODE_OF_CONDUCT.md',
  'SUPPORT.md',
  'SECURITY.md',
  'LICENSE',
  'PROVENANCE.json',
  'REVIEW_CHECKLIST.md',
  'SOURCE_MAP.md',
  'package.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  '.nvmrc',
  '.gitignore',
  '.gitattributes',
  '.github/CODEOWNERS',
  '.github/AGENTS.md',
  '.github/PULL_REQUEST_TEMPLATE.md',
  '.github/ISSUE_TEMPLATE/bug_report.yml',
  '.github/ISSUE_TEMPLATE/feature_request.yml',
  '.github/ISSUE_TEMPLATE/question.yml',
  '.github/ISSUE_TEMPLATE/config.yml',
  '.github/copilot-instructions.md',
  '.github/workflows/reference-checks.yml',
  'docs/architecture.md',
  'docs/agent-routing.md',
  'docs/plan-lifecycle.md',
  'docs/verification-model.md',
  'docs/security-boundaries.md',
  'docs/releases-and-versioning.md',
  'docs/workshop-example.md',
  'examples/browser-evidence/browser-evidence-manifest.schema.json',
  'examples/browser-evidence/manifest.json'
]

const requiredDirectories = [
  '.github/agents',
  '.github/skills',
  '.github/instructions',
  '.github/workflows',
  'examples/plans',
  'examples/reports',
  'examples/handoffs',
  'scripts/checks'
]

const failures = []
for (const path of requiredFiles) if (!existsSync(join(root, path))) failures.push(`missing file: ${path}`)
for (const path of requiredDirectories) if (!existsSync(join(root, path))) failures.push(`missing directory: ${path}`)

finish('Required-file check', failures, `Required-file check passed: ${requiredFiles.length} files and ${requiredDirectories.length} directories.`)
