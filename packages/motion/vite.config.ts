import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import dts from 'vite-plugin-dts'
import { execSync } from 'node:child_process'
import path from 'node:path'

export default defineConfig({
  plugins: [
    vue() as any,
    vueJsx() as any,
    dts({
      cleanVueFileName: true,
      outDir: 'dist',
      exclude: ['src/**/__tests__/**', 'src/**/story/**', 'src/**/*.story.vue'],
      afterBuild: async () => {
        // pnpm build:plugins
        execSync('pnpm build:plugins', { stdio: 'inherit', cwd: path.resolve(__dirname, '../plugins') })
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'framer-motion/dist/es/render/dom/create-visual-element.mjs': path.resolve(__dirname, 'node_modules/framer-motion/dist/es/render/dom/create-visual-element.mjs'),
      'framer-motion/dist/es/render/store.mjs': path.resolve(__dirname, 'node_modules/framer-motion/dist/es/render/store.mjs'),
      'motion-value': path.resolve(__dirname, 'node_modules/framer-motion/dist/es/value/index.mjs'),
      'framer-main-animation': path.resolve(__dirname, 'node_modules/framer-motion/dist/es/animation/animators/MainThreadAnimation.mjs'),
      'framer-motion/dist/es/projection/node/HTMLProjectionNode.mjs': path.resolve(__dirname, 'node_modules/framer-motion/dist/es/projection/node/HTMLProjectionNode.mjs'),
      'framer-motion/dist/es/projection/styles/scale-border-radius.mjs': path.resolve(__dirname, 'node_modules/framer-motion/dist/es/projection/styles/scale-border-radius.mjs'),
      'framer-motion/dist/es/projection/styles/scale-box-shadow.mjs': path.resolve(__dirname, 'node_modules/framer-motion/dist/es/projection/styles/scale-box-shadow.mjs'),
      'framer-motion/dist/es/projection/styles/scale-correction.mjs': path.resolve(__dirname, 'node_modules/framer-motion/dist/es/projection/styles/scale-correction.mjs'),
      'framer-motion/dist/es/projection/node/state.mjs': path.resolve(__dirname, 'node_modules/framer-motion/dist/es/projection/node/state.mjs'),
      'framer-motion/dist/es/render/html/HTMLVisualElement.mjs': path.resolve(__dirname, 'node_modules/framer-motion/dist/es/render/html/HTMLVisualElement.mjs'),
      'framer-motion/dist/es/render/svg/SVGVisualElement.mjs': path.resolve(__dirname, 'node_modules/framer-motion/dist/es/render/svg/SVGVisualElement.mjs'),
      'framer-motion/dist/es/animation/interfaces/motion-value.mjs': path.resolve(__dirname, 'node_modules/framer-motion/dist/es/animation/interfaces/motion-value.mjs'),
      'framer-motion/dist/es/render/utils/setters.mjs': path.resolve(__dirname, 'node_modules/framer-motion/dist/es/render/utils/setters.mjs'),
    },
  },
  build: {
    minify: false,
    lib: {
      name: 'motion-v',
      entry: path.resolve(__dirname, 'src/index.ts'),
    },
    rollupOptions: {
      external: [
        // ...Object.keys(pkg.dependencies || {}),
        'vue',
        'hey-listen',
        '@vueuse/core',
      ],
      output: [
        {
          format: 'es',
          globals: {
            vue: 'Vue',
          },
          entryFileNames(chunkInfo) {
            if (chunkInfo.name.includes('node_modules'))
              return `${chunkInfo.name.replace(/node_modules/g, 'external')}.mjs`
            return '[name].mjs'
          },
          dir: './dist/es',
          exports: 'named',
          preserveModules: true,
          preserveModulesRoot: 'src',
        },
        {
          format: 'cjs',
          name: 'motion-v',
          globals: {
            vue: 'Vue',
          },
          entryFileNames: '[name].js',
          dir: 'dist/cjs',
          exports: 'named',
          esModule: true,
        },
      ],
    },
  },
})
