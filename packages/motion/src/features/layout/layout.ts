import { Feature } from '@/features/feature'
import type { MotionState } from '@/state/motion-state'
import { HTMLProjectionNode } from 'framer-motion/dist/es/projection/node/HTMLProjectionNode.mjs'
import { getClosestProjectingNode } from '@/features/layout/utils'
import { onBeforeMount, onBeforeUnmount, onBeforeUpdate, onUpdated } from 'vue'
import { addScaleCorrector } from 'framer-motion/dist/es/projection/styles/scale-correction.mjs'
import { defaultScaleCorrector } from './config'
import { globalProjectionState } from 'framer-motion/dist/es/projection/node/state.mjs'
import type { LayoutGroupState } from '@/components/context'
import { injectLayoutGroup } from '@/components/context'

export class LayoutFeature extends Feature {
  layoutGroup: LayoutGroupState
  constructor(state: MotionState) {
    super(state)
    const options = this.state.getOptions()
    const visualElement = this.state.visualElement
    if (options.layout || options.layoutId) {
      addScaleCorrector(defaultScaleCorrector)
      this.layoutGroup = injectLayoutGroup({} as any)
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
      onBeforeUnmount(() => {
        if (visualElement.projection) {
          visualElement.projection.willUpdate()
        }
      })
    }
  }

  update(): void {
    this.state.visualElement.projection?.setOptions(this.state.getOptions() as any)
  }

  mount() {
    const options = this.state.getOptions()
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

  unmount() {
    if (this.state.visualElement.projection) {
      this.state.visualElement.projection.unmount()
      if (this.layoutGroup?.group)
        this.layoutGroup.group.remove(this.state.visualElement.projection)
    }
  }
}
