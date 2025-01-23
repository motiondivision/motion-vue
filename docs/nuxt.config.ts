// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1, shrink-to-fit=no',
        },
      ],
    },
  },
  nitro: {
    preset: 'cloudflare-pages',
  },
  experimental: {
    payloadExtraction: false,
  },

  compatibilityDate: '2024-12-16',
  devtools: { enabled: true },
  vite: {
    optimizeDeps: {
      include: ['yaml', 'parse-entities'],
    },
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    'shadcn-nuxt',
    '@nuxt/content',
    '@nuxt/image',
    'motion-v/nuxt',
    '@nuxt/icon',
    'nuxt-og-image',
  ],
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: 'Ui',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './components/ui',
  },
  content: {
    documentDriven: true,
    highlight: {
      theme: {
        default: 'github-light',
        dark: 'github-dark',
      },
      preload: ['json', 'js', 'ts', 'html', 'css', 'vue', 'diff', 'shell', 'markdown', 'yaml', 'bash', 'ini'],
    },
    navigation: {
      fields: [
        'icon',
        'navBadges',
        'navTruncate',
        'badges',
        'toc',
        'sidebar',
        'collapse',
        'editLink',
        'prevNext',
        'breadcrumb',
      ],
    },
    experimental: {
      search: {
        indexed: true,
      },
    },
  },
  colorMode: {
    classSuffix: '',
    disableTransition: true,
  },
  icon: {
    clientBundle: {
      scan: true,
      sizeLimitKb: 512,
    },
  },
  ssr: true,
  // ogImage: {
  //   enabled: false,
  // },
})
