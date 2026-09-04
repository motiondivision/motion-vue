import { Feature } from '@/features/feature'
import type { MotionState } from '@/state/motion-state'
import { type IProjectionNode, addScaleCorrector, globalProjectionState } from 'motion-dom'
import { defaultScaleCorrector } from './config'
import { isHidden } from '@/utils/is-hidden'
import { nextTick } from 'vue'

export class LayoutFeature extends Feature {
  static key = 'layout' as const

  constructor(state: MotionState) {
    super(state)
    addScaleCorrector(defaultScaleCorrector)
  }

  private updatePrevLead(isPresent: boolean) {
    const projection = this.state.visualElement.projection as IProjectionNode
    if (projection.isPresent !== isPresent) {
      projection.isPresent = isPresent
      if (isPresent) {
        !projection.isLead() && projection?.promote()
      }
      else {
        projection.isLead() && projection?.relegate()
      }
    }
  }

  didUpdate() {
    if (this.state.options.layout || this.state.options.layoutId || this.state.options.drag) {
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
        if (isPresent) {
          projection?.promote()
        }
        else {
          projection?.relegate()
        }
      }
      layoutGroup?.group?.add(projection)
      globalProjectionState.hasEverUpdated = true
    }
    this.didUpdate()
  }

  unmount() {
    const layoutGroup = this.state.options.layoutGroup
    const projection = this.state.visualElement.projection

    if (projection) {
      if (layoutGroup?.group && (this.state.options.layout || this.state.options.layoutId)) {
        layoutGroup.group.remove(projection)
      }
    }
  }

  /**
   * Capture a layout snapshot. Options are always refreshed by the caller
   * before this runs (updateOptions → lifecycle hook), so the only remaining
   * signal is presence: an exiting element is treated as not present.
   */
  getSnapshot(isPresent: boolean): void {
    const projection = this.state.visualElement.projection
    const { layout, layoutId, drag, layoutDependency } = this.state.visualElement.props
    const prevProps = this.state.visualElement.prevProps!
    if (!projection || (!layout && !layoutId && !drag)) {
      return
    }

    /**
     * If drag is enabled, no layoutDependency is set, or presence changed,
     * we need to update the snapshot
     */
    if (
      drag
      || prevProps.layoutDependency !== layoutDependency
      || layoutDependency === undefined // ← 没传 layoutDependency 时,每次重渲染都 willUpdate
      || isPresent !== projection.isPresent
    ) {
      projection.willUpdate()
    }

    /**
     * If presence has changed, promote or relegate the projection accordingly
     */
    if (layoutId) {
      this.updatePrevLead(isPresent)
    }

    nextTick(() => {
      this.didUpdate()
    })
  }
}
