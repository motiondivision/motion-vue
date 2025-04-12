import { addComponent, addImports, defineNuxtModule } from '@nuxt/kit'

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
]

export type Components = keyof typeof components

export type Utilities = keyof typeof utilities

export interface ModuleOptions {
  components: boolean
  utilities: boolean
  prefix: string
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
  },
})
