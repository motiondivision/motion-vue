// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  css: ['~/assets/css/tailwind.css'],
  modules: [
    '@nuxtjs/tailwindcss',
    'motion-v/nuxt',
  ],
  app: {
    head: {
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cove',
        },
      ],
    },
  },
  vite: {
    optimizeDeps: {
      include: ['flubber'],
    },
  },
})
