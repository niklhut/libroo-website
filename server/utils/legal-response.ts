import type { H3Event } from 'h3'

const legalCacheControl = 'public, max-age=300, stale-while-revalidate=3600'

interface WebHeadersResponse {
  res?: {
    headers?: Headers
  }
}

export function setLegalCacheHeaders(event: H3Event) {
  const webHeaders = (event as unknown as WebHeadersResponse).res?.headers

  if (webHeaders) {
    webHeaders.set('Cache-Control', legalCacheControl)
    return
  }

  event.node.res.setHeader('Cache-Control', legalCacheControl)
}
