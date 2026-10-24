import { createContext } from '@/utils'
import type { MotionState } from '@/state'

/**
 * Per-child presence context provided by `PresenceChild`.
 *
 * Aligns with React framer-motion's `PresenceContextProps`. `isPresent` is the
 * only exit signal: `v-if` flips it through the render set, and `v-show` /
 * KeepAlive raise it too even though nothing unmounts. Every consumer —
 * motion elements, `usePresence`, layout — watches that one flag.
 */
export interface PresenceContext {
  id?: string
  initial?: boolean
  custom?: any
  /** Whether this child is still present in the AnimatePresence render set. */
  isPresent?: boolean
  /**
   * Register a presence subscriber (React `usePresence` / motion exit ids).
   * Returns an unregister function. Motion elements pass their MotionState,
   * which PresenceChild collects into a set shared across every child of the
   * AnimatePresence — a popLayout exit snapshots all of them before the pop
   * style reflows the tree.
   */
  register?: (id: string | number, state?: MotionState) => () => void
  /** Mark a registered subscriber's exit as complete. */
  onExitComplete?: (id: string | number) => void
}

export const [injectAnimatePresence, provideAnimatePresence, animatePresenceInjectionKey] = createContext<PresenceContext>('AnimatePresenceContext')

let nextPresenceId = 0

/**
 * Ids are unique across both registration paths (`usePresence` and
 * `ExitFeature`) because they share one presence map.
 */
export function createPresenceId(): number {
  return ++nextPresenceId
}
