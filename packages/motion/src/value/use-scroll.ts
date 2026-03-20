import { type MaybeRefOrGetter, toValue, watchEffect } from 'vue'
import { motionValue } from 'motion-dom'
import { scroll } from 'framer-motion/dom'
import type { ScrollInfoOptions } from '@/types'
import { isSSR } from '@/utils/is'
import type { MaybeComputedElementRef } from '@vueuse/core'
import { getElement } from '@/components/hooks/use-motion-elm'

export interface UseScrollOptions {
  container?: MaybeComputedElementRef
  target?: MaybeComputedElementRef
  axis?: MaybeRefOrGetter<ScrollInfoOptions['axis']>
  offset?: MaybeRefOrGetter<ScrollInfoOptions['offset']>
}

function createScrollMotionValues() {
  return {
    scrollX: motionValue(0),
    scrollY: motionValue(0),
    scrollXProgress: motionValue(0),
    scrollYProgress: motionValue(0),
  }
}
export function useScroll(scrollOptions: UseScrollOptions = {}) {
  const values = createScrollMotionValues()

  watchEffect((onCleanup) => {
    if (isSSR) {
      return
    }
    const cleanup = scroll(
      (_progress, { x, y }) => {
        values.scrollX.set(x.current)
        values.scrollXProgress.set(x.progress)
        values.scrollY.set(y.current)
        values.scrollYProgress.set(y.progress)
      },
      {
        offset: toValue(scrollOptions.offset),
        axis: toValue(scrollOptions.axis),
        container: getElement(scrollOptions.container),
        target: getElement(scrollOptions.target),
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
