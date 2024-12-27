import { Feature } from '@/features/feature'
import type { MotionState } from '@/state/motion-state'
import { addScaleCorrector } from 'framer-motion/dist/es/projection/styles/scale-correction.mjs'
import { defaultScaleCorrector } from './config'
import { globalProjectionState } from 'framer-motion/dist/es/projection/node/state.mjs'
import { frame } from 'framer-motion/dom'

export class LayoutFeature extends Feature {
  constructor(state: MotionState) {
    super(state)
    addScaleCorrector(defaultScaleCorrector)
  }

  beforeUpdate() {
    this.state.willUpdate('beforeUpdate')
    // const present = isPresent(this.state.visualElement)
    // const projection = this.state.visualElement.projection
    // const prePresent = projection?.isPresent
    // if (prePresent !== present) {
    //   if (present) {
    //     projection?.promote()
    //   }
    // }
  }

  update(): void {
    this.state.visualElement.projection?.root.didUpdate()
  }

  beforeMount() {
  }

  mount() {
    const options = this.state.options
    const layoutGroup = this.state.options.layoutGroup
    if (options.layout || options.layoutId) {
      const projection = this.state.visualElement.projection

      if (projection) {
        layoutGroup?.group?.add(projection)
      }
      globalProjectionState.hasEverUpdated = true
      projection?.root.didUpdate()
    }
  }

  beforeUnmount(): void {
    const projection = this.state.visualElement.projection
    if (projection) {
      this.state.willUpdate('beforeUnmount')
      if (this.state.options.layoutId) {
        projection.isPresent = false
        projection.relegate()
      }
      const layoutGroup = this.state.options.layoutGroup
      if (layoutGroup?.group)
        layoutGroup.group.remove(projection)
    }
  }

  unmount() {

  }
}
