import { createRequire } from 'node:module'
import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vitest/config'

const require = createRequire(import.meta.url)

// vue's CJS build (node condition) doesn't re-export runtime-vapor, and
// vite-node always applies the node condition — the vapor project pins the
// whole vue chain to its ESM bundler builds so vapor APIs exist in tests.
// @vue/test-utils is not part of that world (it loads the CJS vue), so vapor
// tests must mount with createVaporApp directly.
function fromPkg(from: string, pkg: string) {
  return path.dirname(require.resolve(`${pkg}/package.json`, { paths: [from] }))
}
const vueDir = fromPkg(import.meta.dirname, 'vue')
const runtimeDomDir = fromPkg(vueDir, '@vue/runtime-dom')
function esm(dir: string, name: string) {
  return path.join(dir, 'dist', `${name}.esm-bundler.js`)
}

export default defineConfig({
  plugins: [vue(), vueJsx()],
  test: {
    // The suite is tuned for happy-dom (historically via the `--dom` CLI flag,
    // which does not propagate into projects) — pin it in config instead.
    environment: 'happy-dom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'vdom',
          include: ['src/**/*.test.{ts,tsx}'],
          exclude: ['src/**/*-vapor.test.ts'],
        },
      },
      {
        extends: true,
        resolve: {
          alias: [
            { find: 'vue', replacement: esm(vueDir, 'vue') },
            { find: '@vue/runtime-vapor', replacement: esm(fromPkg(vueDir, '@vue/runtime-vapor'), 'runtime-vapor') },
            { find: '@vue/runtime-dom', replacement: esm(runtimeDomDir, 'runtime-dom') },
            { find: '@vue/runtime-core', replacement: esm(fromPkg(runtimeDomDir, '@vue/runtime-core'), 'runtime-core') },
            { find: '@vue/reactivity', replacement: esm(fromPkg(runtimeDomDir, '@vue/reactivity'), 'reactivity') },
            { find: '@vue/shared', replacement: esm(fromPkg(runtimeDomDir, '@vue/shared'), 'shared') },
          ],
        },
        test: {
          name: 'vapor',
          include: ['src/**/*-vapor.test.ts'],
          server: {
            deps: {
              inline: ['vue', /^@vue\//],
            },
          },
        },
      },
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
})
