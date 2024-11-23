import { useAnimationFrame } from '@/utils/use-animation-frame'
import { motionValue } from 'framer-motion/dom'

export function useTime() {
  const time = motionValue(0)
  useAnimationFrame(t => time.set(t))
  return time
}
