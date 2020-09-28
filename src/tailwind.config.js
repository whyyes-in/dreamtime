// See default config https://github.com/tailwindcss/tailwindcss/blob/master/stubs/defaultConfig.stub.js
module.exports = {
  theme: {
    spacing: {
      px: '1px',
      0: '0',
      1: '0.25rem',
      2: '0.5rem',
      3: '0.75rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      8: '2rem',
      9: '2.25rem',
      10: '2.5rem',
      12: '3rem',
      16: '4rem',
      20: '5rem',
      24: '6rem',
      32: '8rem',
      40: '10rem',
      48: '12rem',
      56: '14rem',
      64: '16rem',
    },

    screens: {
      xl: { max: '2000px' },
      lg: { max: '1800px' },
      md: { max: '1600px' },
      sm: { max: '1400px' },
    },

    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Inter',
          'system-ui',
          'Arial',
          'sans-serif',
        ],
        serif: [
          'Roboto Slab',
          'Georgia',
          'Cambria',
          '"Times New Roman"',
          'Times',
          'serif',
        ],
      },

      // https://javisperez.github.io/tailwindcolorshades/
      colors: {
        generic: {
          100: '#DCDCE0',
          200: '#D7D7DB',
          300: '#D2D2D7',
          400: '#CDCDD2',
          500: '#C8C8CE',
          600: '#B6B6BB',
          700: '#A4A4A9',
          800: '#929296',
          900: '#808084',
        },

        common: {
          light: '#e4e4e7',
          default: '#c8c8ce',
          dark: '#8c8c90',
        },

        input: {
          light: '#242525',
          default: '#18191a',
          dark: '#161717',
        },

        menus: {
          light: '#2b2e33',
          default: '#14171c',
          dark: '#121519',
        },

        button: {
          light: '#696a6d',
          default: '#434549',
          dark: '#36373a',
        },

        dark: {
          100: '#65676A',
          200: '#505255',
          300: '#3A3D40',
          400: '#25272B',
          500: '#0f1216',
          600: '#0E1014',
          700: '#0C0F12',
          800: '#0B0D10',
          900: '#0A0C0E',
        },

        navbar: {
          100: '#E6E6E7',
          200: '#C1C1C3',
          300: '#9B9C9E',
          400: '#515156',
          500: '#06070D',
          600: '#05060C',
          700: '#040408',
          800: '#030306',
          900: '#020204',
        },

        background: '#060709',

        danger: {
          100: '#FEECEB',
          200: '#FCD0CD',
          300: '#FBB4AF',
          400: '#F77B72',
          500: '#F44336',
          light: '#f6695e',
          default: '#F44336',
          dark: '#c3362b',
          600: '#DC3C31',
          700: '#922820',
          800: '#6E1E18',
          900: '#491410',
        },

        success: {
          100: '#EEF8ED',
          200: '#D5EDD1',
          300: '#BCE3B5',
          400: '#89CD7E',
          500: '#57B846',
          light: '#79c66b',
          default: '#57B846',
          dark: '#469338',
          600: '#4EA63F',
          700: '#346E2A',
          800: '#275320',
          900: '#1A3715',
        },

        warning: {
          100: '#F9F2E8',
          200: '#F0DEC5',
          300: '#E6CBA2',
          400: '#D4A35C',
          500: '#C17C16',
          default: '#C17C16',
          600: '#AE7014',
          700: '#744A0D',
          800: '#57380A',
          900: '#3A2507',
        },

        primary: {
          100: '#E5A667',
          200: '#E19A51',
          300: '#DD8D3C',
          400: '#DA8126',
          500: '#D67411',
          light: '#de9041',
          default: '#D67411',
          dark: '#ab5d0e',
          600: '#C36A0F',
          700: '#AF5F0E',
          800: '#9C550C',
          900: '#894A0B',
        },

        blue: {
          light: '#58c7ec',
          default: '#2EB9E7',
          dark: '#2594b9',
        },
      },

      boxShadow: {
        default: '0 1px 3px 0 rgba(0, 0, 0, 0.5), 0 1px 2px 0 rgba(0, 0, 0, 0.56)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.6), 0 2px 4px -1px rgba(0, 0, 0, 0.56)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.7), 0 4px 6px -2px rgba(0, 0, 0, 0.55)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.8), 0 10px 10px -5px rgba(0, 0, 0, 0.54)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.85)',
      },
    },
  },
  variants: {},
  plugins: [
    require('tailwindcss-alpha')({
      modules: {
        borderColor: {
          process: true,
        },
      },
      alpha: {
        10: 0.1,
        20: 0.2,
        30: 0.3,
        40: 0.4,
        50: 0.5,
        60: 0.6,
        70: 0.7,
        80: 0.8,
        90: 0.9,
      },
    }),
  ],
  purge: {
    // https://tailwindcss.com/docs/controlling-file-size/#removing-unused-css
    enabled: true,
    content: [
      'components/**/*.vue',
      'layouts/**/*.vue',
      'pages/**/*.vue',
      'plugins/**/*.js',
      'modules/**/*.js',
      'nuxt.config.js',
    ],
  },
  corePlugins: {
    container: false,
  },
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
}
