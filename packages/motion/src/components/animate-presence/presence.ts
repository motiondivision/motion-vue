import type { MotionState } from '@/state/motion-state'
import { createContext } from '@/utils'

/**
 * Per-child presence context provided by `PresenceChild`.
 *
 * Aligns with React framer-motion's `PresenceContextProps` for the React-shaped
 * hooks (`usePresence` / `useIsPresent` / `usePresenceData`), while keeping a
 * Vue-specific motion-state registry so `ExitFeature` can drive exits.
 */
export interface PresenceContext {
  id?: string
  initial?: boolean
  custom?: any
  /** Whether this child is still present in the AnimatePresence render set. */
  isPresent?: boolean
  /**
   * Register a presence subscriber (React `usePresence` / motion exit ids).
   * Returns an unregister function.
   */
  register?: (id: string | number) => () => void
  /** Mark a registered subscriber's exit as complete. */
  onExitComplete?: (id: string | number) => void
  /**
   * Registry of motion states under this PresenceChild — fed by ExitFeature
   * at mount/unmount. inject resolves to the nearest ancestor, so nested
   * AnimatePresence instances scope correctly without DOM tagging.
   */
  registerMotion?: (state: MotionState) => void
  unregisterMotion?: (state: MotionState) => void
}

export const [injectAnimatePresence, provideAnimatePresence, animatePresenceInjectionKey] = createContext<PresenceContext>('AnimatePresenceContext')
