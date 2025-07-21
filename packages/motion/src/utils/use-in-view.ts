import type { Ref } from 'vue'
import { ref, unref, watchEffect } from 'vue'
import type { Options } from '@/types/state'
import { inView } from 'framer-motion/dom'
import type { MaybeRef } from '@vueuse/core'

export function useInView<T extends Element = any>(
  domRef: Ref<T | null>,
  options?: MaybeRef<Options['inViewOptions']>,
) {
  const isInView = ref(false)

  watchEffect((onCleanup) => {
    const realOptions = unref(options) || {}
    const { once } = realOptions
    if (!domRef.value || (once && isInView.value)) {
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
    const cleanup = inView(domRef.value, onEnter, realOptions)
    onCleanup(() => {
      cleanup()
    })
  }, {
    flush: 'post',
  })

  return isInView
}
