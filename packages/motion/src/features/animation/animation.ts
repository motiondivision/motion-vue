import { isAnimationControls } from '@/animation/utils'
import { Feature } from '@/features/feature'
import type { AnimationState } from 'motion-dom'
import { createAnimationState } from '@/state/animation-state'
import type { MotionState } from '@/state/motion-state'
import { isHidden } from '@/utils/is-hidden'

const STATE_TYPES = ['initial', 'animate', 'whileInView', 'whileHover', 'whilePress', 'whileDrag', 'whileFocus', 'exit'] as const
export type StateType = typeof STATE_TYPES[number]

export class AnimationFeature extends Feature {
  static key = 'animation' as const

  unmountControls?: () => void

  constructor(state: MotionState) {
    super(state)
    // Create animation state with visualElement (aligned with motion-dom signature)
    const ve = state.visualElement
    ve.animationState ||= createAnimationState(ve) as AnimationState
  }

  updateAnimationControlsSubscription() {
    const { animate } = this.state.options
    if (isAnimationControls(animate)) {
      // this.unmountControls = animate.subscribe(this.state)
    }
  }

  /**
   * Subscribe any provided AnimationControls to the component's VisualElement
   */
  mount() {
    const isPresent = !isHidden(this.state.element as HTMLElement)
    if (!isPresent) {
      this.state.setActive('exit', true)
    }
    else {
      this.state.visualElement.animationState?.animateChanges()
    }
  }

  update() {
    this.state.visualElement.animationState?.animateChanges()
  }

  unmount() {
    this.unmountControls?.()
  }
}
