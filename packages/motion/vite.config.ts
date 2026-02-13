import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import dts from 'vite-plugin-dts'
import { execSync } from 'node:child_process'
import path from 'node:path'
import pkg from './package.json'

export default defineConfig({
  plugins: [
    vue() as any,
    vueJsx() as any,
    dts({
      cleanVueFileName: true,
      outDir: 'dist/es',
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
    },
  },
  build: {
    minify: false,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
        'framer-motion/dom',
      ],
      output: {
        format: 'es',
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
    },
  },
})
