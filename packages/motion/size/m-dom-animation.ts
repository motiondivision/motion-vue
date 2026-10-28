import { LazyMotion } from '@/components/lazy-motion'
import { m } from '@/components/motion/m'
import { domAnimation } from '@/features/dom-animation'

// One graph so shared modules are counted once (m + LazyMotion + domAnimation).
export const MotionDiv = m.create('div')
export { LazyMotion, domAnimation }
