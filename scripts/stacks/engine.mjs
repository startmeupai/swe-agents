import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { join, posix, relative } from 'node:path'
import { arrayOf, listValue, namePattern, parseFrontmatterText, readOnlyFor } from '../checks/lib.mjs'

// Shared by scripts/stacks/install.mjs (a target repository) and
// scripts/runtime/sync-agent-setup.mjs (this repository's `reference` profile).

export const runtimeDirectories = ['.claude/agents', '.claude/skills', '.agents/skills', '.codex/agents', '.github/agents']
export const blockBegin = '<!-- swe-agents:begin -->'
export const blockEnd = '<!-- swe-agents:end -->'
const blockNotice = '<!-- Managed by the swe-agents installer. Rerun it to update this block; keep project rules outside it. -->'

export function sha256(content) {
  return createHash('sha256').update(content).digest('hex')
}

function isText(buffer) {
  return !buffer.subarray(0, 8000).includes(0)
}

// Text is compared and written with LF endings so CRLF checkouts do not look edited.
export function normalized(content) {
  const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8')
  if (!isText(buffer)) return buffer
  return Buffer.from(buffer.toString('utf8').replace(/\r\n/g, '\n'), 'utf8')
}

function readText(path) {
  return readFileSync(path, 'utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n')
}

// ---------------------------------------------------------------------------
// Markdown helpers

const schemePattern = /^[A-Za-z][A-Za-z0-9+.-]*:/

function fenceMarker(line) {
  return line.match(/^\s{0,3}(`{3,}|~{3,})/)?.[1][0] ?? null
}

// Calls `transform` for every non-code line; fenced blocks pass through untouched.
function mapProse(text, transform) {
  let fence = null
  return text.split('\n').map(line => {
    const marker = fenceMarker(line)
    if (marker) {
      if (fence === null) fence = marker
      else if (marker === fence) fence = null
      return line
    }
    return fence === null ? transform(line) : line
  }).join('\n')
}

function mapLinkTargets(text, transform) {
  return mapProse(text, line => {
    const definition = line.match(/^(\s{0,3}\[[^\]]+\]:\s+)(\S+)(.*)$/)
    if (definition) return `${definition[1]}${transform(definition[2])}${definition[3]}`
    return line.split(/(`+[^`]*`+)/).map((part, index) => (index % 2
      ? part
      : part.replace(/(\]\()([^)\s]+)/g, (all, open, target) => `${open}${transform(target)}`))).join('')
  })
}

export function relativeLinkTargets(text) {
  const targets = []
  mapLinkTargets(text, target => {
    if (target && !target.startsWith('#') && !target.startsWith('/') && !target.startsWith('<') && !schemePattern.test(target)) {
      targets.push(target)
    }
    return target
  })
  return targets
}

