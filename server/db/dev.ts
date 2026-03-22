import { resolve } from 'node:path'
import Database from 'better-sqlite3'
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3'
import { migrate as migrateSqlite } from 'drizzle-orm/better-sqlite3/migrator'
import type { AppDb } from './index'
import * as schema from './schema'

let localDevDb: AppDb | undefined
const localDbFileName = process.env.NUXT_DB_FILE_NAME || 'local.db'
const localMigrationsFolder = resolve(process.cwd(), 'server/db/migrations')

export function getLocalDevDb(): AppDb {
  if (!localDevDb) {
    const sqlite = new Database(localDbFileName)
    const sqliteDb = drizzleSqlite(sqlite, { schema })

    // Apply generated Drizzle SQL migrations on local startup.
    migrateSqlite(sqliteDb, {
      migrationsFolder: localMigrationsFolder
    })

    // `localDevDb` stores a better-sqlite3 Drizzle client (`sqliteDb`) but this app
    // expects the D1-shaped `AppDb` type elsewhere. The `as unknown as AppDb` cast is
    // intentional for local dev ergonomics only: both drivers share the same Drizzle
    // schema/query builder surface, while production continues to use real D1 bindings.
    localDevDb = sqliteDb as unknown as AppDb
  }

  return localDevDb
}

export function initLocalDevDb() {
  if (import.meta.dev) {
    getLocalDevDb()
  }
}
