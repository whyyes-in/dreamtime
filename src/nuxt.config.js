/* eslint-disable max-len */

const dev = process.env.NODE_ENV === 'development'
const cache = false

module.exports = {
  dev,

  /**
   *
   */
  ssr: false,

  /**
   * Deployment target
   */
  target: 'static',

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

  /*
   ** Headers of the page
   */
  head: {
    title: process.env.npm_package_displayName || 'DreamTime',

    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ],

    link: [
      {
        rel: 'preload',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=Roboto+Slab:wght@300;400;500;600&display=swap',
        as: 'style',
        onload: 'this.rel = \'stylesheet\'',
      },
    ],

    script: [
      {
        src: 'https://ads.dreamnet.tech/delivery/asyncjs.php',
        async: true,
      },
    ],
  },

  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#D67411' },

  /*
   ** Global CSS
   */
  css: [
    '~/assets/css/vendor.scss',
    '~/assets/css/app.scss',
  ],

  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    '~/plugins/binds.js',
    '~/plugins/boot.js',
    '~/plugins/setup.js',
    '~/plugins/fontawesome.js',
    '~/plugins/vue-slider.js',
    '~/plugins/vue-portal.js',
  ],

  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    // '@nuxtjs/eslint-module',
    // Doc: https://github.com/nuxt-community/nuxt-tailwindcss
    '@nuxtjs/tailwindcss',
    // Doc: https://github.com/nuxt-community/style-resources-module
    '@nuxtjs/style-resources',
  ],

  /*
   ** Nuxt.js modules
   */
  modules: [],

  /**
   *
   */
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.scss',
  },

  /**
   *
   */
  styleResources: {
    scss: '~/assets/css/utilities/all.scss',
  },

  /**
   * Scan and auto import components.
   */
  components: [
    '~/components/',
  ],

  /*
   ** Build configuration
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
        limit: 80 * 1000,
      },
    },

    /**
     * Customize Babel configuration for JavaScript and Vue files.
     */
    babel: {
      sourceType: 'unambiguous',

      plugins: [
        'lodash',
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-export-default-from',
        '@babel/plugin-proposal-optional-chaining',
        [
          'transform-inline-environment-variables',
          {
            exclude: [
              'LOG',
              'DEVTOOLS',
            ],
          },
        ],
      ],

      presets({ envName }) {
        const envTargets = {
          client: { chrome: '83' },
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
     ** You can extend webpack config here.
     */
    extend(config, { isDev }) {
      //
      config.target = 'electron-renderer'

      //
      config.output.publicPath = './assets/'

      // Don't throw warning when asset created is over 250kb
      config.performance.hints = false

      // Disable handling of requires with a single expression.
      config.module.exprContextCritical = false

      //
      config.module.rules.push({
        test: /\.worker\.js$/,
        use: {
          loader: 'worker-loader',
          options: {
            name: () => (isDev ? '[name].[ext]' : 'workers/[contenthash:7].[ext]'),
          },
        },
        exclude: /(node_modules)/,
      })

      //
      config.module.rules.push({
        test: /\.(ogg|mp3|wav|mpe?g)$/i,
        use: {
          loader: 'file-loader',
          options: {
            name: () => (isDev ? '[name].[ext]' : 'sounds/[contenthash:7].[ext]'),
          },
        },
      })

      //
      config.module.rules.push({
        test: /\.ya?ml$/,
        use: ['js-yaml-loader'],
      })

      if (isDev) {
        // Source maps.
        config.devtool = 'source-map'
      }
    },
  },
}
