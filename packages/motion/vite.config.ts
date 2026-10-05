import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import dts from 'vite-plugin-dts'
import { execSync } from 'node:child_process'
import path from 'node:path'
import pkg from './package.json' with { type: 'json' }
import { registerTS } from 'vue/compiler-sfc'
import ts from 'typescript'

// plugin-vue doesn't register a TypeScript loader itself; SFC imported-type
// resolution (defineProps<T> with extends) needs ts.sys for fs access
registerTS(() => ts)

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
        execSync('pnpm build:plugins', { stdio: 'inherit', cwd: path.resolve(import.meta.dirname, '../plugins') })
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
  build: {
    minify: false,
    lib: {
      entry: path.resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es'],
    },
    rolldownOptions: {
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
