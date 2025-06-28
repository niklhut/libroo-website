import { migrate } from 'drizzle-orm/better-sqlite3/migrator'

export default defineTask({
  meta: {
    name: 'db:migrate',
    description: 'Run database migrations'
  },
  run: async () => {
    try {
      migrate(db, { migrationsFolder: './server/db/migrations' })
      return { result: true }
    } catch (error) {
      console.error(error)
      return { result: false }
    }
  }
})
