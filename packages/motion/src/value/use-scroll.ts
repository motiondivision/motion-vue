import { watch } from 'vue'
import { motionValue, scroll } from 'framer-motion/dom'
import type { ScrollInfoOptions } from '@/types'
import { isSSR } from '@/utils/is'
import type { MaybeComputedElementRef } from '@vueuse/core'
import { getElement } from '@/components/hooks/use-motion-elm'

export interface UseScrollOptions
  extends Omit<ScrollInfoOptions, 'container' | 'target'> {
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

export function useScroll({
  container,
  target,
  ...options
}: UseScrollOptions = {}) {
  const values = createScrollMotionValues()

  watch(
    [() => getElement(container), () => getElement(target), () => options.offset],
    ([newContainer, newTarget], _, onCleanup) => {
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
          ...options,
          container: newContainer ?? undefined,
          target: newTarget ?? undefined,
        },
      )
      onCleanup(() => {
        cleanup()
      })
    },
    {
      immediate: true,
      flush: 'post',
    },
  )

  return values
}
