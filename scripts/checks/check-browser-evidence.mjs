import { existsSync, readFileSync, statSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { finish, label, root, walk } from './lib.mjs'

const evidenceDirectory = join(root, 'examples/browser-evidence')
const schemaPath = join(evidenceDirectory, 'browser-evidence-manifest.schema.json')
const failures = []

function parseJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch (error) {
    failures.push(`${label(path)}: invalid JSON (${error.message})`)
    return null
  }
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

const schema = parseJson(schemaPath)
if (schema) {
  if (schema.$schema !== 'https://json-schema.org/draft/2020-12/schema') {
    failures.push(`${label(schemaPath)}: expected JSON Schema draft 2020-12`)
  }
  if (schema.$id !== 'https://example.invalid/schemas/browser-evidence-manifest.schema.json') {
    failures.push(`${label(schemaPath)}: schema id must use the reserved example.invalid domain`)
  }
  for (const field of ['$schema', 'schemaVersion', 'manifestType', 'evidenceStatus', 'steps']) {
    if (!schema.required?.includes(field)) failures.push(`${label(schemaPath)}: required field missing from schema: ${field}`)
  }
}

const manifests = walk(evidenceDirectory, path => basename(path) === 'manifest.json')
if (manifests.length === 0) failures.push('examples/browser-evidence: no manifest.json files found')

for (const manifestPath of manifests) {
  const manifest = parseJson(manifestPath)
  if (!manifest) continue

  const manifestLabel = label(manifestPath)
  if (manifest.$schema !== './browser-evidence-manifest.schema.json') {
    failures.push(`${manifestLabel}: $schema must reference the local browser evidence schema`)
  }
  if (manifest.schemaVersion !== 1) failures.push(`${manifestLabel}: schemaVersion must be 1`)
  if (!['template', 'evidence'].includes(manifest.manifestType)) {
    failures.push(`${manifestLabel}: manifestType must be template or evidence`)
  }
  if (!['not-collected', 'collected'].includes(manifest.evidenceStatus)) {
    failures.push(`${manifestLabel}: evidenceStatus must be not-collected or collected`)
  }
  for (const field of ['journey', 'environment', 'baseUrl', 'browser', 'profile']) {
    if (!nonEmptyString(manifest[field])) failures.push(`${manifestLabel}: ${field} must be a non-empty string`)
  }
  try {
    const baseUrl = new URL(manifest.baseUrl)
    if (!['http:', 'https:'].includes(baseUrl.protocol)) throw new Error('unsupported protocol')
    if (manifest.manifestType === 'template' && baseUrl.hostname !== 'example.invalid') {
      failures.push(`${manifestLabel}: templates must use the reserved example.invalid domain`)
    }
  } catch {
    failures.push(`${manifestLabel}: baseUrl must be an HTTP(S) URL`)
  }
  if (!Number.isInteger(manifest.viewport?.width) || manifest.viewport.width < 1) {
    failures.push(`${manifestLabel}: viewport.width must be a positive integer`)
  }
  if (!Number.isInteger(manifest.viewport?.height) || manifest.viewport.height < 1) {
    failures.push(`${manifestLabel}: viewport.height must be a positive integer`)
  }
  if (manifest.containsPersonalData !== false) {
    failures.push(`${manifestLabel}: evidence must be redacted before it is tracked`)
  }
  if (!Array.isArray(manifest.steps) || manifest.steps.length === 0) {
    failures.push(`${manifestLabel}: steps must be a non-empty array`)
    continue
  }

  if (manifest.manifestType === 'template') {
    if (manifest.evidenceStatus !== 'not-collected') failures.push(`${manifestLabel}: templates cannot claim collected evidence`)
    if (manifest.capturedAt !== null) failures.push(`${manifestLabel}: templates must use capturedAt: null`)
  } else {
    if (manifest.evidenceStatus !== 'collected') failures.push(`${manifestLabel}: evidence manifests must be marked collected`)
    if (!nonEmptyString(manifest.capturedAt) || Number.isNaN(Date.parse(manifest.capturedAt))) {
      failures.push(`${manifestLabel}: evidence manifests need an ISO date-time capturedAt`)
    }
  }

  const artifactNames = new Set()
  for (const [index, step] of manifest.steps.entries()) {
    const stepLabel = `${manifestLabel}: step ${index + 1}`
    if (step.number !== index + 1) failures.push(`${stepLabel}: number must preserve one-based order`)
    if (!nonEmptyString(step.route) || !step.route.startsWith('/')) failures.push(`${stepLabel}: route must start with /`)
    if (!nonEmptyString(step.expected)) failures.push(`${stepLabel}: expected signal is required`)

    if (manifest.manifestType === 'template') {
      if (step.outcome !== 'not-run') failures.push(`${stepLabel}: a template outcome must be not-run`)
      if (step.artifact !== null) failures.push(`${stepLabel}: a template cannot reference an artifact`)
      if (step.observed !== null) failures.push(`${stepLabel}: a template cannot claim an observation`)
      if (step.consoleNetworkNote !== null) failures.push(`${stepLabel}: a template cannot claim console or network evidence`)
      if (step.mutationDisclosure !== null) failures.push(`${stepLabel}: a template cannot claim a mutation disclosure`)
      continue
    }

    if (!['pass', 'fail'].includes(step.outcome)) failures.push(`${stepLabel}: evidence outcome must be pass or fail`)
    for (const field of ['artifact', 'observed', 'consoleNetworkNote', 'mutationDisclosure']) {
      if (!nonEmptyString(step[field])) failures.push(`${stepLabel}: ${field} is required for collected evidence`)
    }
    if (!nonEmptyString(step.artifact)) continue
    if (step.artifact !== basename(step.artifact) || !step.artifact.toLowerCase().endsWith('.png')) {
      failures.push(`${stepLabel}: artifact must be a PNG basename in the manifest directory`)
      continue
    }
    if (artifactNames.has(step.artifact)) failures.push(`${stepLabel}: artifact names must be unique`)
    artifactNames.add(step.artifact)
    const artifactPath = join(dirname(manifestPath), step.artifact)
    if (!existsSync(artifactPath) || !statSync(artifactPath).isFile() || statSync(artifactPath).size === 0) {
      failures.push(`${stepLabel}: referenced artifact is missing or empty: ${step.artifact}`)
    }
  }
}

finish(
  'Browser-evidence check',
  failures,
  `Browser-evidence check passed: ${manifests.length} manifest(s) validated against the local contract.`
)
