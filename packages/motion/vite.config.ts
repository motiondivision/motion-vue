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
      exclude: ['src/test/**', 'src/**/story/**', 'src/**/*.story.vue'],
      afterBuild: async () => {
        // pnpm build:plugins
        execSync('pnpm build:plugins', { stdio: 'inherit', cwd: path.resolve(__dirname, '../plugins') })
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'framer-motion/dist/es/animation/utils/create-visual-element.mjs': path.resolve(__dirname, 'node_modules/framer-motion/dist/es/animation/utils/create-visual-element.mjs'),
      'framer-motion/dist/es/render/store.mjs': path.resolve(__dirname, 'node_modules/framer-motion/dist/es/render/store.mjs'),
      'motion-value': path.resolve(__dirname, 'node_modules/framer-motion/dist/es/value/index.mjs'),
      'framer-main-animation': path.resolve(__dirname, 'node_modules/framer-motion/dist/es/animation/animators/MainThreadAnimation.mjs'),
      'framer-motion/dist/es/projection/node/HTMLProjectionNode.mjs': path.resolve(__dirname, 'node_modules/framer-motion/dist/es/projection/node/HTMLProjectionNode.mjs'),
    },
  },
  build: {

    lib: {
      name: 'motion-v',
      entry: path.resolve(__dirname, 'src/index.ts'),
    },
    rollupOptions: {
      external: [
        // ...Object.keys(pkg.dependencies || {}),
        'vue',
      ],
      output: [
        {
          format: 'es',
          globals: {
            vue: 'Vue',
          },
          entryFileNames: '[name].mjs',
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
