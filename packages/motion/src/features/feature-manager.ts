import { EventFeature, type Feature, HoverGesture, InViewGesture, PressGesture, SVGFeature } from '@/features'
import type { MotionState } from '@/state'

export class FeatureManager {
  features: Feature[] = []

  constructor(state: MotionState) {
    this.features = [
      new HoverGesture(state),
      new PressGesture(state),
      new InViewGesture(state),
      new SVGFeature(state),
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
