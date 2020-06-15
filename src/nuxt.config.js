/* eslint-disable max-len */

const dev = process.env.NODE_ENV === 'development'
const cache = false

module.exports = {
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
        src: '//ads.dreamnet.tech/www/delivery/asyncjs.php',
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
    'tippy.js/dist/tippy.css',
    'cropperjs/dist/cropper.css',
    'vue-slider-component/theme/default.css',

    'sweetalert2/src/sweetalert2.scss',
    '@sweetalert2/theme-dark/dark.css',

    'tui-image-editor/dist/tui-image-editor.css',
    'tui-color-picker/dist/tui-color-picker.css',

    'intro.js/introjs.css',
    'intro.js/themes/introjs-modern.css',

    '~/assets/css/tailwind.scss',
    '~/assets/css/reset/all.scss',
    '~/assets/css/components/all.scss',
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
    // Doc: https://github.com/nuxt/components#setup
    '@nuxt/components',
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
   *
   */
  components: [
    '~/components/',
  ],

  /**
   *
   */
  dev,

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
        limit: 10 * 1000,
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
            name: ({ isDev }) => (isDev ? '[name].[ext]' : 'workers/[contenthash:7].[ext]'),
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
            name: ({ isDev }) => (isDev ? '[name].[ext]' : 'sounds/[contenthash:7].[ext]'),
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
