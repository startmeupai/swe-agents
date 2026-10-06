import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { finish, root } from './lib.mjs'

const requiredFiles = [
  'README.md',
  'AGENTS.md',
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
  'docs/stack-packs.md',
  'core/AGENTS.md',
  'stacks/README.md',
  'profiles/reference.json',
  'scripts/stacks/install.mjs',
  'scripts/stacks/engine.mjs',
  'scripts/runtime/sync-agent-setup.mjs',
  'examples/browser-evidence/browser-evidence-manifest.schema.json',
  'examples/browser-evidence/manifest.json'
]

const requiredDirectories = [
  'core/agents',
  'core/skills',
  'stacks',
  'profiles',
  '.github/agents',
  '.github/workflows',
  'examples/plans',
  'examples/reports',
  'examples/handoffs',
  'scripts/checks'
]

// Retired layout: rules live in core/AGENTS.md and stacks/*/AGENTS.md, skills in
// core/ and stacks/, and Claude Code reads AGENTS.md only when no CLAUDE.md exists.
const removedPaths = ['CLAUDE.md', 'CLAUDE.local.md', '.github/instructions', '.github/skills']

const failures = []
for (const path of requiredFiles) if (!existsSync(join(root, path))) failures.push(`missing file: ${path}`)
for (const path of requiredDirectories) if (!existsSync(join(root, path))) failures.push(`missing directory: ${path}`)
for (const path of removedPaths) if (existsSync(join(root, path))) failures.push(`retired path must not exist: ${path}`)

finish('Required-file check', failures, `Required-file check passed: ${requiredFiles.length} files and ${requiredDirectories.length} directories.`)
