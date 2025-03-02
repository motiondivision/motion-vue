import type { ComponentResolver } from 'unplugin-vue-components'

const components = [
  'Motion',
  'AnimatePresence',
  'LayoutGroup',
  'MotionConfig',
  'ReorderGroup',
  'ReorderItem',
]

export default function (): ComponentResolver {
  return {
    type: 'component',
    resolve: (name: string) => {
      if (components.includes(name)) {
        return {
          name,
          from: 'motion-v',
        }
      }
    },
  }
}
