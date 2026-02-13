import type { ComponentResolver } from 'unplugin-vue-components'

const components = new Set([
  'Motion',
  'AnimatePresence',
  'LayoutGroup',
  'MotionConfig',
  'ReorderGroup',
  'ReorderItem',
  'M',
  'vMotion',
])

export default function (): ComponentResolver {
  return {
    type: 'component',
    resolve: (name: string) => {
      if (components.has(name)) {
        return {
          name,
          from: 'motion-v',
        }
      }
    },
  }
}
