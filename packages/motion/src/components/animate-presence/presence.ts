import type { MotionState } from '@/state/motion-state'
import { createContext } from '@/utils'

export interface PresenceContext {
  initial?: boolean
  custom?: any
  /**
   * Registry of motion states under this AnimatePresence — fed by
   * ExitFeature at mount/unmount. inject resolves to the nearest ancestor,
   * so nested AnimatePresence instances scope correctly without DOM tagging.
   */
  register?: (state: MotionState) => void
  unregister?: (state: MotionState) => void
  /** Registry of `usePresence()` handlers under this AnimatePresence. */
  registerHandler?: (handler: PresenceHandler) => void
  unregisterHandler?: (handler: PresenceHandler) => void
}

/**
 * A component's own exit, for components that animate out without a
 * `motion` element's `exit` (see `usePresence`).
 */
export interface PresenceHandler {
  /** The element whose removal waits for `onExit`. */
  element: () => Element | null | undefined
  /** Starts the exit. Removal waits for the returned promise. */
  onExit: () => Promise<unknown> | void
  /** The element came back while its exit was running. */
  onEnter?: () => void
}

export const [injectAnimatePresence, provideAnimatePresence, animatePresenceInjectionKey] = createContext<PresenceContext>('AnimatePresenceContext')
