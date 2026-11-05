import { Feature } from '@/features/feature'
import { createAnimationState, isAnimationControls, isVariantLabel } from 'motion-dom'
import type { AnimationType, VisualElement } from 'motion-dom'
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
   * A child that mounts after a gesture state on its controlling ancestor has
   * already activated never receives that setActive() propagation: it only
   * reaches the variant children registered at the time it fires. Adopt the
   * ancestor's active states so this child resolves the variant an existing
   * child would have. A label the child declares itself belongs to its own
   * gesture and is left alone.
   */
  private adoptInheritedActiveStates() {
    const visualElement = this.state.visualElement
    let source: VisualElement | undefined = visualElement
    do
      source = (source.props as { inherit?: boolean }).inherit !== false ? source.parent : undefined
    while (source && !source.isControllingVariants)

    const activeStates = source?.animationState?.getState()
    if (!activeStates)
      return

    const ownProps = visualElement.props as Record<string, unknown>
    const sourceProps = source!.props as Record<string, unknown>
    for (const type in activeStates) {
      // exit is driven by presence, not by variant inheritance
      if (type === 'exit' || !activeStates[type].isActive || ownProps[type] !== undefined)
        continue
      if (!isVariantLabel(sourceProps[type]))
        continue
      visualElement.animationState?.setActive(type as AnimationType, true)
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
      this.adoptInheritedActiveStates()
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
