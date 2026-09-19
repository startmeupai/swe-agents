import { finish, label, markdownFiles, read } from './lib.mjs'

const failures = []
let checked = 0

for (const file of markdownFiles()) {
  checked += 1
  const rawContent = read(file)
  if (/\r(?!\n)/.test(rawContent)) failures.push(`${label(file)}: unsupported lone carriage return`)
  const content = rawContent.replace(/\r\n/g, '\n')
  const lines = content.split('\n')
  let h1 = 0
  let inFence = false
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    const number = index + 1
    if (/\s+$/.test(line)) failures.push(`${label(file)}:${number}: trailing whitespace`)
    if (line.startsWith('# ')) h1 += 1
    if (line.startsWith('```')) {
      if (!inFence) {
        if (!/^```[A-Za-z0-9_-]+\s*$/.test(line)) failures.push(`${label(file)}:${number}: opening fence needs a language`)
        if (index > 0 && lines[index - 1] !== '') failures.push(`${label(file)}:${number}: fence needs a blank line before it`)
      } else if (index + 1 < lines.length && lines[index + 1] !== '') {
        failures.push(`${label(file)}:${number}: fence needs a blank line after it`)
      }
      inFence = !inFence
    }
  }
  if (inFence) failures.push(`${label(file)}: unclosed fenced code block`)
  if (h1 !== 1) failures.push(`${label(file)}: expected exactly one H1, found ${h1}`)
  if (!content.endsWith('\n') || content.endsWith('\n\n')) failures.push(`${label(file)}: file must end with one newline`)
}

finish('Markdown lint', failures, `Markdown lint passed: ${checked} files.`)
