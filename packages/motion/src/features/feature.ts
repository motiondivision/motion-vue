import type { MotionState } from '@/state/motion-state'

export abstract class Feature {
  state: MotionState

  constructor(state: MotionState) {
    this.state = state
  }

  abstract mount(): void
  abstract unmount(): void

  update(): void {}
}
