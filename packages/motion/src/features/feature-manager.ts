import type { Feature } from '@/features'
import type { MotionState } from '@/state'
import { watch } from 'vue'

export class FeatureManager {
  features: Feature[] = []
  constructor(state: MotionState) {
    const { features = [], lazyMotionContext } = state.options
    const allFeatures = features.concat(lazyMotionContext.features.value)
    this.features = allFeatures.map(Feature => new Feature(state))
    // watch for lazy motion features
    const featureInstances = this.features
    /**
     * Watch for lazy motion features
     * If the feature is not already in the allFeatures array, we need to add it
     * and create a new instance of the feature
     */
    watch(lazyMotionContext.features, (features) => {
      features.forEach((feature) => {
        if (!allFeatures.includes(feature)) {
          allFeatures.push(feature)
          const featureInstance = new (feature as any)(state) as Feature
          featureInstances.push(featureInstance)
          /**
           * If the Component is already mounted, we need to call the beforeMount and mount methods
           */
          if (state.isMounted()) {
            featureInstance.beforeMount()
            featureInstance.mount()
          }
        }
      })
    }, {
      flush: 'pre',
    })
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
