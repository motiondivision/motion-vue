import { Feature } from '@/features/feature'
import type { MotionState } from '@/state/motion-state'
import { HTMLProjectionNode } from 'framer-motion/dist/es/projection/node/HTMLProjectionNode.mjs'
import { getClosestProjectingNode } from '@/features/layout/utils'
import { addScaleCorrector } from 'framer-motion/dist/es/projection/styles/scale-correction.mjs'
import { defaultScaleCorrector } from './config'
import { globalProjectionState } from 'framer-motion/dist/es/projection/node/state.mjs'
import type { LayoutGroupState } from '@/components/context'
import { injectLayoutGroup } from '@/components/context'

export class LayoutFeature extends Feature {
  layoutGroup: LayoutGroupState
  constructor(state: MotionState) {
    super(state)
  }

  private initProjection() {
    if (!(this.state.options.layout || this.state.options.layoutId)) {
      this.state.visualElement.projection = null
      return
    }
    if (this.state.visualElement.projection) {
      return
    }
    addScaleCorrector(defaultScaleCorrector)
    this.layoutGroup = injectLayoutGroup({} as any)
    const options = this.state.options
    // @ts-ignore
    this.state.visualElement.projection = new HTMLProjectionNode<HTMLElement>(
      this.state.visualElement.latestValues,
      options['data-framer-portal-id']
        ? undefined
        : getClosestProjectingNode(this.state.visualElement.parent),
    )
    this.state.visualElement.projection.setOptions({
      layout: options.layout,
      layoutId: options.layoutId,
      // TODO: drag
      alwaysMeasureLayout: false,
      visualElement: this.state.visualElement,
      animationType: typeof options.layout === 'string' ? options.layout : 'both',
      // initialPromotionConfig
      layoutRoot: options.layoutRoot,
      layoutScroll: options.layoutScroll,
    })
  }

  beforeUpdate() {
    this.state.visualElement.projection?.willUpdate()
  }

  update(): void {
    this.initProjection()
    this.state.visualElement.projection?.setOptions(this.state.options as any)
    this.state.visualElement.projection?.root.didUpdate()
  }

  beforeMount() {
    this.initProjection()
  }

  mount() {
    const options = this.state.options
    if (options.layout || options.layoutId) {
      const projection = this.state.visualElement.projection

      if (projection) {
        this.layoutGroup?.group?.add(projection)
      }

      globalProjectionState.hasEverUpdated = true

      projection?.mount(this.state.element)
      projection?.root.didUpdate()
    }
  }

  beforeUnmount(): void {
    if (this.state.visualElement.projection) {
      this.state.visualElement.projection.willUpdate()
    }
  }

  unmount() {
    if (this.state.visualElement.projection) {
      this.state.visualElement.projection.unmount()
      if (this.layoutGroup?.group)
        this.layoutGroup.group.remove(this.state.visualElement.projection)
    }
  }
}
