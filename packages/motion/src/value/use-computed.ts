import { useCombineMotionValues } from '@/value/use-combine-values'
import type { MotionValue } from 'framer-motion/dom'
import { collectMotionValues } from 'motion-dom'
import { onBeforeUpdate } from 'vue'

export function useComputed<T>(computed: () => T): MotionValue<T> {
  /**
   * Open session of collectMotionValues. Any MotionValue that calls get()
   * will be saved into this array.
   */
  collectMotionValues.current = []

  const { value, subscribe, unsubscribe } = useCombineMotionValues<T>(computed)

  subscribe(collectMotionValues.current)

  collectMotionValues.current = undefined

  onBeforeUpdate(() => {
    unsubscribe()
    collectMotionValues.current = []
    computed()
    subscribe(collectMotionValues.current)
    collectMotionValues.current = undefined
  })

  return value
}
