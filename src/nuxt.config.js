/* eslint-disable max-len */

const tailwind = require('./tailwind.config')

const dev = process.env.NODE_ENV === 'development'
const cache = false

module.exports = {
  dev,

  // Disable server-side rendering (https://go.nuxtjs.dev/ssr-mode)
  ssr: false,

  // Target (https://go.nuxtjs.dev/config-target)
  target: 'static',

  // Nuxt.js router (https://nuxtjs.org/docs/2.x/configuration-glossary/configuration-router)
  router: {
    mode: 'hash',
  },

  // Server settings (https://nuxtjs.org/docs/2.x/configuration-glossary/configuration-server)
  server: {
    port: process.env.SERVER_PORT || 3000,
    host: process.env.SERVER_HOST || '127.0.0.1',
  },

  // Global page headers (https://go.nuxtjs.dev/config-head)
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

  // Customize the progress-bar color. (https://nuxtjs.org/docs/2.x/configuration-glossary/configuration-loading#customizing-the-progress-bar)
  loading: { color: tailwind.theme.extend.colors.primary.DEFAULT },

  // Loading indicator. (https://nuxtjs.org/docs/2.x/configuration-glossary/configuration-loading-indicator)
  loadingIndicator: {
    name: 'cube-grid',
    color: tailwind.theme.extend.colors.primary.DEFAULT,
    background: tailwind.theme.extend.colors.background,
  },

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: [
    '~/assets/css/vendor.scss',
    '~/assets/css/app.scss',
  ],

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: [
    '~/plugins/binds.js',
    '~/plugins/boot.js',
    '~/plugins/setup.js',
    '~/plugins/fontawesome.js',
    '~/plugins/vue-slider.js',
    '~/plugins/vue-portal.js',
  ],

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [
    // Doc: https://github.com/nuxt-community/nuxt-tailwindcss
    '@nuxtjs/tailwindcss',
    // Doc: https://github.com/nuxt-community/style-resources-module
    '@nuxtjs/style-resources',
  ],

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: [],

  //
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.scss',
  },

  // https://github.com/nuxt-community/style-resources-module
  styleResources: {
    scss: '~/assets/css/utilities/all.scss',
  },

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: true,

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {
    // Enable thread-loader in webpack building.
    parallel: false,

    // Enables the HardSourceWebpackPlugin for improved caching.
    hardSource: cache,

    // Enable cache of terser-webpack-plugin and cache-loader.
    cache,

    // Enables Common CSS Extraction using Vue Server Renderer guidelines.
    extractCSS: false,

    //
    publicPath: '/assets/',

    // Customize Babel configuration for JavaScript and Vue files.
    babel: {
      plugins: [
        // 'lodash',
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

      presets({ isServer }) {
        return [
          [
            '@nuxt/babel-preset-app',
            {
              targets: isServer ? 'current node' : {},
            },
          ],
        ]
      },
    },

    // You can extend webpack config here.
    extend(config, { isDev }) {
      //
      config.target = 'electron-renderer'

      //
      config.output.publicPath = './assets/'

      // Don't throw warning when asset created is over 250kb
      config.performance.hints = false

      // Disable handling of requires with a single expression.
      config.module.exprContextCritical = false

      // Worker loader.
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

      // Media loader.
      config.module.rules.push({
        test: /\.(ogg|mp3|wav|mpe?g)$/i,
        use: {
          loader: 'file-loader',
          options: {
            name: () => (isDev ? '[name].[ext]' : 'sounds/[contenthash:7].[ext]'),
          },
        },
      })

      // YAML loader.
      config.module.rules.push({
        test: /\.ya?ml$/,
        use: ['js-yaml-loader'],
      })

      // Source maps.
      config.devtool = 'source-map'
    },
  },
}
