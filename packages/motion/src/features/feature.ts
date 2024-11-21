import type { MotionState } from '@/state/motion-state'
import {
  // DragGesture,
  EventFeature,
  HoverGesture,
  InViewGesture,
  PressGesture,
} from './'

export abstract class Feature {
  state: MotionState

  constructor(state: MotionState) {
    this.state = state
  }

  abstract mount(): void
  abstract unmount(): void

  update(): void {}
}

export class FeatureManager {
  features: Feature[] = []

  constructor(state: MotionState) {
    this.features = [
      new HoverGesture(state),
      new PressGesture(state),
      new InViewGesture(state),
      // new DragGesture(state),
      new EventFeature(state),
    ]
  }

  mount() {
    this.features.forEach(feature => feature.mount())
  }

  unmount() {
    this.features.forEach(feature => feature.unmount())
  }

  update() {
    this.features.forEach(feature => feature.update())
  }
}
