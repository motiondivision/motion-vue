import { Feature } from '@/features/feature'
import { HTMLProjectionNode } from 'framer-motion/dist/es/projection/node/HTMLProjectionNode.mjs'
import { getClosestProjectingNode } from '@/features/layout/utils'
import { addScaleCorrector } from 'framer-motion/dist/es/projection/styles/scale-correction.mjs'
import { defaultScaleCorrector } from '@/features/layout/config'
import { isHTMLElement } from '@/features/gestures/drag/utils/is'

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
    this.setOptions()
  }

  beforeMount() {
    this.initProjection()
  }

  setOptions() {
    const options = this.state.options
    const { layoutId, layout, drag = false, dragConstraints = false } = options
    this.state.visualElement.projection.setOptions({
      layout,
      layoutId,
      alwaysMeasureLayout: Boolean(layoutId) || Boolean(drag) || (dragConstraints && isHTMLElement(dragConstraints)),
      visualElement: this.state.visualElement,
      animationType: typeof options.layout === 'string' ? options.layout : 'both',
      // initialPromotionConfig
      layoutRoot: options.layoutRoot,
      layoutScroll: options.layoutScroll,
      crossfade: options.crossfade,
      onExitComplete: () => {
        if (!this.state.visualElement.projection?.isPresent && this.state.options.layoutId) {
          this.state.options.animatePresenceContext?.onMotionExitComplete(this.state.presenceContainer, this.state)
        }
      },
    })
  }

  update() {
    this.setOptions()
  }

  mount() {
    this.state.visualElement.projection?.mount(this.state.element)
  }
}
