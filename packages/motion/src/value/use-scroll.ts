import { type MaybeRefOrGetter, toValue, watchEffect } from 'vue'
import { type AccelerateConfig, type AnimationPlaybackControlsWithThen, motionValue, supportsScrollTimeline, supportsViewTimeline } from 'motion-dom'
import { scroll } from 'framer-motion/dom'
import type { ScrollInfoOptions } from '@/types'
import { isSSR } from '@/utils/is'
import type { MaybeComputedElementRef } from '@vueuse/core'
import { getElement } from '@/components/hooks/use-motion-elm'
import { offsetToViewTimelineRange } from './scroll/offsets'

export interface UseScrollOptions extends Omit<ScrollInfoOptions, 'container' | 'target'> {
  container?: MaybeComputedElementRef
  target?: MaybeComputedElementRef
}

function createScrollMotionValues() {
  return {
    scrollX: motionValue(0),
    scrollY: motionValue(0),
    scrollXProgress: motionValue(0),
    scrollYProgress: motionValue(0),
  }
}

function canAccelerateScroll(
  target: MaybeComputedElementRef | undefined,
  offset: ScrollInfoOptions['offset'],
): boolean {
  if (isSSR)
    return false
  return target
    ? supportsViewTimeline() && !!offsetToViewTimelineRange(offset)
    : supportsScrollTimeline()
}

function makeAccelerateConfig(
  axis: 'x' | 'y',
  options: MaybeRefOrGetter<UseScrollOptions>,
): AccelerateConfig {
  return {
    factory: (animation: AnimationPlaybackControlsWithThen) => {
      const { container, target, ...rest } = toValue(options)
      return scroll(animation, {
        ...rest,
        axis,
        container: getElement(container),
        target: getElement(target),
      })
    },
    times: [0, 1],
    keyframes: [0, 1],
    ease: (v: number) => v,
    duration: 1,
  }
}

export function useScroll(options: MaybeRefOrGetter<UseScrollOptions> = {}) {
  const values = createScrollMotionValues()

  // Set acceleration config once at setup time if browser supports it.
  // The factory lazily resolves options via toValue() at invocation time,
  // so it always gets current values when the VisualElement invokes it.
  // Note: when options is a getter, target/offset are resolved here at
  // construction time (before onMounted), so target will be undefined.
  // This means getter-wrapped targets always use the ScrollTimeline path
  // rather than ViewTimeline — the same behaviour as React's useScroll.
  const { target, offset } = toValue(options)
  if (canAccelerateScroll(target, offset)) {
    values.scrollXProgress.accelerate = makeAccelerateConfig('x', options)
    values.scrollYProgress.accelerate = makeAccelerateConfig('y', options)
  }

  watchEffect((onCleanup) => {
    if (isSSR) {
      return
    }
    const { container, target, ...rest } = toValue(options)
    const cleanup = scroll(
      (_progress, { x, y }) => {
        values.scrollX.set(x.current)
        values.scrollXProgress.set(x.progress)
        values.scrollY.set(y.current)
        values.scrollYProgress.set(y.progress)
      },
      {
        ...rest,
        container: getElement(container),
        target: getElement(target),
      },
    )
    onCleanup(() => {
      cleanup()
    })
  }, {
    flush: 'post',
  })

  return values
}
