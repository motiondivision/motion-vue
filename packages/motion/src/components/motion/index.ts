import { domAnimation } from '@/features/dom-animation'
import Motion, { type MotionProps } from './Motion.vue'
import { features } from '@/features/feature-manager'
import type { Feature } from '@/features'

Motion.prototype.features = features
features.push(...(domAnimation as unknown as Feature[]))
console.log('features', features)
export { motion } from './NameSpace'

export { Motion, type MotionProps }
