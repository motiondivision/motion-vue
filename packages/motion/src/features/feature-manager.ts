import { AnimationFeature, DragGesture, type Feature, HoverGesture, InViewGesture, LayoutFeature, PanGesture, PressGesture, SVGFeature } from '@/features'
import type { MotionState } from '@/state'
import { ProjectionFeature } from './layout/projection'
import { FocusGesture } from '@/features/gestures/focus'

export class FeatureManager {
  features: Feature[] = []

  constructor(state: MotionState) {
    this.features = [
      new HoverGesture(state),
      new PressGesture(state),
      new InViewGesture(state),
      new SVGFeature(state),
      new LayoutFeature(state),
      new ProjectionFeature(state),
      new PanGesture(state),
      new DragGesture(state),
      new FocusGesture(state),
      new AnimationFeature(state),
    ]
  }

  mount() {
    this.features.forEach(feature => feature.mount())
  }

  beforeMount() {
    this.features.forEach(feature => feature.beforeMount?.())
  }

  unmount() {
    this.features.forEach(feature => feature.unmount())
  }

  update() {
    this.features.forEach(feature => feature.update?.())
  }

  beforeUpdate() {
    this.features.forEach(feature => feature.beforeUpdate())
  }

  beforeUnmount() {
    this.features.forEach(feature => feature.beforeUnmount())
  }
}
