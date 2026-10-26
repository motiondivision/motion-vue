import { Feature } from '@/features/feature'
import type { ExitFeature } from '@/features/exit/exit'
import type { IProjectionNode } from 'motion-dom'
import { HTMLProjectionNode, addScaleCorrector, isHTMLElement } from 'motion-dom'
import { getClosestProjectingNode } from '@/features/layout/utils'
import { defaultScaleCorrector } from '@/features/layout/config'
import { isSSR } from '@/utils/is'
import type { MotionState } from '@/state'

export class ProjectionFeature extends Feature {
  static key = 'projection' as const
  private projection: IProjectionNode | undefined
  constructor(state: MotionState) {
    super(state)
    addScaleCorrector(defaultScaleCorrector)
    if (!isSSR) {
      this.initProjection()
    }
  }

  initProjection() {
    const options = this.state.options
    this.state.visualElement.projection = new HTMLProjectionNode(
      this.state.visualElement.latestValues,
      options['data-framer-portal-id']
        ? undefined
        : getClosestProjectingNode(this.state.visualElement.parent),
    )
    this.projection = this.state.visualElement.projection
    this.projection!.isPresent = true
    this.setOptions()

    const lead = this.projection!.getStack()?.lead
    if (lead && !this.projection!.root!.isUpdateBlocked()) {
      lead.willUpdate()
      lead.scheduleCheckAfterUnmount()
    }
  }

  setOptions() {
    const options = this.state.options
    const { layoutId, layout, drag = false, dragConstraints = false } = options
    this.projection?.setOptions({
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
        if (!this.projection?.isPresent && this.state.options.layoutId && !this.state.isExiting) {
          // Defer to avoid re-entrant microtask.read() during projection update().
          // notifyLayoutUpdate can call this synchronously while the microtask batcher
          // is processing; a direct root.didUpdate() call here would be permanently lost
          // because the microtask batcher's allowKeepAlive=false skips follow-up batches.
          queueMicrotask(() => {
            this.state.getFeature<ExitFeature>('exit')?.completeExitFromProjection()
          })
        }
      },
    })
  }

  update() {
    this.setOptions()
  }

  mount() {
    this.projection?.mount(this.state.element)
  }
}
