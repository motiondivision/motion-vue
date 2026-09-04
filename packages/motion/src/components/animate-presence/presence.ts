import type { MotionState } from '@/state/motion-state'
import { createContext } from '@/utils'

export interface PresenceContext {
  initial?: boolean
  custom?: any
  /**
   * Registry of motion states under this AnimatePresence — fed by MotionState
   * itself at construction/teardown. inject resolves to the nearest ancestor,
   * so nested AnimatePresence instances scope correctly without DOM tagging.
   */
  register?: (state: MotionState) => void
  unregister?: (state: MotionState) => void
}

export const [injectAnimatePresence, provideAnimatePresence, animatePresenceInjectionKey] = createContext<PresenceContext>('AnimatePresenceContext')
