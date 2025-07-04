import { copyDrizzleMigrations } from './server/utils/nitro-hooks'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui-pro',
    '@nuxt/content',
    '@nuxtjs/turnstile',
    'nuxt-umami',
    '@nuxtjs/seo'
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
    dbFileName: process.env.NUXT_DB_FILE_NAME || 'local.db',
    turnstileSecretKey: process.env.NUXT_TURNSTILE_SECRET_KEY,
    umamiHost: process.env.NUXT_UMAMI_HOST,
    umamiId: process.env.NUXT_UMAMI_ID,

    public: {
      turnstileSiteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY,
      siteUrl: process.env.NUXT_SITE_URL
    }
  },

  future: {
    compatibilityVersion: 4
  },

  compatibilityDate: '2025-01-15',

  nitro: {
    experimental: {
      tasks: true
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
  },

  turnstile: {
    siteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA',
    secretKey: process.env.NUXT_TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA'
  },

  umami: {
    host: process.env.NUXT_UMAMI_HOST,
    id: process.env.NUXT_UMAMI_ID,
    autoTrack: true,
    useDirective: true,
    proxy: 'cloak',
    urlOptions: {
      trailingSlash: 'never'
    },
    ignoreLocalhost: true
  }
})
