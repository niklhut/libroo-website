import path from 'node:path'
import fs from 'node:fs'
import type { Nitro } from 'nitropack'

export function copyDrizzleMigrations(builder: Nitro) {
  const sourceDir = path.resolve(builder.options.rootDir, 'server/db/migrations')
  const targetDir = path.resolve(builder.options.output.dir, 'server/db/migrations')

  if (fs.existsSync(sourceDir)) {
    console.log(`Copying Drizzle migrations from ${sourceDir} to ${targetDir}`)
    fs.mkdirSync(path.dirname(targetDir), { recursive: true })
    fs.cpSync(sourceDir, targetDir, { recursive: true })
  } else {
    console.warn(`Drizzle migrations source directory not found: ${sourceDir}`)
  }
}
