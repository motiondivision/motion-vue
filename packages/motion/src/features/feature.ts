import type { MotionState } from '@/state/motion-state'
import type { Options } from '@/types'

export class Feature {
  state: MotionState

  constructor(state: MotionState) {
    this.state = state
  }

  beforeMount(): void {}

  mount(): void {}

  unmount(): void {}

  update?(): void {}

  beforeUpdate?(options: Options): void {}

  beforeUnmount?(): void {}
}
