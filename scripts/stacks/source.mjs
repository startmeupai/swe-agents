import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, realpathSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Resolves the swe-agents checkout that the CLI reads core, packs, and profiles
// from: the checkout the CLI runs from, or a cached clone for `npx` launches.
// Only `git` is used, and only against that checkout and its configured remote.

export const defaultRepo = 'https://github.com/startmeupai/swe-agents'
export const defaultRef = 'main'
export const commitPattern = /^[0-9a-f]{40}$/
const refPattern = /^(?!-)(?!.*\.\.)[A-Za-z0-9._/-]+$/

const here = dirname(fileURLToPath(import.meta.url))

export class SourceError extends Error {
  constructor(message) {
    super(message)
    this.name = 'SourceError'
  }
}

function gitEnvironment() {
  // Never block on a credential prompt; fail with git's message instead.
  return { ...process.env, GIT_TERMINAL_PROMPT: '0' }
}

export function git(args, cwd) {
  try {
    return execFileSync('git', args, { cwd, stdio: ['ignore', 'pipe', 'pipe'], env: gitEnvironment(), maxBuffer: 64 * 1024 * 1024 })
      .toString()
      .trim()
  } catch (error) {
    const detail = error.stderr?.toString().trim() || error.message
    throw new SourceError(`git ${args.join(' ')} failed: ${detail}`)
  }
}

function tryGit(args, cwd) {
  try {
    return git(args, cwd)
  } catch {
    return null
  }
}

export function isValidRef(ref) {
  return typeof ref === 'string' && refPattern.test(ref)
}

