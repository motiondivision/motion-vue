import { Feature } from '@/features/feature'
import type { MotionState } from '@/state/motion-state'
import { addScaleCorrector } from 'framer-motion/dist/es/projection/styles/scale-correction.mjs'
import { defaultScaleCorrector } from './config'
import { globalProjectionState } from 'framer-motion/dist/es/projection/node/state.mjs'

export class LayoutFeature extends Feature {
  constructor(state: MotionState) {
    super(state)
    addScaleCorrector(defaultScaleCorrector)
  }

  beforeUpdate() {
    this.state.willUpdate('beforeUpdate')
  }

  update(): void {
    this.didUpdate()
  }

  didUpdate() {
    if (this.state.options.layout || this.state.options.layoutId || this.state.options.drag)
      this.state.visualElement.projection?.root?.didUpdate()
  }

  mount() {
    const options = this.state.options
    const layoutGroup = this.state.options.layoutGroup
    if (options.layout || options.layoutId) {
      const projection = this.state.visualElement.projection
      if (projection) {
        projection.promote()
        layoutGroup?.group?.add(projection)
      }
      globalProjectionState.hasEverUpdated = true
    }
    this.didUpdate()
  }

  beforeUnmount(): void {
    const projection = this.state.visualElement.projection
    if (projection) {
      this.state.willUpdate('beforeUnmount')
      if (this.state.options.layoutId) {
        projection.isPresent = false
        projection.relegate()
      }
      else if (this.state.options.layout) {
        this.state.isSafeToRemove = true
      }
    }
  }

  unmount() {
    const layoutGroup = this.state.options.layoutGroup
    const projection = this.state.visualElement.projection

    if (projection) {
      if (layoutGroup?.group) {
        layoutGroup.group.remove(projection)
      }

      // Check lead's animation progress, if it exists, skip update to prevent lead from jumping
      if (projection.getStack()?.lead?.animationProgress) {
        return
      }
      this.didUpdate()
    }
  }
}
