import path from 'node:path'
import { createRequire } from 'node:module'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const require = createRequire(import.meta.url)

/**
 * Pin the vue / @vue/* ESM bundler builds so vapor APIs
 * (createVaporApp, withVaporDirectives, vaporInteropPlugin) resolve
 * the same way motion-v's vapor vitest project does.
 */
function fromPkg(from: string, pkg: string) {
  return path.dirname(require.resolve(`${pkg}/package.json`, { paths: [from] }))
}

const vueDir = fromPkg(import.meta.dirname, 'vue')
const runtimeDomDir = fromPkg(vueDir, '@vue/runtime-dom')
function esm(dir: string, name: string) {
  return path.join(dir, 'dist', `${name}.esm-bundler.js`)
}

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5174,
    watch: {
      ignored: ['!**/node_modules/motion-v/**'],
    },
    fs: {
      allow: ['..'],
    },
  },
  optimizeDeps: {
    force: true,
    exclude: ['motion-v'],
    include: ['vue', '@vue/runtime-vapor'],
  },
  resolve: {
    alias: [
      { find: 'vue', replacement: esm(vueDir, 'vue') },
      { find: '@vue/runtime-vapor', replacement: esm(fromPkg(vueDir, '@vue/runtime-vapor'), 'runtime-vapor') },
      { find: '@vue/runtime-dom', replacement: esm(runtimeDomDir, 'runtime-dom') },
      { find: '@vue/runtime-core', replacement: esm(fromPkg(runtimeDomDir, '@vue/runtime-core'), 'runtime-core') },
      { find: '@vue/reactivity', replacement: esm(fromPkg(runtimeDomDir, '@vue/reactivity'), 'reactivity') },
      { find: '@vue/shared', replacement: esm(fromPkg(runtimeDomDir, '@vue/shared'), 'shared') },
      { find: '@', replacement: path.resolve(import.meta.dirname, 'src') },
    ],
  },
})
