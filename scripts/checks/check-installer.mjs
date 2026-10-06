import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { loadPacks, root } from './lib.mjs'
import { findManagedBlock, normalized, sha256 } from '../stacks/engine.mjs'
import { detectPacks, matchGlob } from '../stacks/detect.mjs'
import {
  InstallError, applyPlan, lockPath, planInstall, readLock, renderAtCommit, runUpdate, serializeLock, threeWayMerge
} from '../stacks/installer.mjs'
import { defaultRepo, describeCheckout } from '../stacks/source.mjs'

// Installer, lock, merge, update, and detection behaviour in temporary targets
// under the OS temp directory. Git-dependent steps run when this repository is
// a Git checkout; the rest use a synthetic source commit.

const scratch = mkdtempSync(join(tmpdir(), 'swe-agents-installer-check-'))
const quiet = () => {}
const persona = '.claude/agents/python-feature-agent.md'
const hexCommit = /^[0-9a-f]{40}$/
const hexHash = /^[0-9a-f]{64}$/
let assertions = 0

function directory(...parts) {
  const path = join(scratch, ...parts)
  mkdirSync(path, { recursive: true })
  return path
}

function text(target, path) {
  return normalized(readFileSync(join(target, path))).toString('utf8')
}

function write(target, path, content) {
  mkdirSync(join(target, path, '..'), { recursive: true })
  writeFileSync(join(target, path), content)
}

function rawLock(target) {
  return JSON.parse(readFileSync(join(target, lockPath), 'utf8'))
}

function setLockHash(target, path, hash) {
  const lock = rawLock(target)
  lock.files[path] = hash
  writeFileSync(join(target, lockPath), serializeLock(lock))
}

function step(plan, path) {
  const found = plan.steps.find(item => item.path === path)
  assert.ok(found, `plan has a step for ${path}`)
  return found
}

function fakeBase(commit, { path = null, content = null, block = null } = {}) {
  return {
    commit,
    outputs: new Map(path ? [[path, { content: Buffer.from(content), source: 'fixture' }]] : []),
    blocks: block ? { fresh: block, appended: block } : {}
  }
}

function replaceLine(content, pattern, replacement) {
  const lines = content.split('\n')
  const index = lines.findIndex(line => pattern.test(line))
  assert.ok(index > 0, `found a line matching ${pattern}`)
  lines[index] = replacement
  return lines.join('\n')
}

function check(description, run) {
  run()
  assertions += 1
  return description
}

async function checkAsync(description, run) {
  await run()
  assertions += 1
  return description
}

const checkout = describeCheckout(root)
const gitSource = Boolean(checkout.commit)
const source = gitSource ? checkout : { dir: root, repo: defaultRepo, ref: 'main', commit: 'a'.repeat(40), dirty: false }

