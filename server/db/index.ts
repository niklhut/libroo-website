import 'dotenv/config'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'

let dbFileName: string
try {
  // Try to load from Nuxt's runtimeConfig
  dbFileName = useRuntimeConfig().dbFileName
} catch {
  // Fallback to .env config
  dbFileName = process.env.DB_FILE_NAME as string
}

if (!dbFileName) {
  throw new Error('DB_FILE_NAME is not defined in either runtimeConfig or environment variables.')
}

// You can specify any property from the libsql connection options
const db = drizzle({ connection: { url: dbFileName }, schema })

export default db
