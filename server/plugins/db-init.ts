import { initLocalDevDb } from '../db/dev'

export default defineNitroPlugin(() => {
  initLocalDevDb()
})
