import { createContext } from '@/utils'

export interface PresenceContext {
  initial?: boolean
  custom?: any
  presenceId?: string
}

export const [injectAnimatePresence, provideAnimatePresence, animatePresenceInjectionKey] = createContext<PresenceContext>('AnimatePresenceContext')
