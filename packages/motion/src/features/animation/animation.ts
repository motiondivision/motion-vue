import { Feature } from '@/features/feature'
import { createAnimationState, isAnimationControls } from 'motion-dom'
import type { MotionState } from '@/state/motion-state'
import { isHiddenByPresenceChild } from '@/utils/is-hidden'

const STATE_TYPES = ['initial', 'animate', 'whileInView', 'whileHover', 'whilePress', 'whileDrag', 'whileFocus', 'exit'] as const
export type StateType = typeof STATE_TYPES[number]

export class AnimationFeature extends Feature {
  static key = 'animation' as const

  unmountControls?: () => void

  constructor(state: MotionState) {
    super(state)
    // Create animation state with visualElement (aligned with motion-dom signature)
    const ve = state.visualElement
    ve.animationState ||= createAnimationState(ve)
  }

  updateAnimationControlsSubscription() {
    const { animate } = this.state.options
    if (isAnimationControls(animate)) {
      this.unmountControls = animate.subscribe(this.state.visualElement)
    }
  }

  /**
   * Subscribe any provided AnimationControls to the component's VisualElement
   */
  mount() {
    if (isHiddenByPresenceChild(this.state.element!, this.state.options.presenceContext)) {
      this.state.setActive('exit', true)
    }
    else {
      this.state.visualElement.animationState?.animateChanges()
    }
    this.updateAnimationControlsSubscription()
  }

  update() {
    this.state.visualElement.animationState?.animateChanges()
    const { animate } = this.state.visualElement.getProps()
    const { animate: prevAnimate } = this.state.visualElement.prevProps || {}
    if (animate !== prevAnimate) {
      this.updateAnimationControlsSubscription()
    }
  }

  unmount() {
    this.state.visualElement.animationState!.reset()
    this.unmountControls?.()
  }
}
