export default defineEventHandler(async (event) => {
  event.node?.res?.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600')

  return fetchLegalPlaceholders(event)
})
