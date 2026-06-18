export default defineEventHandler(async (event) => {
  setLegalCacheHeaders(event)

  return fetchLegalPlaceholders(event)
})
