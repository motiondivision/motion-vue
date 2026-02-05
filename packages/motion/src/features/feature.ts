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

// Feature 构造函数类型
export interface FeatureClass {
  key: FeatureKey
  new (state: MotionState): Feature
}

export class Feature {
  // 每个子类必须声明自己的 key
  static key: FeatureKey

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
