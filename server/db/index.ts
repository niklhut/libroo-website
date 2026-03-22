import type { H3Event } from 'h3'
import { drizzle as drizzleD1 } from 'drizzle-orm/d1'
import * as schema from './schema'

type D1Binding = Parameters<typeof drizzleD1>[0]
export type AppDb = ReturnType<typeof drizzleD1>

export interface Env {
  DB: D1Binding
}

interface CloudflareRuntimeGlobal {
  __env__?: Partial<Env>
  __cf_env__?: Partial<Env>
}

export function createDb(env: Env): AppDb {
  return drizzleD1(env.DB, { schema })
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

export async function useDb(event: H3Event): Promise<AppDb> {
  const env = getCloudflareEnv(event)

  if (env?.DB) {
    return createDb(env)
  }

  if (import.meta.dev) {
    const { getLocalDevDb } = await import('./dev')
    return getLocalDevDb()
  }

  const resolvedKeys = getResolvedCloudflareEnvKeys(event)

  const keyHint = resolvedKeys.length > 0
    ? `Resolved Cloudflare env keys: ${resolvedKeys.join(', ')}`
    : 'No Cloudflare runtime env object was found on event context or global scope.'

  throw new Error(`Missing Cloudflare D1 binding \`DB\`. Configure \`d1_databases\` in wrangler config. ${keyHint}`)
}
