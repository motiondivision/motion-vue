import type { WillChange } from '@/value/use-will-change/types'
import { isMotionValue } from 'framer-motion/dom'

export function isWillChangeMotionValue(value: any): value is WillChange {
  return Boolean(isMotionValue(value) && ((value as unknown) as WillChange).add)
}
