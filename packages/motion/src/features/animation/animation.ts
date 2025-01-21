import { isAnimationControls } from '@/animation/utils'
import { Feature } from '@/features/feature'
import type { MotionState } from '@/state'

export class AnimationFeature extends Feature {
  unmountControls?: () => void
  constructor(state: MotionState) {
    super(state)
  }

  updateAnimationControlsSubscription() {
    const { animate } = this.state.options
    if (isAnimationControls(animate)) {
      this.unmountControls = animate.subscribe(this.state)
    }
  }

  /**
   * Subscribe any provided AnimationControls to the component's VisualElement
   */
  mount() {
    this.updateAnimationControlsSubscription()
  }

  update() {
    const { animate } = this.state.options
    const { animate: prevAnimate } = this.state.visualElement.prevProps || {}
    if (animate !== prevAnimate) {
      this.updateAnimationControlsSubscription()
    }
  }

  unmount() {
    this.unmountControls?.()
  }
}
