import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [vue(), vueJsx()],
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      'framer-motion/dist/es/animation/utils/create-visual-element.mjs': resolve(__dirname, 'node_modules/framer-motion/dist/es/animation/utils/create-visual-element.mjs'),
      'framer-motion/dist/es/render/store.mjs': resolve(__dirname, 'node_modules/framer-motion/dist/es/render/store.mjs'),
    },
  },
})
