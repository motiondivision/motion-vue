import type { MaybeRef } from 'vue'
import { toValue, watch } from 'vue'
import { isMotionValue, motionValue } from 'framer-motion/dom'
import type { MotionValue } from 'framer-motion/dom'
import type { FollowValueOptions, SpringOptions } from 'motion-dom'
import { attachFollow } from 'motion-dom'

type AnyResolvedKeyframe = string | number

export function useFollowValue<T extends AnyResolvedKeyframe>(
  source: T | MotionValue<T>,
  options: MaybeRef<FollowValueOptions> = {},
) {
  const value = motionValue(
    isMotionValue(source) ? source.get() : source,
  )

  let cleanup: VoidFunction | undefined

  watch(() => toValue(options), (_1, _2, onCleanup) => {
    cleanup = attachFollow(value, source, toValue(options))
    onCleanup(() => {
      cleanup?.()
    })
  }, { immediate: true })

  return value
}

export function useSpring(
  source: MotionValue<string> | MotionValue<number> | number,
  config: MaybeRef<SpringOptions> = {},
) {
  const value = motionValue(
    isMotionValue(source) ? source.get() : source,
  )

  watch(() => toValue(config), (_1, _2, onCleanup) => {
    const cleanup = attachFollow(value, source, { type: 'spring', ...toValue(config) })
    onCleanup(() => {
      cleanup?.()
    })
  }, { immediate: true })

  return value
}