try {
  // -------------------------------------------------------------------------
  // Glob matcher and detection

  check('matchGlob follows the documented subset', () => {
    const cases = [
      ['Dockerfile', 'Dockerfile', true], ['Dockerfile', 'app/Dockerfile', false],
      ['**/Dockerfile*', 'Dockerfile', true], ['**/Dockerfile*', 'deploy/api/Dockerfile.prod', true],
      ['**/*.py', 'main.py', true], ['**/*.py', 'src/pkg/main.py', true], ['**/*.py', 'main.pyc', false],
      ['e2e/**', 'e2e/specs/login.spec.ts', true], ['e2e/**', 'e2e', false], ['e2e/**', 'src/e2e/x.ts', false],
      ['app/**/*.tsx', 'app/page.tsx', true], ['app/**/*.tsx', 'app/a/b/page.tsx', true], ['app/**/*.tsx', 'src/app/page.tsx', false],
      ['playwright.config.*', 'playwright.config.ts', true], ['playwright.config.*', 'tests/playwright.config.ts', false],
      ['wrangler.jsonc', 'wranglerXjsonc', false], ['?.md', 'a.md', true], ['?.md', 'ab.md', false], ['*.md', 'docs/a.md', false]
    ]
    for (const [glob, path, expected] of cases) assert.equal(matchGlob(glob, path), expected, `${glob} vs ${path}`)
  })

  check('detectPacks suggests python and docker for pyproject.toml and a Dockerfile', () => {
    const fixture = directory('detect-python')
    write(fixture, 'pyproject.toml', '[project]\nname = "example-app"\n')
    write(fixture, 'Dockerfile', 'FROM example.invalid/base\n')
    write(fixture, 'src/example_app/main.py', 'print("ExampleApp")\n')
    for (const ignored of ['node_modules/pkg/tsconfig.json', '.venv/lib/site.ts', 'dist/bundle.ts', '.git/hooks/x.ts']) write(fixture, ignored, '{}\n')
    const detected = detectPacks(fixture, loadPacks())
    assert.deepEqual(detected.map(pack => pack.name), ['python', 'docker'])
    const python = detected.find(pack => pack.name === 'python')
    assert.equal(python.kind, 'language')
    assert.deepEqual(python.matches, ['pyproject.toml', 'src/example_app/main.py'])
    assert.deepEqual(python.requires, [])
    assert.deepEqual(detected.find(pack => pack.name === 'docker').matches, ['Dockerfile'])
  })

  check('detectPacks reports the packs a detected pack pulls in', () => {
    const fixture = directory('detect-browser')
    write(fixture, 'playwright.config.ts', 'export default {}\n')
    const playwright = detectPacks(fixture, loadPacks()).find(pack => pack.name === 'playwright')
    assert.ok(playwright, 'playwright detected')
    assert.ok(playwright.requires.includes('typescript'), 'playwright pulls in typescript')
  })

  // -------------------------------------------------------------------------
  // Three-way merge primitive

  check('threeWayMerge merges separate edits and normalizes line endings', () => {
    const result = threeWayMerge({ ours: 'a\r\nb\r\nc\r\nd\r\ne\r\nlocal\r\n', base: 'a\nb\nc\nd\ne\n', theirs: 'A\nb\nc\nd\ne\n' })
    assert.equal(result.clean, true)
    assert.equal(result.content.toString('utf8'), 'A\nb\nc\nd\ne\nlocal\n')
  })

  check('threeWayMerge reports overlapping edits as a conflict', () => {
    const result = threeWayMerge({ ours: 'a\nX\nc\n', base: 'a\nb\nc\n', theirs: 'a\nY\nc\n', labels: ['local', 'base', 'upstream'] })
    assert.equal(result.clean, false)
    assert.ok(result.conflicts >= 1)
    assert.match(result.content.toString('utf8'), /^<<<<<<< local\nX\n=======\nY\n>>>>>>> upstream$/m)
  })

  check('threeWayMerge never merges binary content', () => {
    const result = threeWayMerge({ ours: Buffer.from([0, 1, 2]), base: Buffer.from([0, 1]), theirs: Buffer.from([0, 3]) })
    assert.equal(result.clean, false)
    assert.equal(result.binary, true)
  })

  // -------------------------------------------------------------------------
  // Install and lock version 2

  const target = directory('target')
  check('install writes the python-api-docker profile with a version 2 lock', () => {
    const plan = planInstall({ target, profile: 'python-api-docker', source })
    assert.ok(plan.steps.every(item => ['create', 'keep'].includes(item.action) || item.path === '.github/copilot-instructions.md'))
    applyPlan(plan)
    const lock = rawLock(target)
    assert.deepEqual(Object.keys(lock), ['lockVersion', 'source', 'profile', 'packs', 'files', 'origins'])
    assert.equal(lock.lockVersion, 2)
    assert.deepEqual(Object.keys(lock.source), ['repo', 'ref', 'commit'])
    assert.match(lock.source.commit, hexCommit)
    assert.equal(lock.source.commit, source.commit)
    assert.equal(lock.source.repo, source.repo)
    assert.equal(lock.profile, 'python-api-docker')
    assert.deepEqual(lock.packs.map(pack => pack.name), ['python', 'docker'])
    const paths = Object.keys(lock.files)
    assert.deepEqual(paths, [...paths].sort((left, right) => (left < right ? -1 : left > right ? 1 : 0)))
    assert.ok(paths.includes('AGENTS.md') && paths.includes(persona))
    for (const [path, hash] of Object.entries(lock.files)) {
      assert.match(hash, hexHash)
      assert.ok(!path.includes('\\'), `${path} is a POSIX path`)
    }
    assert.equal(lock.origins[persona], 'stacks/python/agents/python-feature-agent.md')
    assert.equal(lock.origins['.github/agents/python-feature-agent.agent.md'], 'stacks/python/agents/python-feature-agent.md')
    assert.equal(lock.origins['.agents/skills/python-testing/SKILL.md'], 'stacks/python/skills/python-testing/SKILL.md')
    assert.equal(lock.origins['.claude/skills/docs-generation/SKILL.md'], 'core/skills/docs-generation/SKILL.md')
    for (const composed of ['AGENTS.md', '.codex/config.toml', '.codex/agents/python_feature_agent.toml', '.github/copilot-instructions.md']) {
      assert.equal(lock.origins[composed], undefined, `${composed} has no origin`)
    }
    for (const [path, origin] of Object.entries(lock.origins)) {
      assert.ok(lock.files[path], `${path} with an origin is locked`)
      assert.ok(existsSync(join(root, origin)), `${origin} exists in the source`)
    }
    const read = readLock(target)
    assert.equal(read.lockVersion, 2)
    assert.equal(read.origins[persona], lock.origins[persona])
    assert.deepEqual(read.bases, {})
  })

  check('a second install plans no changes', () => {
    const plan = planInstall({ target, profile: 'python-api-docker', source })
    assert.equal(plan.lockChanged, false)
    assert.ok(plan.steps.every(item => item.action === 'unchanged' || item.action === 'keep'), 'every step is unchanged')
  })

  check('readLock accepts a version 1 lock and refuses a missing commit on write', () => {
    const legacy = directory('legacy')
    write(legacy, lockPath, `${JSON.stringify({ source: { repo: 'swe-agents', commit: null }, profile: null, packs: [{ name: 'python', version: '0.1.0' }], files: { 'AGENTS.md': 'b'.repeat(64), '../outside': 'c'.repeat(64) } })}\n`)
    const lock = readLock(legacy)
    assert.equal(lock.lockVersion, 1)
    assert.deepEqual(lock.origins, {})
    assert.equal(lock.source.repo, 'swe-agents')
    assert.equal(lock.source.commit, null)
    assert.deepEqual(lock.ignored, ['../outside'])
    assert.equal(readLock(directory('no-lock')), null)
    const plan = planInstall({ target: directory('no-commit'), packs: ['python'], source: { repo: defaultRepo, ref: 'main', commit: null } })
    assert.throws(() => applyPlan(plan), InstallError)
  })

  // -------------------------------------------------------------------------
  // Edited files: skip, clean merge, conflict, resolution, --force

  const pristine = text(target, persona)
  const commit = source.commit
  const olderTitle = replaceLine(pristine, /^# /, '# Older Python Feature Persona')
  const localLine = 'Local rule for ExampleApp: keep handlers thin.\n'

  check('an edited file is skipped without merge', () => {
    write(target, persona, `${pristine}${localLine}`)
    assert.equal(step(planInstall({ target, profile: 'python-api-docker', source }), persona).action, 'skip-edited')
  })

  check('a clean three-way merge keeps the local edit and records the new pristine hash', () => {
    // Installed at an older commit, then edited locally; upstream has since changed the title.
    write(target, persona, `${olderTitle}${localLine}`)
    setLockHash(target, persona, sha256(olderTitle))
    const plan = planInstall({ target, profile: 'python-api-docker', source, merge: true, baseOutputs: fakeBase(commit, { path: persona, content: olderTitle }) })
    const merged = step(plan, persona)
    assert.equal(merged.action, 'merge')
    applyPlan(plan)
    assert.equal(text(target, persona), `${pristine}${localLine}`)
    assert.equal(rawLock(target).files[persona], sha256(pristine))
    assert.equal(rawLock(target).bases, undefined)
  })

  check('a merge with no upstream change keeps the file unchanged', () => {
    const plan = planInstall({ target, profile: 'python-api-docker', source, merge: true, baseOutputs: fakeBase(commit, { path: persona, content: pristine }) })
    const kept = step(plan, persona)
    assert.equal(kept.action, 'unchanged')
    assert.match(kept.note, /local edits kept/)
  })

  check('a merge whose base does not match the lock hash is skipped', () => {
    const plan = planInstall({ target, profile: 'python-api-docker', source, merge: true, baseOutputs: fakeBase(commit, { path: persona, content: olderTitle }) })
    assert.equal(step(plan, persona).action, 'skip-edited')
  })

  const localTitle = `${replaceLine(pristine, /^# /, '# Local Python Feature Persona')}${localLine}`
  const conflictBase = () => fakeBase(commit, { path: persona, content: olderTitle })

  check('overlapping edits are skipped as a conflict and recorded in the lock', () => {
    write(target, persona, localTitle)
    setLockHash(target, persona, sha256(olderTitle))
    const plan = planInstall({ target, profile: 'python-api-docker', source, merge: true, baseOutputs: conflictBase() })
    const conflict = step(plan, persona)
    assert.equal(conflict.action, 'skip-conflict')
    assert.equal(conflict.write, undefined)
    assert.ok(conflict.conflict.hunks.some(line => line.startsWith('<<<<<<< ')))
    applyPlan(plan)
    assert.equal(text(target, persona), localTitle)
    const lock = rawLock(target)
    assert.equal(lock.files[persona], sha256(olderTitle))
    assert.deepEqual(lock.bases[persona], { commit, ours: sha256(Buffer.from(localTitle)) })
    assert.equal(step(planInstall({ target, profile: 'python-api-docker', source, merge: true, baseOutputs: conflictBase() }), persona).action, 'skip-conflict')
  })

  check('a conflict resolved by hand merges against the version it was resolved against', () => {
    write(target, persona, `${pristine}${localLine}`)
    const plan = planInstall({ target, profile: 'python-api-docker', source, merge: true, baseOutputs: fakeBase(commit, { path: persona, content: pristine }) })
    assert.equal(step(plan, persona).action, 'unchanged')
    applyPlan(plan)
    const lock = rawLock(target)
    assert.equal(lock.files[persona], sha256(pristine))
    assert.equal(lock.bases, undefined)
  })

  check('--force overwrites a conflicting file with the new pristine content', () => {
    write(target, persona, localTitle)
    setLockHash(target, persona, sha256(olderTitle))
    const plan = planInstall({ target, profile: 'python-api-docker', source, merge: true, force: true, baseOutputs: conflictBase() })
    assert.equal(step(plan, persona).action, 'overwrite')
    applyPlan(plan)
    assert.equal(text(target, persona), pristine)
    assert.equal(rawLock(target).files[persona], sha256(pristine))
  })

  check('the AGENTS.md managed block merges and text outside it stays untouched', () => {
    const current = text(target, 'AGENTS.md')
    const found = findManagedBlock(current)
    assert.ok(found && !found.error)
    const olderBlock = replaceLine(found.block, /^## /, '## Older Core Heading')
    const localBlock = olderBlock.replace(/\n\n(<!-- swe-agents:end -->)$/, '\n\nLocal block rule for Project Alpha.\n\n$1')
    assert.notEqual(localBlock, olderBlock)
    const outside = '\n## Project Alpha Rules\n\nKeep this outside the managed block.\n'
    write(target, 'AGENTS.md', `${found.before}${localBlock}${found.after.trimEnd()}\n${outside}`)
    setLockHash(target, 'AGENTS.md', sha256(olderBlock))
    const plan = planInstall({ target, profile: 'python-api-docker', source, merge: true, baseOutputs: fakeBase(commit, { block: olderBlock }) })
    assert.equal(step(plan, 'AGENTS.md').action, 'merge')
    applyPlan(plan)
    const merged = text(target, 'AGENTS.md')
    assert.ok(merged.includes('Local block rule for Project Alpha.'))
    assert.ok(merged.endsWith(outside))
    assert.ok(!merged.includes('Older Core Heading'))
    assert.equal(rawLock(target).files['AGENTS.md'], sha256(found.block))
  })

  // -------------------------------------------------------------------------
  // Real update against the rendering at the lock commit (Git checkouts only)

  if (gitSource) {
    const updated = directory('update')
    applyPlan(planInstall({ target: updated, profile: 'python-api-docker', source }))
    const installed = text(updated, persona)
    write(updated, persona, `${installed}${localLine}`)

    await checkAsync('renderAtCommit renders the installed outputs at the lock commit', async () => {
      const lock = readLock(updated)
      const base = await renderAtCommit({ commit: lock.source.commit, packs: lock.packs, profile: lock.profile, target: updated })
      assert.ok(base, 'the lock commit renders')
      assert.ok(base.outputs instanceof Map && base.outputs.has(persona))
      assert.equal(typeof base.blocks.fresh, 'string')
      const plan = planInstall({ target: updated, profile: 'python-api-docker', source, merge: true, baseOutputs: base })
      const planned = step(plan, persona)
      // A source checkout with uncommitted changes renders differently at HEAD; the file is then skipped, never overwritten.
      const verified = sha256(base.outputs.get(persona).content) === lock.files[persona]
      assert.equal(planned.action, verified ? 'unchanged' : 'skip-edited')
      assert.equal(await renderAtCommit({ commit: '0'.repeat(40), packs: [], target: updated }), null)
    })

    await checkAsync('runUpdate keeps local edits and rewrites a version 2 lock', async () => {
      const output = []
      const code = await runUpdate({ target: updated, source, log: line => output.push(line) })
      assert.ok([0, 2].includes(code), `update exit code ${code}`)
      assert.equal(output[0], 'swe-agents update')
      assert.equal(text(updated, persona), `${installed}${localLine}`)
      const lock = rawLock(updated)
      assert.equal(lock.lockVersion, 2)
      assert.equal(lock.source.commit, source.commit)
      const worktrees = execFileSync('git', ['worktree', 'list', '--porcelain'], { cwd: root }).toString()
      assert.ok(!worktrees.includes('swe-agents-base-'), 'temporary worktrees are removed')
    })

    check('the command-line entry points run', () => {
      const node = (args, options = {}) => spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...options })
      const cli = join(root, 'scripts/stacks/cli.mjs')
      const version = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version
      assert.equal(node([cli, '--version']).stdout.trim(), `swe-agents ${version}`)
      const detected = node([cli, 'detect', '--target', join(scratch, 'detect-python'), '--json'])
      assert.equal(detected.status, 0, detected.stderr)
      assert.deepEqual(JSON.parse(detected.stdout).packs.map(pack => pack.name), ['python', 'docker'])
      const fresh = directory('cli-init')
      const dry = node([cli, 'init', '--target', fresh, '--profile', 'python-api-docker', '--yes', '--dry-run'])
      assert.equal(dry.status, 0, dry.stderr)
      assert.ok(!existsSync(join(fresh, lockPath)), 'init --dry-run writes nothing')
      const unconfirmed = node([cli, 'init', '--target', fresh, '--profile', 'python-api-docker'])
      assert.equal(unconfirmed.status, 2, unconfirmed.stderr)
      assert.ok(!existsSync(join(fresh, lockPath)), 'init without a terminal or --yes writes nothing')
      const update = node([cli, 'update', '--target', updated, '--dry-run'])
      assert.ok([0, 2].includes(update.status), update.stderr)
      assert.ok(update.stdout.startsWith('swe-agents update (dry run)'))
      const wrapper = node([join(root, 'scripts/stacks/install.mjs'), '--target', fresh, '--profile', 'python-api-docker', '--dry-run'])
      assert.equal(wrapper.status, 0, wrapper.stderr)
      assert.match(wrapper.stdout, /^Result \(dry run\): \d+ change\(s\) planned; nothing written$/m)
    })
  }
} finally {
  rmSync(scratch, { recursive: true, force: true })
}

console.log(`Installer check passed: ${assertions} scenarios (install, lock v2, merge, conflict, --force, detection${gitSource ? ', update, CLI' : '; Git-only steps skipped outside a checkout'}).`)
