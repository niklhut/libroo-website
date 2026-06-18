import type { H3Event } from 'h3'

export type LegalPlaceholderMap = Record<string, string>

interface LegalRuntimeConfig {
  clientPlaceholdersUrl?: string
}

const placeholderNamePattern = /^[A-Z0-9_]+$/
const legalSourceTimeoutMs = 5000

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === 'AbortError'
}

export function assertLegalFetchableUrl(value: string, configKey: string): URL {
  let url: URL

  try {
    url = new URL(value)
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: `${configKey} must be a valid URL.`
    })
  }

  const isHttps = url.protocol === 'https:'
  const isLocalHttp = url.protocol === 'http:' && ['localhost', '127.0.0.1', '::1'].includes(url.hostname)

  if (!isHttps && !isLocalHttp) {
    throw createError({
      statusCode: 500,
      statusMessage: `${configKey} must use https (http allowed only for localhost).`
    })
  }

  return url
}

export async function fetchLegalSource(
  sourceUrl: URL,
  init: RequestInit,
  statusMessage: string
): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), legalSourceTimeoutMs)

  try {
    return await fetch(sourceUrl, {
      ...init,
      signal: controller.signal
    })
  } catch (error) {
    throw createError({
      statusCode: isAbortError(error) ? 504 : 502,
      statusMessage
    })
  } finally {
    clearTimeout(timeout)
  }
}

export function normalizeLegalPlaceholders(value: unknown): LegalPlaceholderMap {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Legal placeholder data must be a JSON object.'
    })
  }

  return Object.entries(value).reduce<LegalPlaceholderMap>((placeholders, [key, entry]) => {
    if (placeholderNamePattern.test(key) && typeof entry === 'string') {
      placeholders[key] = entry
    }

    return placeholders
  }, {})
}

export async function fetchLegalPlaceholders(event: H3Event): Promise<LegalPlaceholderMap> {
  const runtimeConfig = useRuntimeConfig(event)
  const legalConfig = runtimeConfig.legal as LegalRuntimeConfig | undefined
  const placeholdersUrl = legalConfig?.clientPlaceholdersUrl?.trim()

  if (!placeholdersUrl) {
    return {}
  }

  const sourceUrl = assertLegalFetchableUrl(placeholdersUrl, 'NUXT_LEGAL_CLIENT_PLACEHOLDERS_URL')
  const response = await fetchLegalSource(sourceUrl, {
    headers: {
      accept: 'application/json, text/json, */*'
    }
  }, 'Could not load legal placeholder data.')

  if (!response.ok) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Could not load legal placeholder data.'
    })
  }

  let payload: unknown

  try {
    payload = await response.json()
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: 'Legal placeholder data must be valid JSON.'
    })
  }

  return normalizeLegalPlaceholders(payload)
}
