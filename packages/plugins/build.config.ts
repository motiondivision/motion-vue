import { defineBuildConfig } from 'unbuild'
import { dependencies } from './package.json'

export default defineBuildConfig([
  {
    name: 'Nuxt module',
    entries: ['./src/nuxt/index.ts'],
    outDir: '../motion/dist',
    clean: false,
    declaration: 'node16',
    externals: [
      ...Object.keys(dependencies),
    ],
  },

  {
    name: 'Unplugin-vue-component Resolver',
    entries: ['./src/resolver/index'],
    outDir: '../motion/dist',
    clean: false,
    declaration: 'node16',
    externals: [
      'unplugin-vue-components',
    ],
  },
])
