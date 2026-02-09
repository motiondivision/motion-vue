import { isAnimationControls } from '@/animation/utils'
import { Feature } from '@/features/feature'
import type { AnimationState, VisualElement } from 'motion-dom'
import { createAnimationState } from '@/state/animation-state'

const STATE_TYPES = ['initial', 'animate', 'whileInView', 'whileHover', 'whilePress', 'whileDrag', 'whileFocus', 'exit'] as const
export type StateType = typeof STATE_TYPES[number]

export class AnimationFeature extends Feature {
  static key = 'animation' as const

  unmountControls?: () => void

  constructor(node: VisualElement) {
    super(node)
    // Create animation state with visualElement (aligned with motion-dom signature)
    node.animationState ||= createAnimationState(node) as AnimationState
  }

  updateAnimationControlsSubscription() {
    const { animate } = this.node.props
    if (isAnimationControls(animate)) {
      // this.unmountControls = animate.subscribe(this.state)
    }
  }

  /**
   * Subscribe any provided AnimationControls to the component's VisualElement
   */
  mount() {
    this.node.animationState?.animateChanges()
  }

  unmount() {
    this.unmountControls?.()
  }
}
