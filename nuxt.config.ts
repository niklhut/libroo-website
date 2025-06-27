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
    dbFileName: 'file:local.db'
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

  turnstile: {
    siteKey: '1x00000000000000000000AA',
    secretKey: '3x0000000000000000000000000000000AA'
  },

  umami: {
    autoTrack: true,
    useDirective: true,
    urlOptions: {
      trailingSlash: 'never'
    },
    ignoreLocalhost: true
  }
})
