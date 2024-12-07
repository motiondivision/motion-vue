import { Feature } from '@/features/feature'
import type { MotionState } from '@/state/motion-state'
import { HTMLProjectionNode } from 'framer-motion/dist/es/projection/node/HTMLProjectionNode.mjs'
import { getClosestProjectingNode } from '@/features/layout/utils'
import { onBeforeMount, onBeforeUnmount, onBeforeUpdate, onUpdated } from 'vue'
import { addScaleCorrector } from 'framer-motion/dist/es/projection/styles/scale-correction.mjs'
import { defaultScaleCorrector } from './config'
import { globalProjectionState } from 'framer-motion/dist/es/projection/node/state.mjs'

export class LayoutFeature extends Feature {
  constructor(state: MotionState) {
    super(state)
    const options = this.state.getOptions()
    const visualElement = this.state.visualElement
    if (options.layout || options.layoutId) {
      addScaleCorrector(defaultScaleCorrector)
      // init projection
      onBeforeMount(() => {
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
      })
      onBeforeUpdate(() => {
        visualElement.projection?.willUpdate()
      })
      onUpdated(() => {
        visualElement.projection?.root.didUpdate()
      })
    }
  }

  update(): void {
    this.state.visualElement.projection?.setOptions(this.state.getOptions() as any)
  }

  mount() {
    const visualElement = this.state.visualElement
    const options = this.state.getOptions()
    if (options.layout || options.layoutId) {
      globalProjectionState.hasEverUpdated = true
      onBeforeUpdate(() => {
        visualElement.projection?.willUpdate()
      })
      onUpdated(() => {
        visualElement.projection.root.didUpdate()
      })
      onBeforeUnmount(() => {
        visualElement.projection?.unmount()
      })
    }
    this.state.visualElement.projection?.mount(this.state.getElement())
    this.state.visualElement.projection?.root.didUpdate()
  }

  unmount() {
    // this.state.visualElement.projection?.unmount()
  }
}
