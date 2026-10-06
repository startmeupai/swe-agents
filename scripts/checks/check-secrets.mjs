import { realpathSync } from 'node:fs'
import { basename, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { finish, label, read, root, walk } from './lib.mjs'

export const secretPatterns = [
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{30,}\b/,
  /\bglpat-[A-Za-z0-9_-]{20,}\b/,
  /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/,
  /\bAIza[0-9A-Za-z_-]{35}\b/,
  /\b(?:sk|rk|pk)_(?:live|test)_[A-Za-z0-9]{16,}\b/,
  /\bsk-[A-Za-z0-9]{32,}\b/,
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/,
  /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/,
  /(?:postgres(?:ql)?|mongodb(?:\+srv)?):\/\/[^\s:'"]+:[^\s@'"]+@/,
  /(?:authorization\s*:\s*bearer|_authToken\s*=)\s*[A-Za-z0-9._~+\/-]{20,}/i,
  /(?:password|secret|token|api[_-]?key)\s*[:=]\s*['"][^'"\s]{12,}['"]/i
]
export const sensitiveExtensions = new Set(['.key', '.p12', '.pfx', '.pem'])

// Findings for one file, in the order this check reports them. `pathLabel` is
// the repository-relative POSIX path; `content` is the file text.
export function secretFindings(content, pathLabel) {
  const findings = []
  const fileName = basename(pathLabel)
  if (fileName.startsWith('.env') && fileName !== '.env.example') {
    findings.push(`${pathLabel}: environment file must not be tracked`)
  }
  if (sensitiveExtensions.has(extname(pathLabel).toLowerCase())) {
    findings.push(`${pathLabel}: private credential file type must not be tracked`)
  }
  for (const pattern of secretPatterns) {
    if (pattern.test(content)) findings.push(`${pathLabel}: possible secret pattern detected`)
  }
  return findings
}

function invokedDirectly() {
  try {
    return Boolean(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))
  } catch {
    return false
  }
}

if (invokedDirectly()) {
  const ownFile = 'check-secrets.mjs'
  const files = walk(root, path => basename(path) !== ownFile)
  const failures = []
  for (const file of files) failures.push(...secretFindings(read(file), label(file)))
  finish('Secret-pattern check', failures, `Secret-pattern check passed: ${files.length} files scanned.`)
}
