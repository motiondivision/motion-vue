import type { MotionState } from '@/state'
import { createContext } from '@/utils'

// Attribute used to mark AnimatePresence direct children
export const PRESENCE_CHILD_ATTR = 'data-ap-child'

export interface PresenceContext {
  initial?: boolean
  custom?: any
  // Register a motion component to a container
  register?: (container: Element, state: MotionState) => void
  // Unregister a motion component from a container
  unregister?: (container: Element, state: MotionState) => void
  // Notify when a motion component's exit animation is complete
  onMotionExitComplete?: (container: Element, state: MotionState) => void
  // Register a motion component to pending list (for SSR hydration scenario)
  registerPending?: (state: MotionState) => void
  // Unregister a motion component from pending list
  unregisterPending?: (state: MotionState) => void
}

export const [injectAnimatePresence, provideAnimatePresence] = createContext<PresenceContext>('AnimatePresenceContext')
