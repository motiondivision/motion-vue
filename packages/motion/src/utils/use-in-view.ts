import type { Ref } from 'vue'
import { isRef, ref, unref, watch } from 'vue'
import type { Options } from '@/types/state'
import { inView } from 'framer-motion/dom'

export function useInView<T extends Element = any>(
  domRef: Ref<T | null>,
  options?: Options['inViewOptions'] | Ref<Options['inViewOptions']>,
) {
  const isInView = ref(false)

  watch([domRef, () => isRef(options) ? options.value : options], (_v1, _v2, onCleanup) => {
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
    immediate: true,
  })

  return isInView
}
