import { execSync } from 'node:child_process'

function run(command) {
  execSync(command, { stdio: 'inherit' })
}

const explicitMode = process.env.CF_D1_MIGRATIONS_MODE?.trim().toLowerCase()
const branch = process.env.CF_PAGES_BRANCH?.trim()
const productionBranch = (process.env.CF_PRODUCTION_BRANCH || 'main').trim()

if (explicitMode && !['remote', 'preview', 'none'].includes(explicitMode)) {
  throw new Error('Invalid CF_D1_MIGRATIONS_MODE. Use one of: remote, preview, none')
}

const inferredMode = branch
  ? (branch === productionBranch ? 'remote' : 'preview')
  : 'none'

const mode = explicitMode || inferredMode

if (!explicitMode) {
  if (branch) {
    console.log(`[cf-build] Inferred migration mode "${mode}" from CF_PAGES_BRANCH="${branch}" and CF_PRODUCTION_BRANCH="${productionBranch}".`)
  } else {
    console.log('[cf-build] CF_PAGES_BRANCH is not set; defaulting migration mode to "none" (migrations skipped). Set CF_D1_MIGRATIONS_MODE explicitly to run migrations.')
  }
}

run('pnpm build')

if (mode === 'none') {
  console.log('[cf-build] Skipping D1 migrations (CF_D1_MIGRATIONS_MODE=none).')
  process.exit(0)
}

// Explicitly set the migrations directory so Wrangler does not resolve it relative
// to `.output/server/wrangler.json` (which can point to a non-existent nested path in CI).
const baseCommand = 'pnpm wrangler d1 migrations apply libroo-website --remote --config .output/server/wrangler.json --migrations-dir server/db/migrations'

if (mode === 'remote') {
  console.log('[cf-build] Applying D1 migrations in remote mode...')
  run(baseCommand)
} else {
  console.log('[cf-build] Applying D1 migrations in preview mode...')
  run(`${baseCommand} --preview`)
}

console.log('[cf-build] Build + migration completed successfully.')
