import { unref, watchEffect } from 'vue'
import { motionValue, scroll } from 'framer-motion/dom'
import type { ScrollInfoOptions } from '@/types'
import { isSSR } from '@/utils/is'
import type { MaybeComputedElementRef, MaybeRef } from '@vueuse/core'
import { getElement } from '@/components/hooks/use-motion-elm'
import type { ToRefs } from '@/types/common'

export interface UseScrollOptions extends Omit<ToRefs<ScrollInfoOptions>, 'container' | 'target'> {
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
export function useScroll(scrollOptions: MaybeRef<UseScrollOptions> = {}) {
  const values = createScrollMotionValues()

  watchEffect((onCleanup) => {
    if (isSSR) {
      return
    }
    const options = unref(scrollOptions)
    const cleanup = scroll(
      (_progress, { x, y }) => {
        values.scrollX.set(x.current)
        values.scrollXProgress.set(x.progress)
        values.scrollY.set(y.current)
        values.scrollYProgress.set(y.progress)
      },
      {
        offset: unref(options.offset),
        axis: unref(options.axis),
        container: getElement(options.container),
        target: getElement(options.target),
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
