import { Feature } from '@/features/feature'
import type { MotionState } from '@/state/motion-state'
import { addScaleCorrector, frame, globalProjectionState } from 'motion-dom'
import { defaultScaleCorrector } from './config'
import { isDef } from '@vueuse/core'
import type { Options } from '@/types'
import { isHidden } from '@/utils/is-hidden'

let hasLayoutUpdate = false
export class LayoutFeature extends Feature {
  static key = 'layout' as const
  private hasMountSettled = false

  constructor(state: MotionState) {
    super(state)
    addScaleCorrector(defaultScaleCorrector)
    state.getSnapshot = this.getSnapshot.bind(this)
    state.didUpdate = this.didUpdate.bind(this)
  }

  private updatePrevLead(projection: NonNullable<typeof this.state.visualElement.projection>) {
    const stack = projection.getStack()
    if (stack?.prevLead && !stack.prevLead.snapshot) {
      stack.prevLead.willUpdate()
      hasLayoutUpdate = true
    }
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
      if (options.layoutId) {
        const isPresent = !isHidden(this.state.element as HTMLElement)
        projection.isPresent = isPresent
        isPresent ? projection.promote() : projection.relegate()
        this.updatePrevLead(projection)
      }
      layoutGroup?.group?.add(projection)
      globalProjectionState.hasEverUpdated = true
    }
    this.didUpdate()

    /**
     * Allow one render frame for the projection tree and ancestor animations
     * to settle before accepting layout snapshots. Vue mounts children before
     * parents, so at this point the projection tree may lack the correct parent
     * link, and ancestor elements may be mid-animation (e.g. scale/position),
     * which would cause incorrect bounding rect measurements and spurious
     * layout deltas.
     */
    frame.postRender(() => {
      this.hasMountSettled = true
    })
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

    /**
     * Skip snapshot capture until the mount has settled.
     */
    if (!this.hasMountSettled) {
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
        this.updatePrevLead(projection)
      }
      else {
        projection.relegate()
      }
    }
  }
}
