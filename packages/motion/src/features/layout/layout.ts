import { Feature } from '@/features/feature'
import type { MotionState } from '@/state/motion-state'
import { addScaleCorrector, globalProjectionState } from 'motion-dom'
import { defaultScaleCorrector } from './config'
import { isDef } from '@vueuse/core'
import type { Options } from '@/types'

let hasLayoutUpdate = false
export class LayoutFeature extends Feature {
  static key = 'layout' as const

  constructor(state: MotionState) {
    super(state)
    addScaleCorrector(defaultScaleCorrector)
    state.getSnapshot = this.getSnapshot.bind(this)
    state.didUpdate = this.didUpdate.bind(this)
  }

  beforeUpdate(newOptions: Options) {
    this.getSnapshot(newOptions, undefined)
  }

  update(): void {
    this.didUpdate()
  }

  didUpdate() {
    if (!hasLayoutUpdate)
      return
    if (this.state.options.layout || this.state.options.layoutId || this.state.options.drag) {
      hasLayoutUpdate = false
      this.state.visualElement.projection?.root?.didUpdate()
    }
  }

  mount() {
    const options = this.state.options
    const layoutGroup = this.state.options.layoutGroup
    if (options.layout || options.layoutId) {
      const projection = this.state.visualElement.projection
      if (projection) {
        projection.promote()
        const stack = projection.getStack()
        /**
         * when has prev lead and prev lead has not been updated, we need to update the prev lead
         */
        if (stack?.prevLead && !stack.prevLead.snapshot) {
          stack.prevLead.willUpdate()
          hasLayoutUpdate = true
        }
        layoutGroup?.group?.add(projection)
      }
      globalProjectionState.hasEverUpdated = true
    }
    this.didUpdate()
  }

  beforeUnmount(): void {
    this.getSnapshot(this.state.options, false)
  }

  unmount() {
    const layoutGroup = this.state.options.layoutGroup
    const projection = this.state.visualElement.projection

    if (projection) {
      if (layoutGroup?.group && (this.state.options.layout || this.state.options.layoutId)) {
        layoutGroup.group.remove(projection)
      }
      // when layoutId is set, unMount will update the layout
      if (this.state.options.layoutId) {
        hasLayoutUpdate = true
      }
      this.didUpdate()
    }
  }

  getSnapshot(newOptions: Options, isPresent?: boolean): void {
    const projection = this.state.visualElement.projection
    const { drag, layoutDependency, layout, layoutId } = newOptions
    if (!projection || (!layout && !layoutId && !drag)) {
      return
    }
    hasLayoutUpdate = true
    const prevProps = this.state.options

    /**
     * If the drag or layoutDependency has changed, or the isPresent has changed, we need to update the snapshot
     */
    if (
      drag
      || prevProps.layoutDependency !== layoutDependency
      || layoutDependency === undefined
      || (isDef(isPresent) && projection.isPresent !== isPresent)
    ) {
      projection.willUpdate()
    }

    /**
     * If the isPresent has changed, we need to update the projection
     * and promote or relegate the projection accordingly
     */
    if (isDef(isPresent) && isPresent !== projection.isPresent) {
      projection.isPresent = isPresent
      if (isPresent) {
        projection.promote()
      }
      else {
        projection.relegate()
      }
    }
  }
}
