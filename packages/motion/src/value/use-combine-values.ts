import { type MotionValue, cancelFrame, frame, motionValue } from 'framer-motion/dom'
import { onUnmounted } from 'vue'

export function useCombineMotionValues<T>(
  combineValues: () => T,
) {
  /**
   * Initialise the returned motion value. This remains the same between renders.
   */
  const value = motionValue(combineValues())

  /**
   * Create a function that will update the template motion value with the latest values.
   * This is pre-bound so whenever a motion value updates it can schedule its
   * execution in Framesync. If it's already been scheduled it won't be fired twice
   * in a single frame.
   */
  const updateValue = () => value.set(combineValues())

  /**
   * Subscribe to all motion values found within the template. Whenever any of them change,
   * schedule an update.
   */
  const scheduleUpdate = () => frame.preRender(updateValue, false, true)
  let subscriptions: VoidFunction[]

  const subscribe = (values: MotionValue[]) => {
    subscriptions = values.map(v => v.on('change', scheduleUpdate))
  }
  const unsubscribe = () => {
    subscriptions.forEach(unsubscribe => unsubscribe())
    cancelFrame(updateValue)
  }

  onUnmounted(() => {
    unsubscribe()
  })
  return {
    subscribe,
    unsubscribe,
    value,
    updateValue,
  }
}
