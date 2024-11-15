import type { visualElementStore } from 'framer-motion'

type VisualElementStore = typeof visualElementStore
// @ts-ignore
declare module 'framer-motion/dist/es/render/store.mjs' {
  export const visualElementStore: VisualElementStore
}
