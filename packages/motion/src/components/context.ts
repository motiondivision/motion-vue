import type { MotionState } from '@/state/motion-state'
import { createContext } from '@/utils'

export const [injectMotion, provideMotion] = createContext<MotionState>('Motion')
