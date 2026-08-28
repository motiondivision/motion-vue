import type { MotionState } from '@/state/motion-state'
import type { Options } from '@/types'

// Feature 标识符类型
export type FeatureKey =
  | 'animation'
  | 'projection'
  | 'layout'
  | 'hover'
  | 'press'
  | 'focus'
  | 'drag'
  | 'pan'
  | 'inView'

export class Feature {
  static key: FeatureKey

  isMount: boolean

  state: MotionState

  constructor(state: MotionState) {
    this.state = state
  }

  /**
   * Optional protocol hooks, called by MotionState on every registered
   * feature in registration order. Implement them instead of patching
   * methods onto MotionState.
   */
  getSnapshot?(options: Options, isPresent?: boolean): void
  didUpdate?(): void

  mount() {}

  unmount() {}

  update() {}
}
