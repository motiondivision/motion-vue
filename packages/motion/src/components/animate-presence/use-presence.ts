import type { ComputedRef, Ref } from 'vue'
import { computed, onMounted, onUnmounted, readonly, ref } from 'vue'
import type { PresenceContext } from './presence'
import { createPresenceId, injectAnimatePresence } from './presence'

export type SafeToRemove = () => void

/**
 * When a component is the child of `AnimatePresence`, it can use `usePresence`
 * to access information about whether it's still present in the tree.
 *
 * ```ts
 * import { usePresence } from 'motion-v'
 *
 * const [isPresent, safeToRemove] = usePresence()
 *
 * watch(isPresent, (present) => {
 *   if (!present && safeToRemove)
 *     setTimeout(safeToRemove, 1000)
 * })
 * ```
 *
 * If `isPresent` is `false`, it means that a component has been removed from
 * the tree, but `AnimatePresence` won't really remove it until `safeToRemove`
 * has been called.
 *
 * Outside an `AnimatePresence`, returns `[ref(true), null]` (always present).
 *
 * @param subscribe - When `false`, does not register as an exit waiter
 *   (mirrors React's `usePresence(false)`).
 * @public
 */
export function usePresence(
  subscribe: boolean = true,
): [Readonly<Ref<boolean>>, SafeToRemove | null] {
  const context = injectAnimatePresence(null)

  if (context === null)
    return [readonly(ref(true)), null]

  const id = createPresenceId()
  let unregister: (() => void) | undefined

  onMounted(() => {
    if (subscribe)
      unregister = context.register?.(id)
  })
  onUnmounted(() => {
    unregister?.()
    unregister = undefined
  })

  const isPresent = computed(() => isPresentContext(context))

  const safeToRemove: SafeToRemove = () => {
    if (subscribe)
      context.onExitComplete?.(id)
  }

  // Inside AnimatePresence always expose safeToRemove (React only returns it
  // while exiting; Vue needs a stable function because the tuple is not
  // recreated on each render).
  return [isPresent, context.onExitComplete ? safeToRemove : null]
}

/**
 * Similar to `usePresence`, except `useIsPresent` simply returns whether or
 * not the component is present. There is no `safeToRemove` function.
 *
 * @public
 */
export function useIsPresent(): ComputedRef<boolean> {
  const context = injectAnimatePresence(null)
  return computed(() => isPresentContext(context))
}

export function isPresentContext(context: PresenceContext | null): boolean {
  return context === null ? true : !!context.isPresent
}
