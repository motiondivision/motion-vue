import { Feature } from '@/features/feature'
import { HTMLProjectionNode } from 'framer-motion/dist/es/projection/node/HTMLProjectionNode.mjs'
import { getClosestProjectingNode } from '@/features/layout/utils'
import { addScaleCorrector } from 'framer-motion/dist/es/projection/styles/scale-correction.mjs'
import { defaultScaleCorrector } from '@/features/layout/config'
import { doneCallbacks } from '@/components/presence'

export class ProjectionFeature extends Feature {
  constructor(state) {
    super(state)
    addScaleCorrector(defaultScaleCorrector)
  }

  initProjection() {
    const options = this.state.options
    // @ts-ignore
    this.state.visualElement.projection = new HTMLProjectionNode<HTMLElement>(
      this.state.visualElement.latestValues,
      options['data-framer-portal-id']
        ? undefined
        : getClosestProjectingNode(this.state.visualElement.parent),
    )
    this.state.visualElement.projection.isPresent = true
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
      crossfade: options.crossfade,
      onExitComplete: () => {
        if (!this.state.visualElement.projection?.isPresent) {
          const done = doneCallbacks.get(this.state.element)
          this.state.isSafeToRemove = true
          if (done) {
            done({
              detail: {
                isExit: true,
              },
            }, true)
          }
        }
      },
    })
  }

  beforeMount() {
    this.initProjection()
  }

  update() {
    const options = this.state.options
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
      crossfade: options.crossfade,
    })
  }

  mount() {
    this.state.visualElement.projection?.mount(this.state.element)
  }
}
