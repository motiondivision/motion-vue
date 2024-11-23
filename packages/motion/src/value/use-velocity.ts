import type { MotionValue } from 'framer-motion/dom'
import { frame, motionValue } from 'framer-motion/dom'
import { useMotionValueEvent } from '@/value/use-motion-value-event'

/**
 * 创建一个 MotionValue,当提供的 MotionValue 速度变化时更新
 *
 * ```javascript
 * const x = useMotionValue(0)
 * const xVelocity = useVelocity(x)
 * const xAcceleration = useVelocity(xVelocity)
 * ```
 *
 * @public
 */
export function useVelocity(value: MotionValue<number>): MotionValue<number> {
  const velocity = motionValue(value.getVelocity())

  const updateVelocity = () => {
    const latest = value.getVelocity()
    velocity.set(latest)

    /**
     * 如果还有速度,安排下一帧继续检查直到速度为零
     */
    if (latest) {
      frame.update(updateVelocity)
    }
  }

  useMotionValueEvent(value, 'change', () => {
    // 在当前帧结束时安排更新此值
    frame.update(updateVelocity, false, true)
  })

  return velocity
}
