import type { VisualElement } from 'motion-dom'

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

export abstract class Feature {
  static key: FeatureKey

  isMount: boolean

  node: VisualElement

  constructor(node: VisualElement) {
    this.node = node
  }

  abstract mount(): void

  abstract unmount(): void

  update: () => {}
}
