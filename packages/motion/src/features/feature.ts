import type { MotionState } from '@/state/motion-state'

export class Feature {
  state: MotionState

  constructor(state: MotionState) {
    this.state = state
  }

  beforeMount(): void {}

  mount(): void {}

  unmount(): void {}

  update?(): void {}

  beforeUpdate?(): void {}

  beforeUnmount?(): void {}
}
