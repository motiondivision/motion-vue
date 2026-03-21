import { type MaybeRefOrGetter, toValue, watchEffect } from 'vue'
import { motionValue } from 'motion-dom'
import { scroll } from 'framer-motion/dom'
import type { ScrollInfoOptions } from '@/types'
import { isSSR } from '@/utils/is'
import type { MaybeComputedElementRef } from '@vueuse/core'
import { getElement } from '@/components/hooks/use-motion-elm'

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

export function useScroll(options: MaybeRefOrGetter<UseScrollOptions> = {}) {
  const values = createScrollMotionValues()

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
