import { initLocalDevDb } from '../db'

export default defineNitroPlugin(() => {
  initLocalDevDb()
})
