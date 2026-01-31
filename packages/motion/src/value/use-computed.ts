import { useCombineMotionValues } from '@/value/use-combine-values'
import { type MotionValue, collectMotionValues } from 'motion-dom'
import { watchEffect } from 'vue'

export function useComputed<T>(computed: () => T): MotionValue<T> {
  /**
   * Open session of collectMotionValues. Any MotionValue that calls get()
   * will be saved into this array.
   */
  collectMotionValues.current = []

  const { value, subscribe, unsubscribe, updateValue } = useCombineMotionValues<T>(computed)

  subscribe(collectMotionValues.current)

  collectMotionValues.current = undefined

  watchEffect(() => {
    unsubscribe()
    collectMotionValues.current = []
    updateValue()
    subscribe(collectMotionValues.current)
    collectMotionValues.current = undefined
  })

  return value
}
