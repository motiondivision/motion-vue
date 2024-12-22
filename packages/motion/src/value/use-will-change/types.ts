import type { MotionValue } from 'framer-motion'

export interface WillChange extends MotionValue {
  add: (name: string) => void
}
