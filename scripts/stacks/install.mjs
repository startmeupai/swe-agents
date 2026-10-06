import { resolve } from 'node:path'
import { InstallError, runInstall } from './installer.mjs'
import { SourceError } from './source.mjs'

// Thin command-line wrapper around installer.mjs; `swe-agents install` runs the same code.
const usage = `Usage: node scripts/stacks/install.mjs --target <dir> (--profile <name> | --packs a,b,c) [--dry-run] [--force]

  --target <dir>     Existing repository directory to install into (required).
  --profile <name>   Install a profile from profiles/<name>.json.
  --packs a,b,c      Install an explicit pack list; required packs are added.
  --dry-run          Print the plan and the routing table; write nothing.
  --force            Overwrite files edited since the last install and files
                     the installer did not create; remove edited files that
                     the selection no longer installs.`

function fail(message) {
  console.error(message)
  process.exit(1)
}

function parseArguments(argv) {
  const options = { dryRun: false, force: false }
  const valueOf = (argument, index) => {
    const inline = argument.indexOf('=')
    if (inline !== -1) return [argument.slice(inline + 1), index]
    const value = argv[index + 1]
    if (value === undefined || value.startsWith('--')) fail(`${argument} needs a value\n\n${usage}`)
    return [value, index + 1]
  }
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    const flag = argument.split('=')[0]
    if (argument === '--') continue
    if (flag === '--help' || flag === '-h') {
      console.log(usage)
      process.exit(0)
    } else if (flag === '--dry-run') options.dryRun = true
    else if (flag === '--force') options.force = true
    else if (['--target', '--profile', '--packs'].includes(flag)) {
      const [value, next] = valueOf(argument, index)
      options[flag.slice(2)] = value
      index = next
    } else fail(`Unknown argument ${argument}\n\n${usage}`)
  }
  if (!options.target) fail(`--target is required\n\n${usage}`)
  if (Boolean(options.profile) === Boolean(options.packs)) fail(`Use exactly one of --profile or --packs\n\n${usage}`)
  return options
}

const options = parseArguments(process.argv.slice(2))
if (options.packs !== undefined && !options.packs.split(',').some(name => name.trim())) fail('--packs needs at least one pack name')
// pnpm runs scripts from the package root; INIT_CWD keeps paths relative to the caller.
const target = resolve(process.env.INIT_CWD ?? process.cwd(), options.target)
try {
  process.exitCode = runInstall({
    target,
    targetLabel: options.target,
    profile: options.profile ?? null,
    packs: options.packs ?? null,
    force: options.force,
    dryRun: options.dryRun
  })
} catch (error) {
  if (!(error instanceof InstallError) && !(error instanceof SourceError)) throw error
  fail(error.message)
}
