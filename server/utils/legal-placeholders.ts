import type { H3Event } from 'h3'

export type LegalPlaceholderMap = Record<string, string>

interface LegalRuntimeConfig {
  clientPlaceholdersUrl?: string
}

const placeholderNamePattern = /^[A-Z0-9_]+$/

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

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw createError({
      statusCode: 500,
      statusMessage: `${configKey} must use http or https.`
    })
  }

  return url
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
  const response = await fetch(sourceUrl, {
    headers: {
      accept: 'application/json, text/json, */*'
    }
  })

  if (!response.ok) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Could not load legal placeholder data.'
    })
  }

  return normalizeLegalPlaceholders(await response.json())
}
