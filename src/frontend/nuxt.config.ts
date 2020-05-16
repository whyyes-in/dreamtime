/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Configuration, Context } from '@nuxt/types'

const dev = process.env.NODE_ENV === 'development'
const cache = false

export default {
  /**
   *
   */
  mode: 'spa',

  /**
   *
   */
  router: {
    mode: 'hash',
  },

  /**
   * Server settings
   */
  server: {
    port: process.env.SERVER_PORT || 4000,
    host: process.env.SERVER_HOST || 'localhost',
  },

  /**
   * Headers of the page
   */
  head: {
    title: process.env.APP_NAME || process.env.npm_package_name || '',

    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' },
    ],

    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      {
        rel: 'preload',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap',
        as: 'style',
        onload: 'this.rel = \'stylesheet\'',
      },
    ],
  },

  /**
   * Customize the progress-bar color
   */
  loading: { color: '#D67411' },

  /**
   * Global CSS
   */
  css: [
  ],

  /**
   * Plugins to load before mounting the App
   */
  plugins: [
  ],

  /**
   * Nuxt.js dev-modules
   */
  buildModules: [
    '@nuxt/typescript-build',
    // Doc: https://github.com/nuxt-community/stylelint-module
    '@nuxtjs/stylelint-module',
    // Doc: https://github.com/nuxt-community/nuxt-tailwindcss
    '@nuxtjs/tailwindcss',
  ],

  /**
   * Nuxt.js modules
   */
  modules: [
    '@nuxtjs/pwa',
    // Doc: https://github.com/nuxt-community/dotenv-module
    '@nuxtjs/dotenv',
  ],

  /**
   *
   */
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.scss',
  },

  /**
   *
   */
  eslint: {
    cache: dev,
  },

  /**
   * Build configuration
   */
  build: {
    /**
     * Enable thread-loader in webpack building.
     */
    parallel: true,

    /**
     * Enables the HardSourceWebpackPlugin for improved caching.
     */
    hardSource: cache,

    /**
     * Enable cache of terser-webpack-plugin and cache-loader.
     */
    cache,

    /**
     * Enables Common CSS Extraction using Vue Server Renderer guidelines.
     */
    extractCSS: false,

    /**
     *
     */
    publicPath: '/assets/',

    /**
     * Customize options of Nuxt.js integrated webpack loaders.
     * https://nuxtjs.org/api/configuration-build#loaders
     */
    loaders: {
      imgUrl: {
        limit: 10 * 1000,
      },
    },

    /**
     * Customize Babel configuration for JavaScript and Vue files.
     */
    babel: {
      presets ({ envName }): any {
        const envTargets = {
          client: { browsers: ['last 2 versions'] },
          server: { node: 'current' },
        }

        return [
          [
            '@nuxt/babel-preset-app',
            {
              targets: envTargets[envName],
              corejs: { version: 3 },
            },
          ],
        ]
      },
    },

    /*
    ** You can extend webpack config here
    */
    extend (config: Configuration, ctx: Context): void {
      //
      // config.target = 'electron-renderer'

      // Don't throw warning when asset created is over 250kb.
      config.performance.hints = false

      // Disable handling of requires with a single expression.
      config.module.exprContextCritical = false

      //
      config.output.publicPath = './assets/'

      //
      config.module.rules.push({
        test: /\.worker\.js$/,
        use: {
          loader: 'worker-loader',
          options: {
            name: ({ isDev }): string => (isDev ? '[name].[ext]' : 'workers/[contenthash:7].[ext]'),
          },
        },
        exclude: /(node_modules)/,
      })

      if (dev) {
        // Source maps.
        config.devtool = 'source-map'
      }
    },
  },
}
