import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'node:path'

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
      '@': path.resolve(__dirname, 'src'),
      'framer-motion/dist/es/render/store.mjs': path.resolve(__dirname, 'node_modules/framer-motion/dist/es/render/store.mjs'),
      'framer-motion/dist/es/projection/node/HTMLProjectionNode.mjs': path.resolve(__dirname, 'node_modules/framer-motion/dist/es/projection/node/HTMLProjectionNode.mjs'),
      'framer-motion/dist/es/projection/styles/scale-border-radius.mjs': path.resolve(__dirname, 'node_modules/framer-motion/dist/es/projection/styles/scale-border-radius.mjs'),
      'framer-motion/dist/es/projection/styles/scale-box-shadow.mjs': path.resolve(__dirname, 'node_modules/framer-motion/dist/es/projection/styles/scale-box-shadow.mjs'),
      'framer-motion/dist/es/projection/styles/scale-correction.mjs': path.resolve(__dirname, 'node_modules/framer-motion/dist/es/projection/styles/scale-correction.mjs'),
      'framer-motion/dist/es/projection/node/state.mjs': path.resolve(__dirname, 'node_modules/framer-motion/dist/es/projection/node/state.mjs'),
      'framer-motion/dist/es/render/html/HTMLVisualElement.mjs': path.resolve(__dirname, 'node_modules/framer-motion/dist/es/render/html/HTMLVisualElement.mjs'),
      'framer-motion/dist/es/render/svg/SVGVisualElement.mjs': path.resolve(__dirname, 'node_modules/framer-motion/dist/es/render/svg/SVGVisualElement.mjs'),
      'framer-motion/dist/es/animation/interfaces/motion-value.mjs': path.resolve(__dirname, 'node_modules/framer-motion/dist/es/animation/interfaces/motion-value.mjs'),
      'framer-motion/dist/es/utils/reduced-motion/state.mjs': path.resolve(__dirname, 'node_modules/framer-motion/dist/es/utils/reduced-motion/state.mjs'),
    },
  },
})
