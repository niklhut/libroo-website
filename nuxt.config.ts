// https://nuxt.com/docs/api/configuration/nuxt-config
import { copyDrizzleMigrations } from './server/utils/nitro-hooks'

const d1DatabaseId = process.env.CLOUDFLARE_D1_DATABASE_ID
const d1PreviewDatabaseId = process.env.CLOUDFLARE_D1_PREVIEW_DATABASE_ID || d1DatabaseId
const workerName = process.env.CLOUDFLARE_WORKER_NAME || 'libroo-website'
const deployEnv = process.env.CF_DEPLOY_ENV || 'local'
const isDeployRun = ['production', 'preview'].includes(deployEnv)
const overrideExistingDnsRecord = process.env.CLOUDFLARE_OVERRIDE_EXISTING_DNS_RECORD === 'true'
const placeholderDatabaseId = '00000000-0000-0000-0000-000000000000'
const resolvedD1DatabaseId = d1DatabaseId || placeholderDatabaseId
const resolvedD1PreviewDatabaseId = d1PreviewDatabaseId || resolvedD1DatabaseId
const productionRoutes = deployEnv === 'production'
  ? [
      {
        pattern: 'libroo.app',
        custom_domain: true,
        ...(overrideExistingDnsRecord ? { override_existing_dns_record: true } : {})
      } as { pattern: string, custom_domain: true }
    ]
  : []

function ensureD1Env() {
  const missing: string[] = []

  if (!isDeployRun) {
    return
  }

  if (!d1DatabaseId) {
    missing.push('CLOUDFLARE_D1_DATABASE_ID')
  }

  if (missing.length > 0) {
    throw new Error(`Missing required D1 environment variable(s): ${missing.join(', ')}`)
  }
}

function ensurePreviewD1Isolation() {
  if (deployEnv !== 'preview') {
    return
  }

  const previewDbConfigured = Boolean(process.env.CLOUDFLARE_D1_PREVIEW_DATABASE_ID)
  const previewFallsBackToPrimary = !previewDbConfigured
    && Boolean(d1PreviewDatabaseId)
    && Boolean(d1DatabaseId)
    && resolvedD1PreviewDatabaseId === d1DatabaseId

  if (previewFallsBackToPrimary) {
    throw new Error(
      'Preview deploy detected without CLOUDFLARE_D1_PREVIEW_DATABASE_ID. Refusing to run preview against the primary D1 database.'
    )
  }
}

ensureD1Env()
ensurePreviewD1Isolation()

export default defineNuxtConfig({

  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui-pro',
    '@nuxt/content',
    '@nuxtjs/turnstile',
    '@nuxtjs/seo',
    '@nuxt/scripts'
  ],

  imports: {
    dirs: [
      'shared/schema/*'
    ]
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  site: {
    name: 'Libroo',
    description: 'Libroo helps you track books you own, manage collections, and keep tabs on loans — all in one simple, open source app.',
    logo: '/favicon-96x96.png'
  },

  mdc: {
    highlight: {
      noApiRoute: false
    }
  },

  runtimeConfig: {
    turnstile: {
      secretKey: ''
    },
    public: {
      scripts: {
        umamiAnalytics: {
          scriptInput: {
            src: ''
          },
          websiteId: ''
        }
      },
      turnstile: {
        siteKey: ''
      }
    }
  },

  compatibilityDate: '2025-03-13',

  nitro: {
    preset: 'cloudflare-module',
    cloudflare: {
      // Generate a deployable wrangler config in `.output/server/wrangler.json`.
      deployConfig: true,
      wrangler: {
        name: workerName,
        preview_urls: true,
        routes: productionRoutes,
        d1_databases: [
          {
            binding: 'DB',
            database_name: 'libroo-website',
            database_id: resolvedD1DatabaseId,
            preview_database_id: resolvedD1PreviewDatabaseId,
            migrations_dir: 'db/migrations'
          }
        ],
        vars: {
          NUXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY,
          NUXT_SITE_URL: process.env.NUXT_SITE_URL,
          NUXT_PUBLIC_SCRIPTS_UMAMI_ANALYTICS_SCRIPT_INPUT_SRC: process.env.NUXT_PUBLIC_SCRIPTS_UMAMI_ANALYTICS_SCRIPT_INPUT_SRC,
          // Use an empty string for optional vars.
          NUXT_PUBLIC_SCRIPTS_UMAMI_ANALYTICS_WEBSITE_ID: process.env.NUXT_PUBLIC_SCRIPTS_UMAMI_ANALYTICS_WEBSITE_ID || ''
        },
        observability: {
          logs: {
            enabled: true,
            invocation_logs: true
          }
        }
      }
    },
    imports: {
      dirs: [
        'server/db/*',
        'shared/schema/*'
      ]
    },
    prerender: {
      routes: [
        '/'
      ]
    }
  },

  hooks: {
    'nitro:build:public-assets': copyDrizzleMigrations
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  scripts: {
    registry: {
      umamiAnalytics: true
    }
  },

  seo: {
    meta: {
      themeColor: [
        { content: '#3f51b5', media: '(prefers-color-scheme: light)' },
        { content: '#536dfe', media: '(prefers-color-scheme: dark)' }
      ],
      twitterCreator: '@niklhut',
      author: 'Niklas Huthmann',
      colorScheme: 'dark light',
      applicationName: 'Libroo'
    }
  }
})
