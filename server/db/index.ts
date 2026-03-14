import type { H3Event } from 'h3'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from './schema'

type D1Binding = Parameters<typeof drizzle>[0]

export interface Env {
  DB: D1Binding
}

export function createDb(env: Env) {
  return drizzle(env.DB, { schema })
}

function getCloudflareEnv(event: H3Event): Env {
  const env = event.context.cloudflare?.env as Env | undefined
  const binding = env?.DB

  if (!binding) {
    throw new Error('Missing Cloudflare D1 binding `DB`. Configure `d1_databases` in wrangler config.')
  }

  return env
}

export function useDb(event: H3Event) {
  return createDb(getCloudflareEnv(event))
}
