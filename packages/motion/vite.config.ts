import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import dts from 'vite-plugin-dts'

import path from 'node:path'

export default defineConfig({
  plugins: [
    vue() as any,
    vueJsx() as any,
    dts({
      cleanVueFileName: true,
      outDir: 'dist',
      exclude: ['src/test/**', 'src/**/story/**', 'src/**/*.story.vue'],
    }),

  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'framer-motion/dist/es/animation/utils/create-visual-element.mjs': path.resolve(__dirname, 'node_modules/framer-motion/dist/es/animation/utils/create-visual-element.mjs'),
      'framer-motion/dist/es/render/store.mjs': path.resolve(__dirname, 'node_modules/framer-motion/dist/es/render/store.mjs'),
    },
  },
  build: {
    lib: {
      name: 'motion-v',
      formats: ['es', 'cjs'],
      fileName: format => `index.${format === 'es' ? 'js' : 'cjs'}`,
      entry: path.resolve(__dirname, 'src/index.ts'),
    },
    rollupOptions: {
      external: [
        'vue',
        // 'framer-motion',
      ],
    },
  },
})
