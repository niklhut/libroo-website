import { copyDrizzleMigrations } from './server/utils/nitro-hooks'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui-pro',
    '@nuxt/content',
    '@nuxtjs/turnstile',
    'nuxt-umami'
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
