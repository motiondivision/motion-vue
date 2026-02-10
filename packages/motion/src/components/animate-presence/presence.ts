import type { MotionState } from '@/state'
import { createContext } from '@/utils'

export interface PresenceContext {
  initial?: boolean
  custom?: any
  presenceId?: string
  // Notify when a motion component's exit animation is complete
  onMotionExitComplete?: (container: Element, state: MotionState) => void
}

export const [injectAnimatePresence, provideAnimatePresence] = createContext<PresenceContext>('AnimatePresenceContext')
