import type { $Transition, Options } from '@/types'

/**
 * Core animation update function that handles all animation state changes and execution
 * @param controlActiveState - Animation states that need to be updated
 * @param controlDelay - Animation delay time
 * @param directAnimate - Direct animation target value
 * @param directTransition - Direct animation transition config
 */
export interface AnimateUpdatesOptions {
  controlActiveState?: Partial<Record<string, boolean>>
  controlDelay?: number
  directAnimate?: Options['animate']
  directTransition?: $Transition
  isFallback?: boolean
  isExit?: boolean
}

export type AnimateUpdates = (options?: AnimateUpdatesOptions) => Promise<any> | (() => Promise<any>)
