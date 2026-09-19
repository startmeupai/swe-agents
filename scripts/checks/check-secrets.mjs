import { basename, extname } from 'node:path'
import { finish, label, read, root, walk } from './lib.mjs'

const ownFile = 'check-secrets.mjs'
const files = walk(root, path => basename(path) !== ownFile)
const failures = []
const patterns = [
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
const sensitiveExtensions = new Set(['.key', '.p12', '.pfx', '.pem'])

for (const file of files) {
  const fileName = basename(file)
  if (fileName.startsWith('.env') && fileName !== '.env.example') {
    failures.push(`${label(file)}: environment file must not be tracked`)
  }
  if (sensitiveExtensions.has(extname(file).toLowerCase())) {
    failures.push(`${label(file)}: private credential file type must not be tracked`)
  }
  const content = read(file)
  for (const pattern of patterns) {
    if (pattern.test(content)) failures.push(`${label(file)}: possible secret pattern detected`)
  }
}

finish('Secret-pattern check', failures, `Secret-pattern check passed: ${files.length} files scanned.`)
