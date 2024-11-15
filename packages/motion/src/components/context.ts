import type { MotionState } from '@/state/motion-state'
import { createContext } from '@/utils'
import type { Ref } from 'vue'

export const [injectMotion, provideMotion] = createContext<MotionState>('Motion')

export interface PresenceContext {
  initial: Ref<boolean>
}
export const [injectAnimatePresence, provideAnimatePresence] = createContext<PresenceContext>('AnimatePresenceContext')
