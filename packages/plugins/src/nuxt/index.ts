import { addComponent, addImports, addPluginTemplate, addTypeTemplate, defineNuxtModule } from '@nuxt/kit'
import type { Options } from 'motion-v'

const components = [
  'Motion',
  'AnimatePresence',
  'LayoutGroup',
  'MotionConfig',
  'ReorderGroup',
  'ReorderItem',
  'M',
]
const utilities = [
  'useTransform',
  'useTime',
  'useMotionTemplate',
  'useSpring',
  'useScroll',
  'useMotionValue',
  'useVelocity',
  'useAnimate',
  'useInView',
  'useAnimationFrame',
  'useMotionValueEvent',
  'useLayoutGroup',
  'useDragControls',
  'useReducedMotion',
  'vMotion',
  'createPresetDirective',
]

export type Components = keyof typeof components

export type Utilities = keyof typeof utilities

export interface ModuleOptions {
  components: boolean
  utilities: boolean
  prefix: string
  /** Globally register the v-motion directive */
  directives: boolean
  /** Register custom preset directives (e.g. { 'fade-in': { initial: { opacity: 0 }, animate: { opacity: 1 } } }) */
  presets: Record<string, Options>
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'motion-v',
    configKey: 'motionV',
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },
  defaults: {
    prefix: '',
    components: true,
    utilities: true,
    directives: false,
    presets: {},
  },
  setup(options, _nuxtApp) {
    if (options.components) {
      components.forEach((component) => {
        addComponent({
          name: `${options.prefix}${component}`,
          export: component,
          filePath: 'motion-v',
        })
      })
    }

    if (options.utilities) {
      utilities.forEach((utility) => {
        addImports({
          from: 'motion-v',
          name: utility,
        })
      })
    }

    const presetEntries = Object.entries(options.presets || {})
    const needsPlugin = options.directives || presetEntries.length > 0

    if (needsPlugin) {
      // Prefer MotionPlugin when registering v-motion so createVaporApp
      // (app.vapor) gets the vapor-shaped directive automatically.
      if (options.directives) {
        const presetsOption = presetEntries.length
          ? `, { presets: ${JSON.stringify(Object.fromEntries(presetEntries))} }`
          : ''
        addPluginTemplate({
          filename: 'motion-v-directives.mjs',
          getContents: () => `\
import { defineNuxtPlugin } from '#imports'
import { MotionPlugin } from 'motion-v'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(MotionPlugin${presetsOption})
})
`,
        })
      }
      else {
        const presetLines = presetEntries.map(([name, preset]) =>
          `  nuxtApp.vueApp.directive(${JSON.stringify(name)}, createPresetDirective(${JSON.stringify(preset)}))`,
        )
        addPluginTemplate({
          filename: 'motion-v-directives.mjs',
          getContents: () => `\
import { defineNuxtPlugin } from '#imports'
import { createPresetDirective } from 'motion-v'

export default defineNuxtPlugin((nuxtApp) => {
${presetLines.join('\n')}
})
`,
        })
      }

      // Generate type declarations for globally registered directives
      const typeLines: string[] = []
      if (options.directives) {
        typeLines.push('    vMotion: typeof import(\'motion-v\').vMotion')
      }
      for (const name of presetEntries.map(([n]) => n)) {
        const camelName = `v${name.replace(/(^|-)(\w)/g, (_, _sep, c) => c.toUpperCase())}`
        typeLines.push(`    ${camelName}: import('vue').Directive<HTMLElement | SVGElement, import('motion-v').Options>`)
      }
      if (typeLines.length > 0) {
        addTypeTemplate({
          filename: 'types/motion-v-directives.d.ts',
          getContents: () => `\
declare module 'vue' {
  interface GlobalDirectives {
${typeLines.join('\n')}
  }
}

export {}
`,
        })
      }
    }
  },
})