function splitTarget(target) {
  const cut = target.search(/[?#]/)
  return cut === -1 ? [target, ''] : [target.slice(0, cut), target.slice(cut)]
}

// Rewrites relative links in `text` (authored at `fromPath`) so they reach the
// same destination from `toPath`. `mapPath` redirects catalog sources, such as
// `core/skills/x/SKILL.md`, to their installed copies.
export function rebaseLinks(text, fromPath, toPath, mapPath = () => null) {
  if (fromPath === toPath) return text
  return mapLinkTargets(text, target => {
    if (!target || target.startsWith('#') || target.startsWith('/') || target.startsWith('<') || schemePattern.test(target)) return target
    const [path, suffix] = splitTarget(target)
    if (!path) return target
    let decoded
    try {
      decoded = decodeURIComponent(path)
    } catch {
      return target
    }
    const resolved = posix.normalize(posix.join(posix.dirname(fromPath), decoded)).replace(/\/$/, '')
    const destination = mapPath(resolved) ?? resolved
    // Keep the author's text whenever it already reaches the destination from the new location.
    if (posix.normalize(posix.join(posix.dirname(toPath), decoded)).replace(/\/$/, '') === destination) return target
    let rebased = posix.relative(posix.dirname(toPath), destination) || '.'
    if (decoded.endsWith('/') && !rebased.endsWith('/')) rebased += '/'
    return `${encodeURI(rebased)}${suffix}`
  })
}

export function demoteHeadings(text, levels = 1) {
  return mapProse(text, line => {
    const heading = line.match(/^(#{1,6})(\s.*|)$/)
    if (!heading) return line
    return `${'#'.repeat(Math.min(6, heading[1].length + levels))}${heading[2]}`
  })
}

// Splits the first H1 from a document; returns its line, its text, and the rest.
function splitH1(text) {
  let fence = null
  const lines = text.split('\n')
  for (let index = 0; index < lines.length; index += 1) {
    const marker = fenceMarker(lines[index])
    if (marker) {
      if (fence === null) fence = marker
      else if (marker === fence) fence = null
      continue
    }
    if (fence === null && /^# \S/.test(lines[index])) {
      return {
        line: lines[index],
        title: lines[index].slice(2).trim(),
        rest: [...lines.slice(0, index), ...lines.slice(index + 1)].join('\n').trim()
      }
    }
  }
  return { line: null, title: null, rest: text.trim() }
}

export function packTitle(pack) {
  const { title } = splitH1(existsSync(pack.agentsMd) ? readText(pack.agentsMd) : '')
  const stripped = title?.replace(/\s+(?:(?:stack|pack)\s+)?(?:rules|instructions|guidelines)$/i, '').trim()
  return stripped || pack.name
}

// ---------------------------------------------------------------------------
// Catalog path mapping per output family

function pathMapper(catalog, { skillsDir, agentPath }) {
  const agents = new Map([...catalog.agents.values()].map(entry => [entry.label, agentPath(entry.name)]))
  const skills = [...catalog.skills.values()].map(entry => [entry.dirLabel, `${skillsDir}/${entry.name}`])
  return resolved => {
    if (agents.has(resolved)) return agents.get(resolved)
    for (const [source, destination] of skills) {
      if (resolved === source) return destination
      if (resolved.startsWith(`${source}/`)) return `${destination}${resolved.slice(source.length)}`
    }
    return null
  }
}

function families(catalog, target) {
  const githubSkills = existsSync(join(target, '.github/skills')) ? '.github/skills' : '.agents/skills'
  return {
    claude: pathMapper(catalog, { skillsDir: '.claude/skills', agentPath: name => `.claude/agents/${name}.md` }),
    agents: pathMapper(catalog, { skillsDir: '.agents/skills', agentPath: name => `.claude/agents/${name}.md` }),
    github: pathMapper(catalog, { skillsDir: githubSkills, agentPath: name => `.github/agents/${name}.agent.md` }),
    root: pathMapper(catalog, { skillsDir: '.agents/skills', agentPath: name => `.claude/agents/${name}.md` })
  }
}

// ---------------------------------------------------------------------------
// Persona outputs

function removeFrontmatterField(text, key) {
  const match = text.match(/^---\n([\s\S]*?)\n---(\n|$)/)
  if (!match) return text
  const lines = match[1].split('\n')
  const kept = []
  for (let index = 0; index < lines.length; index += 1) {
    const field = lines[index].match(/^([A-Za-z][A-Za-z0-9_-]*):(.*)$/)
    if (field?.[1] === key) {
      const empty = field[2].trim() === ''
      while (index + 1 < lines.length) {
        const next = lines[index + 1]
        if (!(next.trim() === '' || /^[ \t]/.test(next) || (empty && /^-(\s|$)/.test(next)))) break
        index += 1
      }
      continue
    }
    kept.push(lines[index])
  }
  return `---\n${kept.join('\n')}\n---${match[2]}${text.slice(match[0].length)}`
}

// Related Skills bullets become sibling links only for skills the target serves from `.github/skills`.
function linkRelatedSkills(text, linkable) {
  const lines = text.split('\n')
  let inSection = false
  return lines.map(line => {
    if (/^## /.test(line)) inSection = /^## Related Skills\s*$/.test(line)
    if (!inSection) return line
    return line.replace(/^- `([a-z0-9-]+)`/, (all, name) => (linkable(name) ? `- [${name}](../skills/${name}/SKILL.md)` : all))
  }).join('\n')
}

function personaMetadata(entry) {
  const text = readText(entry.source)
  const { data, problems } = parseFrontmatterText(text)
  if (!data || problems.length || data.name !== entry.name || typeof data.description !== 'string' || !data.description) {
    throw new Error(`${entry.label}: invalid persona frontmatter; run pnpm check:agents`)
  }
  return { text, description: data.description, tools: listValue(data.tools), skills: listValue(data.skills) ?? [] }
}

function codexPersona(entry, metadata, { mode, catalog }) {
  const name = entry.name.replaceAll('-', '_')
  const personaPath = mode === 'self' ? entry.label : `.claude/agents/${entry.name}.md`
  const skillPaths = metadata.skills.map(skill => (mode === 'self' ? catalog.skills.get(skill).label : `.agents/skills/${skill}/SKILL.md`))
  const skillSentence = skillPaths.length ? ` Before task actions, read each skill it lists: ${skillPaths.join(', ')}.` : ''
  const instructions = `Read AGENTS.md and ${personaPath} completely before acting. Follow the persona's scope and boundaries.${skillSentence} Repository instructions and the user's current request remain authoritative.`
  const header = mode === 'self'
    ? `# Generated by pnpm sync:setup from ${entry.label}.`
    : '# Installed by the swe-agents installer; see .agents/stacks.lock.json.'
  return [
    header,
    `name = ${JSON.stringify(name)}`,
    `description = ${JSON.stringify(metadata.description)}`,
    `developer_instructions = ${JSON.stringify(instructions)}`,
    ...(readOnlyFor(metadata.tools) ? ['sandbox_mode = "read-only"'] : []),
    ''
  ].join('\n')
}

// Tool-directory outputs for every persona and skill in the catalog, keyed by
// target-relative path. `mode` is `self` (this repository) or `target`.
export function runtimeOutputs(catalog, { target, mode }) {
  const outputs = new Map()
  const mappers = families(catalog, target)
  const add = (path, content, source) => outputs.set(path, { content: normalized(content), source })
  add('.codex/config.toml', [
    mode === 'self'
      ? '# Generated by pnpm sync:setup. Personas set no model, so Codex applies its subagent model defaults; read-only personas set sandbox_mode = "read-only".'
      : '# Installed by the swe-agents installer. Personas set no model, so Codex applies its subagent model defaults; read-only personas set sandbox_mode = "read-only".',
    '[agents]',
    'enabled = true',
    ''
  ].join('\n'), 'core')

  for (const entry of catalog.agents.values()) {
    if (!namePattern.test(entry.name)) throw new Error(`${entry.label}: persona names must be kebab-case`)
    const metadata = personaMetadata(entry)
    for (const skill of metadata.skills) {
      if (!catalog.skills.has(skill)) throw new Error(`${entry.label}: skill ${skill} is not installed with this selection`)
    }
    const claudePath = `.claude/agents/${entry.name}.md`
    add(claudePath, rebaseLinks(metadata.text, entry.label, claudePath, mappers.claude), entry.label)
    const githubPath = `.github/agents/${entry.name}.agent.md`
    const githubText = linkRelatedSkills(
      removeFrontmatterField(rebaseLinks(metadata.text, entry.label, githubPath, mappers.github), 'skills'),
      name => catalog.skills.has(name) && existsSync(join(target, '.github/skills', name, 'SKILL.md'))
    )
    add(githubPath, githubText, entry.label)
    add(`.codex/agents/${entry.name.replaceAll('-', '_')}.toml`, codexPersona(entry, metadata, { mode, catalog }), entry.label)
  }

  for (const entry of catalog.skills.values()) {
    if (!namePattern.test(entry.name)) throw new Error(`${entry.dirLabel}: skill names must be kebab-case`)
    if (!existsSync(entry.source)) throw new Error(`${entry.dirLabel}: missing SKILL.md`)
    for (const file of entry.files) {
      const suffix = relative(entry.dir, file).split('\\').join('/')
      const sourceLabel = `${entry.dirLabel}/${suffix}`
      for (const [directory, family] of [['.agents/skills', 'agents'], ['.claude/skills', 'claude']]) {
        const path = `${directory}/${entry.name}/${suffix}`
        const content = suffix.endsWith('.md') ? rebaseLinks(readText(file), sourceLabel, path, mappers[family]) : readFileSync(file)
        add(path, content, sourceLabel)
      }
    }
  }
  return outputs
}

// ---------------------------------------------------------------------------
// AGENTS.md for a target: core rules, then one section per pack.

function escapeCell(text) {
  return text.replaceAll('|', '\\|')
}

function codeSpan(text) {
  const fence = text.includes('`') ? '``' : '`'
  const padding = fence === '``' ? ' ' : ''
  return `${fence}${padding}${escapeCell(text)}${padding}${fence}`
}

function commandTable(pack, title) {
  const commands = Object.entries(pack.manifest.commands ?? {}).filter(([, command]) => typeof command === 'string' && command)
  if (!commands.length) return null
  return [
    `### ${title} commands`,
    '',
    `Commands declared by the \`${pack.name}\` pack. Adjust them here when the project uses different ones.`,
    '',
    '| Purpose | Command |',
    '| --- | --- |',
    ...commands.map(([key, command]) => `| \`${key}\` | ${codeSpan(command)} |`)
  ].join('\n')
}

// Returns the H1 line and the managed-block body in both layouts: `fresh`
// (the H1 sits above the block) and `appended` (the block follows existing
// content, so every heading is demoted one level).
export function composeAgentsMd(catalog, { target }) {
  const mapper = families(catalog, target).root
  const core = splitH1(rebaseLinks(readText(catalog.core.agentsMd), 'core/AGENTS.md', 'AGENTS.md', mapper))
  const h1 = core.line ?? '# Agent Rules'
  const sections = [core.rest]
  for (const pack of catalog.packs) {
    const title = packTitle(pack)
    const fragment = splitH1(rebaseLinks(readText(pack.agentsMd), `${pack.dirLabel}/AGENTS.md`, 'AGENTS.md', mapper))
    const section = [`## ${title} rules`, '', demoteHeadings(fragment.rest, 1).trim()]
    const commands = commandTable(pack, title)
    if (commands) section.push('', commands)
    sections.push(section.join('\n'))
  }
  const fresh = sections.filter(Boolean).join('\n\n')
  return { h1, fresh, appended: demoteHeadings(`${h1}\n\n${fresh}`, 1) }
}

export function managedBlock(body) {
  return `${blockBegin}\n${blockNotice}\n\n${body.trim()}\n\n${blockEnd}`
}

// Locates the single managed block; `null` when absent, `{ error }` when malformed.
export function findManagedBlock(text) {
  const begins = text.split(blockBegin).length - 1
  const ends = text.split(blockEnd).length - 1
  if (begins === 0 && ends === 0) return null
  const start = text.indexOf(blockBegin)
  const end = text.indexOf(blockEnd)
  if (begins !== 1 || ends !== 1 || end < start) return { error: 'expected exactly one swe-agents begin marker followed by one end marker' }
  const stop = end + blockEnd.length
  return { start, stop, block: text.slice(start, stop), before: text.slice(0, start), after: text.slice(stop) }
}

// `fresh` when only the H1 precedes the block, otherwise `appended`.
export function blockLayout(before) {
  const lines = before.split('\n').filter(line => line.trim())
  return lines.length <= 1 && lines.every(line => /^# \S/.test(line)) ? 'fresh' : 'appended'
}

// ---------------------------------------------------------------------------
// Routing table: core rows from docs/agent-routing.md, then pack `routes`.

export function routingRows(catalog, base) {
  const rows = []
  const covered = new Set()
  const routingPath = join(base, 'docs/agent-routing.md')
  const coreAgents = new Set(catalog.core.agents.map(entry => entry.name))
  if (existsSync(routingPath)) {
    for (const match of readText(routingPath).matchAll(/^\| ([^|]+?) \| `([a-z0-9-]+)` \| ([^\n]*?) \|$/gm)) {
      if (!coreAgents.has(match[2])) continue
      rows.push({ outcome: match[1].trim(), owner: match[2], skills: [...match[3].matchAll(/`([a-z0-9-]+)`/g)].map(skill => skill[1]) })
      covered.add(match[2])
    }
  }
  const fallback = entry => {
    if (covered.has(entry.name)) return
    const { data } = parseFrontmatterText(readText(entry.source))
    rows.push({ outcome: data?.description ?? entry.name, owner: entry.name, skills: listValue(data?.skills) ?? [] })
    covered.add(entry.name)
  }
  catalog.core.agents.forEach(fallback)
  for (const pack of catalog.packs) {
    for (const route of Array.isArray(pack.manifest.routes) ? pack.manifest.routes : []) {
      rows.push({ outcome: route.outcome, owner: route.owner, skills: arrayOf(route.skills) })
      covered.add(route.owner)
    }
    pack.agents.forEach(fallback)
  }
  const seen = new Set()
  return rows
    .filter(row => catalog.agents.has(row.owner))
    .map(row => ({ ...row, skills: row.skills.filter(skill => catalog.skills.has(skill)) }))
    .filter(row => {
      const key = JSON.stringify(row)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}

export function routingTable(rows) {
  return [
    '| Outcome | Owner | Related skills |',
    '| --- | --- | --- |',
    ...rows.map(row => `| ${escapeCell(row.outcome)} | \`${row.owner}\` | ${row.skills.map(skill => `\`${skill}\``).join(', ') || 'none'} |`)
  ].join('\n')
}
