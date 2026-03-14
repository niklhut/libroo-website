// https://nuxt.com/docs/api/configuration/nuxt-config
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
        name: 'libroo-website',
        preview_urls: true,
        routes: [
          {
            pattern: 'libroo.app',
            custom_domain: true
          }
        ],
        d1_databases: [
          {
            binding: 'DB',
            database_name: 'libroo-website',
            database_id: process.env.CLOUDFLARE_D1_DATABASE_ID,
            preview_database_id: process.env.CLOUDFLARE_D1_PREVIEW_DATABASE_ID,
            migrations_dir: 'server/db/migrations'
          }
        ],
        vars: {
          NUXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY,
          NUXT_SITE_URL: process.env.NUXT_SITE_URL,
          NUXT_PUBLIC_SCRIPTS_UMAMI_ANALYTICS_SCRIPT_INPUT_SRC: process.env.NUXT_PUBLIC_SCRIPTS_UMAMI_ANALYTICS_SCRIPT_INPUT_SRC,
          // Use an empty string or a fallback for optional vars
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
