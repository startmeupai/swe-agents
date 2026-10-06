import { existsSync, lstatSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { loadPacks, packChain, packKinds } from '../checks/lib.mjs'

// Suggests packs for a target repository by matching each pack's `detect`
// globs against the target's repository-relative paths. Detection only
// suggests; `init` asks before it installs.

export const ignoredDirectories = ['.git', 'node_modules', 'dist', 'build', '.next', 'coverage', 'vendor', 'target', '__pycache__', '.venv', 'venv']
export const fileLimit = 200000
const matchLimit = 25
const cache = new Map()

function escape(text) {
  return text.replace(/[.+^${}()|[\]\\]/g, '\\$&')
}

function segmentPattern(segment) {
  return [...segment].map(character => {
    if (character === '*') return '[^/]*'
    if (character === '?') return '[^/]'
    return escape(character)
  }).join('')
}

// Anchored at the target root. `*` and `?` stay within one path segment; a
// `**` segment matches any number of directories (a leading `**/` includes
// none, a trailing `/**` needs at least one entry below the directory).
export function globToRegExp(glob) {
  const segments = glob.replace(/\\/g, '/').replace(/^\.\//, '').split('/').filter(Boolean)
  let source = ''
  segments.forEach((segment, index) => {
    const last = index === segments.length - 1
    if (segment === '**') source += last ? '.+' : '(?:[^/]+/)*'
    else source += `${segmentPattern(segment)}${last ? '' : '/'}`
  })
  return new RegExp(`^${source}$`)
}

export function matchGlob(glob, path) {
  if (typeof glob !== 'string' || !glob || typeof path !== 'string') return false
  if (!cache.has(glob)) cache.set(glob, globToRegExp(glob))
  return cache.get(glob).test(path.replace(/\\/g, '/'))
}

// Repository-relative POSIX paths of regular files, skipping ignored
// directories and symbolic links; stops after `limit` files.
export function listFiles(target, { limit = fileLimit } = {}) {
  const files = []
  let truncated = false
  const visit = (directory, prefix) => {
    let entries
    try {
      entries = readdirSync(directory).sort()
    } catch {
      return
    }
    for (const entry of entries) {
      if (files.length >= limit) {
        truncated = true
        return
      }
      const path = join(directory, entry)
      let stats
      try {
        stats = lstatSync(path)
      } catch {
        continue
      }
      if (stats.isSymbolicLink()) continue
      const relative = prefix ? `${prefix}/${entry}` : entry
      if (stats.isDirectory()) {
        if (!ignoredDirectories.includes(entry)) visit(path, relative)
      } else if (stats.isFile()) files.push(relative)
    }
  }
  visit(target, '')
  return { files, truncated }
}

function packList(packs) {
  if (packs instanceof Map) return [...packs.values()]
  if (Array.isArray(packs)) return packs
  return [...loadPacks().values()]
}

const kindRank = pack => {
  const rank = packKinds.indexOf(pack.manifest.kind)
  return rank === -1 ? packKinds.length : rank
}
const byKindThenName = (left, right) => kindRank(left) - kindRank(right) || (left.name < right.name ? -1 : left.name > right.name ? 1 : 0)

// Returns the packs with at least one match, ordered by kind (language,
// framework, platform, verification) and then name:
// [{ name, kind, matches: [path, ...], matchCount, requires: [pack, ...] }].
// `matches` lists up to 25 paths; `requires` is every pack the pack pulls in.
export function detectPacks(target, packs = loadPacks()) {
  if (!existsSync(target) || !lstatSync(target).isDirectory()) throw new Error(`Target ${target} is not an existing directory`)
  const list = packList(packs).filter(pack => pack?.manifest && Array.isArray(pack.manifest.detect))
  const byName = packs instanceof Map ? packs : new Map(list.map(pack => [pack.name, pack]))
  const { files } = listFiles(target)
  const detected = []
  for (const pack of [...list].sort(byKindThenName)) {
    const globs = pack.manifest.detect.filter(glob => typeof glob === 'string' && glob.trim())
    const matches = files.filter(path => globs.some(glob => matchGlob(glob, path)))
    if (!matches.length) continue
    detected.push({
      name: pack.name,
      kind: pack.manifest.kind ?? null,
      matches: matches.slice(0, matchLimit),
      matchCount: matches.length,
      requires: packChain(pack.name, byName).filter(name => name !== pack.name)
    })
  }
  return detected
}
