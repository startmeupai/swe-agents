import { join } from 'node:path'
import { finish, read, root } from './lib.mjs'

const provenancePath = join(root, 'PROVENANCE.json')
const failures = []
let provenance

try {
  provenance = JSON.parse(read(provenancePath))
} catch (error) {
  failures.push(`PROVENANCE.json: invalid JSON (${error.message})`)
}

if (provenance) {
  if (provenance.schemaVersion !== 1) failures.push('PROVENANCE.json: schemaVersion must be 1')
  if (provenance.provenanceType !== 'sanitized-derivative') {
    failures.push('PROVENANCE.json: provenanceType must be sanitized-derivative')
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(provenance.recordedOn)) failures.push('PROVENANCE.json: recordedOn must be YYYY-MM-DD')
  if (provenance.source?.visibility !== 'private') failures.push('PROVENANCE.json: source visibility must remain private')
  if (!/^[0-9a-f]{40}$/.test(provenance.source?.baseRevision ?? '')) {
    failures.push('PROVENANCE.json: source.baseRevision must be a full Git revision')
  }
  if (provenance.source?.worktreeState !== 'not-attested') {
    failures.push('PROVENANCE.json: source.worktreeState must not imply unrecorded cleanliness')
  }
  if (provenance.derivation?.sourceMap !== 'SOURCE_MAP.md') failures.push('PROVENANCE.json: source map must be SOURCE_MAP.md')
  if (provenance.derivation?.byteForByteCopy !== false) failures.push('PROVENANCE.json: byteForByteCopy must be false')
  if (provenance.publication?.status !== 'on-hold') failures.push('PROVENANCE.json: publication must remain on hold')
  if (provenance.publication?.license !== 'not-selected') failures.push('PROVENANCE.json: license must remain not-selected')

  const serialized = JSON.stringify(provenance)
  const localPathPatterns = [/\/Users\//, /\/home\//, /[A-Za-z]:[\\/]Users[\\/]/]
  if (localPathPatterns.some(pattern => pattern.test(serialized))) failures.push('PROVENANCE.json: local path detected')
}

finish('Provenance check', failures, 'Provenance check passed: private base revision and publication hold are explicit.')
