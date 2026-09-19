import { existsSync, lstatSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

export function walk(start, predicate = () => true) {
  if (!existsSync(start)) return []
  const files = []
  for (const entry of readdirSync(start).sort()) {
    if (entry === 'node_modules' || entry === '.git') continue
    const path = join(start, entry)
    const stats = lstatSync(path)
    if (stats.isSymbolicLink()) continue
    if (stats.isDirectory()) files.push(...walk(path, predicate))
    else if (predicate(path)) files.push(path)
  }
  return files
}

export function symbolicLinks(start) {
  if (!existsSync(start)) return []
  const links = []
  for (const entry of readdirSync(start).sort()) {
    if (entry === 'node_modules' || entry === '.git') continue
    const path = join(start, entry)
    const stats = lstatSync(path)
    if (stats.isSymbolicLink()) links.push(path)
    else if (stats.isDirectory()) links.push(...symbolicLinks(path))
  }
  return links
}

export function markdownFiles() {
  return walk(root, path => path.endsWith('.md'))
}

export function read(path) {
  return readFileSync(path, 'utf8')
}

export function label(path) {
  return relative(root, path).split('\\').join('/')
}

export function parseFrontmatter(path) {
  const content = read(path)
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/)
  if (!match) return { content, data: null }
  const data = {}
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/)
    if (!field) continue
    data[field[1]] = field[2].replace(/^['"]|['"]$/g, '').trim()
  }
  return { content, data }
}

export function finish(title, failures, success) {
  if (failures.length > 0) {
    console.error(`${title} failed (${failures.length}):`)
    for (const failure of failures) console.error(`- ${failure}`)
    process.exit(1)
  }
  console.log(success)
}
