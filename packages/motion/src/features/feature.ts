import type { MotionState } from '@/state/motion-state'

export abstract class Feature {
  state: MotionState

  constructor(state: MotionState) {
    this.state = state
  }

  beforeMount(): void {
    // noop
  }

  mount(): void {
    // noop
  }

  unmount(): void {
    // noop
  }

  update?(): void {
    // noop
  }

  beforeUpdate?(): void {
    // noop
  }

  beforeUnmount?(): void {
    // noop
  }
}
