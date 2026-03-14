import { execSync } from 'node:child_process'

function run(command) {
  execSync(command, { stdio: 'inherit' })
}

const mode = (process.env.CF_D1_MIGRATIONS_MODE || 'remote').toLowerCase()

if (!['remote', 'preview', 'none'].includes(mode)) {
  throw new Error('Invalid CF_D1_MIGRATIONS_MODE. Use one of: remote, preview, none')
}

run('pnpm build')

if (mode === 'none') {
  console.log('[cf-build] Skipping D1 migrations (CF_D1_MIGRATIONS_MODE=none).')
  process.exit(0)
}

const baseCommand = 'pnpm wrangler d1 migrations apply libroo-website --remote --config .output/server/wrangler.json'
const migrationCommand = mode === 'preview'
  ? `${baseCommand} --preview`
  : baseCommand

console.log(`[cf-build] Applying D1 migrations in ${mode} mode...`)
run(migrationCommand)
console.log('[cf-build] Build + migration completed successfully.')
