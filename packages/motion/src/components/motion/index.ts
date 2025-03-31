export { type MotionProps } from './types'
import type { MotionComponent } from '@/components/motion/types'
import { createMotionComponentWithFeatures } from './utils'
import { domMax } from '@/features/dom-max'

export const motion = createMotionComponentWithFeatures(domMax)
export const Motion = motion.create('div') as unknown as MotionComponent
