import type { MotionState } from '@/state/motion-state'

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

  /**
   * Managed by MotionState — set after mount(), reset after unmount(),
   * so a MotionState remount (KeepAlive, directive reuse) re-runs mount().
   */
  isMount: boolean = false

  state: MotionState

  constructor(state: MotionState) {
    this.state = state
  }

  mount() {}

  beforeUnmount() {}

  unmount() {}

  update() {}

  getSnapshot() {}
}
