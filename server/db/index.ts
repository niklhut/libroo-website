import type { H3Event } from 'h3'
import { resolve } from 'node:path'
import Database from 'better-sqlite3'
import { drizzle as drizzleD1 } from 'drizzle-orm/d1'
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3'
import { migrate as migrateSqlite } from 'drizzle-orm/better-sqlite3/migrator'
import * as schema from './schema'

type D1Binding = Parameters<typeof drizzleD1>[0]
type AppDb = ReturnType<typeof drizzleD1>

export interface Env {
  DB: D1Binding
}

interface CloudflareRuntimeGlobal {
  __env__?: Partial<Env>
  __cf_env__?: Partial<Env>
}

let localDevDb: AppDb | undefined
const localDbFileName = process.env.NUXT_DB_FILE_NAME || 'local.db'
const localMigrationsFolder = resolve(process.cwd(), 'server/db/migrations')

export function createDb(env: Env): AppDb {
  return drizzleD1(env.DB, { schema })
}

function getLocalDevDb(): AppDb {
  if (!localDevDb) {
    const sqlite = new Database(localDbFileName)
    const sqliteDb = drizzleSqlite(sqlite, { schema })

    // Apply generated Drizzle SQL migrations on local startup.
    migrateSqlite(sqliteDb, {
      migrationsFolder: localMigrationsFolder
    })

    localDevDb = sqliteDb as unknown as AppDb
  }

  return localDevDb
}

export function initLocalDevDb() {
  if (import.meta.dev) {
    getLocalDevDb()
  }
}

function getCloudflareEnv(event: H3Event): Env | undefined {
  const runtimeGlobal = globalThis as typeof globalThis & CloudflareRuntimeGlobal

  const candidates: Array<Partial<Env> | undefined> = [
    event.context.cloudflare?.env as Partial<Env> | undefined,
    runtimeGlobal.__env__,
    runtimeGlobal.__cf_env__
  ]

  const env = candidates.find(candidate => candidate?.DB)

  return env as Env | undefined
}

function getResolvedCloudflareEnvKeys(event: H3Event): string[] {
  const runtimeGlobal = globalThis as typeof globalThis & CloudflareRuntimeGlobal
  const candidates: Array<Partial<Env> | undefined> = [
    event.context.cloudflare?.env as Partial<Env> | undefined,
    runtimeGlobal.__env__,
    runtimeGlobal.__cf_env__
  ]

  return candidates
    .flatMap(candidate => candidate ? Object.keys(candidate) : [])
    .filter((key, index, array) => array.indexOf(key) === index)
    .sort()
}

export function useDb(event: H3Event): AppDb {
  const env = getCloudflareEnv(event)

  if (env?.DB) {
    return createDb(env)
  }

  if (import.meta.dev) {
    return getLocalDevDb()
  }

  const resolvedKeys = getResolvedCloudflareEnvKeys(event)

  const keyHint = resolvedKeys.length > 0
    ? `Resolved Cloudflare env keys: ${resolvedKeys.join(', ')}`
    : 'No Cloudflare runtime env object was found on event context or global scope.'

  throw new Error(`Missing Cloudflare D1 binding \`DB\`. Configure \`d1_databases\` in wrangler config. ${keyHint}`)
}
