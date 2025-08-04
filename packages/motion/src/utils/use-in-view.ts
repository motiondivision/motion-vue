import { ref, unref, watchEffect } from 'vue'
import type { Options } from '@/types/state'
import { inView } from 'framer-motion/dom'
import { type MaybeComputedElementRef, type MaybeRef, unrefElement } from '@vueuse/core'

type InViewOptions = Options['inViewOptions']
export interface UseInViewOptions extends Omit<InViewOptions, 'root'> {
  root?: MaybeRef<Element | Document>
}

export function useInView(
  domRef: MaybeComputedElementRef,
  options?: MaybeRef<UseInViewOptions>,
) {
  const isInView = ref(false)

  watchEffect((onCleanup) => {
    const realOptions = (unref(options) || {}) as UseInViewOptions
    const { once } = realOptions
    const el = unrefElement(domRef)
    if (!el || (once && isInView.value)) {
      return
    }
    const onEnter = () => {
      isInView.value = true
      return once
        ? undefined
        : () => {
            isInView.value = false
          }
    }
    const cleanup = inView(el, onEnter, {
      ...realOptions,
      root: unref(realOptions.root) as Element | Document,
    })
    onCleanup(() => {
      cleanup()
    })
  }, {
    flush: 'post',
  })

  return isInView
}
