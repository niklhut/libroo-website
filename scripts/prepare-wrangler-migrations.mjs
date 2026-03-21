import fs from 'node:fs'
import path from 'node:path'

const sourceDir = path.resolve('server/db/migrations')

const targetDirs = [
  path.resolve('.output/server/db/migrations'),
  path.resolve('.output/server/server/db/migrations')
]

if (!fs.existsSync(sourceDir)) {
  throw new Error(`[prepare-migrations] Missing source migrations directory: ${sourceDir}`)
}

for (const targetDir of targetDirs) {
  fs.mkdirSync(path.dirname(targetDir), { recursive: true })
  fs.cpSync(sourceDir, targetDir, { recursive: true })
}

console.log(`[prepare-migrations] Staged migrations into: ${targetDirs.join(', ')}`)
