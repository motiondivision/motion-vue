import type { Feature } from '@/features'
import type { MotionState } from '@/state'

export const features: Feature[] = []
export class FeatureManager {
  features: Feature[] = []
  constructor(state: MotionState) {
    this.features = features.map((Feature: any) => new Feature(state))
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
