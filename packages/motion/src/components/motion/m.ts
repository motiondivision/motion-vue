import type { MotionComponent } from '@/components/motion/types'
import { createMotionComponentWithFeatures } from '@/components/motion/utils'

export const m = createMotionComponentWithFeatures()
export const M = m.create('div') as unknown as MotionComponent