// GitHub SSH and HTTPS forms compare equal; credentials and `.git` are dropped.
export function normalizeRepoUrl(url) {
  if (typeof url !== 'string' || !url.trim()) return null
  let text = url.trim()
  const scp = text.match(/^[A-Za-z0-9._-]+@([A-Za-z0-9.-]+):(.+)$/)
  if (scp) text = `https://${scp[1]}/${scp[2]}`
  text = text.replace(/^(?:ssh|git):\/\/(?:[^@/]+@)?([^/:]+)(?::\d+)?\//, 'https://$1/')
  text = text.replace(/^(https?:\/\/)[^@/]+@/, '$1')
  return text.replace(/\/+$/, '').replace(/\.git$/, '')
}

export function sameRepo(left, right) {
  const a = normalizeRepoUrl(left)
  const b = normalizeRepoUrl(right)
  return Boolean(a && b && a.toLowerCase() === b.toLowerCase())
}

function hasLayout(directory) {
  return ['core', 'stacks', 'profiles'].every(entry => existsSync(join(directory, entry)))
}

// Nearest directory at or above `start` that holds core/, stacks/, and profiles/.
export function findLayoutRoot(start = here) {
  let directory = resolve(start)
  while (true) {
    if (hasLayout(directory)) return directory
    const parent = dirname(directory)
    if (parent === directory) return null
    directory = parent
  }
}

// The checkout the running CLI belongs to, or null when it is not a Git checkout
// of its own (an `npx` cache, a vendored copy, or an archive download).
export function findCheckout(start = here) {
  const directory = findLayoutRoot(start)
  if (!directory || !existsSync(join(directory, '.git'))) return null
  return directory
}

// Repository URL, ref, and commit of a checkout; `commit` is null when the
// directory is not the top level of a Git work tree.
export function describeCheckout(dir) {
  const top = tryGit(['rev-parse', '--show-toplevel'], dir)
  let isTop = false
  try {
    isTop = Boolean(top) && realpathSync(top) === realpathSync(dir)
  } catch {
    isTop = false
  }
  const head = isTop ? tryGit(['rev-parse', 'HEAD'], dir) : null
  const commit = head && commitPattern.test(head) ? head : null
  const branch = isTop ? tryGit(['symbolic-ref', '--quiet', '--short', 'HEAD'], dir) : null
  const origin = isTop ? normalizeRepoUrl(tryGit(['remote', 'get-url', 'origin'], dir)) : null
  const status = isTop ? tryGit(['status', '--porcelain', '--', 'core', 'stacks', 'profiles', 'scripts', 'docs/agent-routing.md'], dir) : null
  return {
    dir,
    repo: origin ?? defaultRepo,
    ref: branch || commit || defaultRef,
    commit,
    dirty: Boolean(status)
  }
}

export function cacheDirectory() {
  const home = process.env.SWE_AGENTS_HOME?.trim() || join(homedir(), '.swe-agents')
  return join(resolve(home), 'source')
}

// Source repository for the cached clone: SWE_AGENTS_REPO when set, else upstream.
export function configuredRepo() {
  return normalizeRepoUrl(process.env.SWE_AGENTS_REPO) ?? defaultRepo
}

// The branch the remote's HEAD points at, such as `main`.
function remoteDefaultBranch(dir) {
  const head = tryGit(['symbolic-ref', '--quiet', '--short', 'refs/remotes/origin/HEAD'], dir)
  return head?.startsWith('origin/') ? head.slice('origin/'.length) : defaultRef
}

function checkoutRef(dir, ref) {
  git(['checkout', '--quiet', ref, '--'], dir)
  if (tryGit(['symbolic-ref', '--quiet', 'HEAD'], dir)) git(['pull', '--ff-only', '--quiet'], dir)
}

// Returns { dir, repo, ref, commit, kind, dirty, notes }. `kind` is `checkout`
// when the CLI runs from a swe-agents clone (used as it is) and `cache` for the
// clone under $SWE_AGENTS_HOME/source, which follows `ref` or else the remote's
// default branch; `forUpdate` fetches and fast-forwards it first. `repo` (from a lock) must match the
// cache's source; another repository is used only when SWE_AGENTS_REPO names it.
export function resolveSource({ ref = null, forUpdate = false, repo = null, start = here } = {}) {
  const notes = []
  if (ref !== null && ref !== undefined && !isValidRef(ref)) throw new SourceError(`--ref ${ref} is not a valid branch, tag, or commit name`)
  const checkout = findCheckout(start)
  if (checkout) {
    const described = describeCheckout(checkout)
    if (ref && ref !== described.ref && ref !== described.commit) {
      notes.push(`ref ${ref} is not checked out in the source checkout ${checkout}; it is used as it is, at ${described.ref}. Check out ${ref} there to follow it.`)
    }
    if (repo && normalizeRepoUrl(repo)?.includes('://') && !sameRepo(repo, described.repo)) {
      notes.push(`the lock's source ${normalizeRepoUrl(repo)} differs from this checkout's origin ${described.repo}`)
    }
    return { ...described, kind: 'checkout', notes }
  }

  const url = configuredRepo()
  const locked = normalizeRepoUrl(repo)
  if (locked && locked.includes('://') && !sameRepo(locked, url)) {
    throw new SourceError(
      `The lock's source is ${locked}, but the cached source follows ${url}. ` +
      'Set SWE_AGENTS_REPO to the lock\'s repository to trust it, or run the CLI from a clone of that repository.'
    )
  }
  const dir = cacheDirectory()
  if (!existsSync(join(dir, '.git'))) {
    if (existsSync(dir)) throw new SourceError(`${dir} exists but is not a Git clone; remove it or set SWE_AGENTS_HOME`)
    mkdirSync(dirname(dir), { recursive: true })
    git(['clone', '--quiet', '--', url, dir], dirname(dir))
    if (ref) checkoutRef(dir, ref)
    notes.push(`cloned ${url} into ${dir}`)
  } else {
    const origin = normalizeRepoUrl(tryGit(['remote', 'get-url', 'origin'], dir))
    if (!sameRepo(origin, url)) {
      throw new SourceError(`${dir} is a clone of ${origin ?? 'an unknown repository'}, not ${url}; remove it or set SWE_AGENTS_HOME`)
    }
    if (forUpdate) {
      git(['fetch', '--prune', '--quiet', 'origin'], dir)
      checkoutRef(dir, ref || remoteDefaultBranch(dir))
    }
  }
  const described = describeCheckout(dir)
  if (!described.commit) throw new SourceError(`${dir}: cannot determine the source commit`)
  return { ...described, repo: url, kind: 'cache', notes }
}
