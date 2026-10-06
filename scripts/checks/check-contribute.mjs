import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { appendFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { root } from './lib.mjs'
import { runContribute } from '../stacks/contribute.mjs'

// End-to-end check of `swe-agents contribute` against a throwaway adopting repository.

const editedPath = '.claude/agents/python-feature-agent.md'
const editedOrigin = 'stacks/python/agents/python-feature-agent.md'
const localPath = '.claude/agents/example-local-agent.md'
const addedLine = '- Keep ExampleApp release notes in the change summary.'
const localPersona = `---
name: example-local-agent
description: Local owner for ExampleApp release-note drafts.
tools: Read, Grep, Glob
---

# Example Local Agent

## Purpose and Responsibility

Draft release notes for Project Alpha from merged changes.
`

// Silences the command's progress output so this check prints one line.
async function quietly(action) {
  const log = console.log
  console.log = () => {}
  try {
    return await action()
  } finally {
    console.log = log
  }
}

const temp = mkdtempSync(join(tmpdir(), 'swe-agents-check-contribute-'))
const target = join(temp, 'example-target')
try {
  mkdirSync(target)
  execFileSync(process.execPath, [join(root, 'scripts/stacks/install.mjs'), '--target', target, '--profile', 'python-api-docker'], {
    cwd: root,
    env: { ...process.env, INIT_CWD: root },
    stdio: 'pipe'
  })
  assert.ok(existsSync(join(target, '.agents/stacks.lock.json')), 'install writes the lock file')
  appendFileSync(join(target, editedPath), `\n${addedLine}\n`)
  writeFileSync(join(target, localPath), localPersona)

  const dryRun = await quietly(() => runContribute({ target, slug: 'check-dry-run', base: 'test', apply: false, dryRun: true, root }))
  assert.equal(dryRun.exitCode, 0, `dry run exit code: ${dryRun.error ?? ''}`)
  assert.ok(!existsSync(join(target, '.agents/contributions')), 'dry run writes nothing')

  const result = await quietly(() => runContribute({ target, slug: 'check-bundle', base: 'test', apply: false, dryRun: false, root }))
  assert.equal(result.exitCode, 0, `contribute exit code: ${result.error ?? ''}`)
  const bundle = join(target, '.agents/contributions/check-bundle')
  const manifestText = readFileSync(join(bundle, 'manifest.json'), 'utf8')
  assert.ok(!manifestText.includes('\\\\'), 'manifest paths use forward slashes')
  assert.ok(!manifestText.includes('\r'), 'manifest uses LF line endings')
  const manifest = JSON.parse(manifestText)

  assert.equal(manifest.bundleVersion, 1)
  assert.equal(manifest.slug, 'check-bundle')
  assert.match(manifest.createdAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)
  assert.match(manifest.source.commit, /^[0-9a-f]{40}$/)
  assert.equal(manifest.base, 'test')
  assert.ok(Array.isArray(manifest.items) && Array.isArray(manifest.skipped))
  for (const item of manifest.items) {
    assert.ok(['edit', 'new'].includes(item.kind), `item kind ${item.kind}`)
    assert.ok(['auto', 'needs-decision'].includes(item.decision), `item decision ${item.decision}`)
    assert.ok(['pass', 'warn'].includes(item.checks.sanitization) && ['pass', 'fail'].includes(item.checks.secrets))
    assert.equal(item.appliedCleanly, null, 'nothing is applied without --apply')
  }

  const edits = manifest.items.filter(item => item.kind === 'edit')
  assert.equal(edits.length, 1, 'one edit item')
  const [edit] = edits
  assert.equal(edit.targetPath, editedPath)
  assert.equal(edit.origin, editedOrigin)
  assert.equal(edit.pack, 'python')
  assert.equal(edit.decision, 'auto')
  assert.deepEqual(edit.checks, { sanitization: 'pass', secrets: 'pass' })
  assert.equal(edit.patch, `patches/${editedOrigin.split('/').join('__')}.patch`)
  const patchPath = join(bundle, edit.patch)
  assert.ok(statSync(patchPath).size > 0, 'the edit patch is not empty')
  const patch = readFileSync(patchPath, 'utf8')
  assert.ok(patch.includes(`--- a/${editedOrigin}\n+++ b/${editedOrigin}\n`), 'the patch targets the canonical path')
  assert.ok(patch.includes(`+${addedLine}\n`), 'the patch carries the local change')
  assert.equal(edit.patchBase, 'canonical', 'the change maps onto the canonical file')
  execFileSync('git', ['apply', '--check', '--cached', patchPath], { cwd: root, stdio: 'pipe' })

  const added = manifest.items.filter(item => item.kind === 'new')
  assert.equal(added.length, 1, 'one new item')
  const [proposal] = added
  assert.equal(proposal.targetPath, localPath)
  assert.equal(proposal.proposedOrigin, 'core/agents/example-local-agent.md')
  assert.equal(proposal.pack, null)
  assert.equal(proposal.decision, 'needs-decision')
  assert.equal(proposal.file, 'files/core/agents/example-local-agent.md')
  assert.equal(readFileSync(join(bundle, proposal.file), 'utf8'), localPersona)

  const summaryPath = join(bundle, 'SUMMARY.md')
  assert.ok(existsSync(summaryPath), 'SUMMARY.md exists')
  const summary = readFileSync(summaryPath, 'utf8')
  assert.ok(summary.includes('Origin: adopter repository'), 'SUMMARY.md carries the pull request origin line')
  assert.ok(summary.includes('Pack(s) affected: python'), 'SUMMARY.md names the affected pack')
  assert.ok(summary.includes('pnpm sync:setup && pnpm check:all'), 'SUMMARY.md lists the regeneration step')

  const worktrees = execFileSync('git', ['worktree', 'list', '--porcelain'], { cwd: root }).toString('utf8')
  assert.ok(!worktrees.includes('swe-agents-base-'), 'temporary worktrees are removed')
} finally {
  rmSync(temp, { recursive: true, force: true, maxRetries: 3 })
}

console.log('Contribute check passed: 1 edit and 1 new item bundled, patch verified against the canonical file.')
