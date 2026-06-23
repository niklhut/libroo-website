type LegalPage = 'imprint' | 'privacy' | 'terms'

interface LegalPageConfig {
  redirectUrl?: string
  markdownUrl?: string
}

const labels: Record<LegalPage, string> = {
  imprint: 'Imprint',
  privacy: 'Privacy Policy',
  terms: 'Terms of Service'
}

const hasPlaceholderPattern = /\{\{\s*[A-Z0-9_]+\s*\}\}/
const placeholderPattern = /\{\{\s*([A-Z0-9_]+)\s*\}\}/g

function isLegalPage(value: string | undefined): value is LegalPage {
  return value === 'imprint' || value === 'privacy' || value === 'terms'
}

export default defineEventHandler(async (event) => {
  const page = getRouterParam(event, 'page')

  if (!isLegalPage(page)) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Legal page not found.'
    })
  }

  const runtimeConfig = useRuntimeConfig(event)
  const legalConfig = runtimeConfig.legal?.[page] as LegalPageConfig | undefined
  const redirectUrl = legalConfig?.redirectUrl?.trim()
  const markdownUrl = legalConfig?.markdownUrl?.trim()

  setLegalCacheHeaders(event)

  if (redirectUrl) {
    assertLegalFetchableUrl(redirectUrl, `NUXT_LEGAL_${page.toUpperCase()}_REDIRECT_URL`)

    return {
      type: 'redirect',
      title: labels[page],
      url: redirectUrl
    }
  }

  if (!markdownUrl) {
    return {
      type: 'unconfigured',
      title: labels[page]
    }
  }

  const sourceUrl = assertLegalFetchableUrl(markdownUrl, `NUXT_LEGAL_${page.toUpperCase()}_MARKDOWN_URL`)
  const markdownLoadError = `Could not load ${labels[page].toLowerCase()} markdown.`
  const response = await fetchLegalSource(sourceUrl, {
    headers: {
      accept: 'text/markdown, text/plain, */*'
    }
  }, markdownLoadError)

  if (!response.ok) {
    throw createError({
      statusCode: 502,
      statusMessage: markdownLoadError
    })
  }

  let markdown: string

  try {
    markdown = await response.text()
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: markdownLoadError
    })
  }

  const markdownWithPlaceholderMarkers = markdown.replace(placeholderPattern, (_match, key: string) => {
    return `<span data-legal-placeholder="${key}"></span>`
  })
  const parsedMarkdown = await parseMarkdown(markdownWithPlaceholderMarkers, {
    contentHeading: false,
    toc: false
  })

  const hasPlaceholders = hasPlaceholderPattern.test(markdown)
  const query = getQuery(event)
  const includePlaceholders = query.includePlaceholders === '1'
  let placeholders: Awaited<ReturnType<typeof fetchLegalPlaceholders>> | undefined

  if (hasPlaceholders && includePlaceholders) {
    try {
      placeholders = await fetchLegalPlaceholders(event)
    } catch {
      placeholders = {}
    }
  }

  return {
    type: 'markdown',
    title: labels[page],
    body: parsedMarkdown.body,
    data: parsedMarkdown.data,
    hasPlaceholders,
    markdownLength: markdown.length,
    placeholders
  }
})
