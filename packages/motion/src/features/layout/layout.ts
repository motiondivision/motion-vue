import { Feature } from '@/features/feature'
import type { MotionState } from '@/state/motion-state'
import { HTMLProjectionNode } from 'framer-motion/dist/es/projection/node/HTMLProjectionNode.mjs'
import { getClosestProjectingNode } from '@/features/layout/utils'
import { onBeforeUpdate, onUpdated } from 'vue'
import { addScaleCorrector } from 'framer-motion/dist/es/projection/styles/scale-correction.mjs'
import { defaultScaleCorrector } from './config'
import { globalProjectionState } from 'framer-motion/dist/es/projection/node/state.mjs'

export class LayoutFeature extends Feature {
  constructor(state: MotionState) {
    super(state)
    const visualElement = this.state.visualElement
    const options = this.state.getOptions()
    if (options.layout || options.layoutId) {
      addScaleCorrector(defaultScaleCorrector)
      // init projection
      console.log('visualElement.parent', visualElement.parent, getClosestProjectingNode(visualElement.parent))
      // @ts-ignore
      visualElement.projection = new HTMLProjectionNode<HTMLElement>(
        visualElement.latestValues,
        options['data-framer-portal-id']
          ? undefined
          : getClosestProjectingNode(visualElement.parent),
      )
      visualElement.projection.setOptions({
        layout: options.layout,
        layoutId: options.layoutId,
        // TODO: drag
        alwaysMeasureLayout: false,
        visualElement,
        animationType: typeof options.layout === 'string' ? options.layout : 'both',
        // initialPromotionConfig
        layoutRoot: options.layoutRoot,
        layoutScroll: options.layoutScroll,
      })

      globalProjectionState.hasEverUpdated = true
      onBeforeUpdate(() => {
        console.log('updated layout', visualElement.projection.parent)
        visualElement.projection?.willUpdate()
      })
      onUpdated(() => {
        visualElement.projection.root.didUpdate()
      })
    }
  }

  mount() {
    this.state.visualElement.projection.mount(this.state.getElement())
    this.state.visualElement.projection.root.didUpdate()
  }

  unmount() {
    this.state.visualElement.projection?.unmount()
  }
}
