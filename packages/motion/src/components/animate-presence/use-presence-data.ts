import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import { injectAnimatePresence } from './presence'

/**
 * Returns the `custom` data passed to the nearest `AnimatePresence`, or
 * `undefined` when used outside one.
 *
 * @public
 */
export function usePresenceData(): ComputedRef<any> {
  const context = injectAnimatePresence(null)
  return computed(() => (context === null ? undefined : context.custom))
}
