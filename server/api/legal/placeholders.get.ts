export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'public, max-age=300, stale-while-revalidate=3600')

  return fetchLegalPlaceholders(event)
})
