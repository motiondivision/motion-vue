import { Feature } from '@/features/feature'
import type { MotionState } from '@/state/motion-state'
import { HTMLProjectionNode } from 'framer-motion/dist/es/projection/node/HTMLProjectionNode.mjs'
import { getClosestProjectingNode } from '@/features/layout/utils'
import { onBeforeUpdate, onUpdated } from 'vue'

export class LayoutFeature extends Feature {
  constructor(state: MotionState) {
    super(state)
  }

  mount() {
    const visualElement = this.state.getVisualElement()
    const options = this.state.getOptions()
    if (options.layout || options.layoutId) {
      // init projection
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
      onBeforeUpdate(() => {
        console.log('will update')
        visualElement.projection?.willUpdate()
      })
      onUpdated(() => {
        console.log('did update')
        visualElement.projection?.didUpdate()
      })
    }
  }

  unmount() {
  }
}
