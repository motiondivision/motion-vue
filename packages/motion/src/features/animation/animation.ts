import { isAnimationControls } from '@/animation/utils'
import type { AnimateUpdates } from '@/features/animation/types'
import { Feature } from '@/features/feature'
import { type MotionState, mountedStates } from '@/state'
import { prefersReducedMotion, visualElementStore } from 'motion-dom'
import { animate } from 'framer-motion/dom'
import { noop } from 'motion-utils'
import { motionEvent } from '@/state/event'
import { style } from '@/state/style'
import { transformResetValue } from '@/state/transform'
import { hasChanged, resolveVariant } from '@/state/utils'
import type { $Transition, AnimationFactory, Options, VariantType } from '@/types'
import { isDef } from '@vueuse/core'
import type { VisualElement } from 'motion-dom'
import { calcChildStagger } from '@/features/animation/calc-child-stagger'
import { createAnimationState } from '@/state/animation-state'
import type { AnimationStateAPI } from '@/state/animation-state'

const STATE_TYPES = ['initial', 'animate', 'whileInView', 'whileHover', 'whilePress', 'whileDrag', 'whileFocus', 'exit'] as const
export type StateType = typeof STATE_TYPES[number]

export class AnimationFeature extends Feature {
  static key = 'animation' as const

  unmountControls?: () => void

  /**
   * Animation state manager ported from motion-dom.
   * Handles priority-based resolution via animateChanges/setActive.
   */
  animationState: AnimationStateAPI

  constructor(state: MotionState) {
    super(state)

    // Create animation state and inject Vue-specific animate function
    this.animationState = createAnimationState(state)
    this.animationState.setAnimateFunction(motionState => (animations) => {
      return this.executeAnimationEntries(motionState, animations)
    })

    // Attach to visualElement for child propagation
    ;(state.visualElement as any).animationState = this.animationState

    // visualElement is now created in useMotionState
    this.state.animateUpdates = this.animateUpdates
    if (this.state.isMounted())
      this.state.startAnimation()
  }

  /**
   * Bridge between createAnimationState's { animation, options }[] output
   * and Vue's per-key animate() execution model.
   */
  private executeAnimationEntries(
    motionState: MotionState,
    animations: Array<{ animation: any, options: Record<string, any> }>,
  ): Promise<any> {
    const prevTarget = motionState.target
    motionState.target = { ...motionState.baseTarget }

    // Resolve all animation entries into target values and extract transition
    const { variants, custom, transition, animatePresenceContext } = motionState.options
    const customValue = custom ?? animatePresenceContext?.custom
    let variantTransition: $Transition = motionState.options.transition || {}

    for (const { animation: definition, options } of animations) {
      const resolved = resolveVariant(definition, variants, customValue)
      if (!resolved)
        continue

      // If the variant has its own transition, use it
      if (resolved.transition && options.type !== 'initial') {
        variantTransition = resolved.transition
      }

      // Apply resolved values to target
      Object.entries(resolved).forEach(([key, value]) => {
        if (key === 'transition')
          return
        motionState.target[key] = value
      })
    }

    motionState.finalTransition = variantTransition

    const factories = this.createAnimationFactories(prevTarget, variantTransition, 0)
    const { getChildAnimations } = this.setupChildAnimations(variantTransition, motionState.activeStates)
    return this.executeAnimations({
      factories,
      getChildAnimations,
      transition: variantTransition,
      controlActiveState: motionState.activeStates,
      isExit: motionState.activeStates.exit || false,
    }) as Promise<any>
  }

  updateAnimationControlsSubscription() {
    const { animate } = this.state.options
    if (isAnimationControls(animate)) {
      this.unmountControls = animate.subscribe(this.state)
    }
  }

  animateUpdates: AnimateUpdates = ({
    controlActiveState,
    directAnimate,
    directTransition,
    controlDelay = 0,
    isExit,
  } = {}) => {
    // check if the user has reduced motion
    const { reducedMotion } = this.state.options.motionConfig
    this.state.visualElement.shouldReduceMotion = reducedMotion === 'always' || (reducedMotion === 'user' && !!prefersReducedMotion.current)

    // Direct animation path (AnimationControls / imperative API) bypasses createAnimationState
    if (directAnimate) {
      const prevTarget = this.state.target
      this.state.target = { ...this.state.baseTarget }
      const animationOptions = this.resolveDirectAnimation({ directAnimate, directTransition })
      this.state.finalTransition = animationOptions

      const factories = this.createAnimationFactories(prevTarget, animationOptions, controlDelay)
      const { getChildAnimations } = this.setupChildAnimations(animationOptions, this.state.activeStates)
      return this.executeAnimations({
        factories,
        getChildAnimations,
        transition: animationOptions,
        controlActiveState,
        isExit,
      })
    }

    // Controlled child animation path (parent passing controlActiveState + controlDelay)
    if (controlActiveState) {
      const prevTarget = this.state.target
      this.state.target = { ...this.state.baseTarget }
      const animationOptions = this.resolveStateAnimation({ controlActiveState })
      this.state.finalTransition = animationOptions

      const factories = this.createAnimationFactories(prevTarget, animationOptions, controlDelay)
      const { getChildAnimations } = this.setupChildAnimations(animationOptions, controlActiveState)
      return this.executeAnimations({
        factories,
        getChildAnimations,
        transition: animationOptions,
        controlActiveState,
        isExit,
      })
    }

    // Standard variant-based animation path — delegate to createAnimationState
    return this.animationState.animateChanges()
  }

  executeAnimations(
    {
      factories,
      getChildAnimations,
      transition,
      controlActiveState,
      isExit = false,
    }: {
      factories: AnimationFactory[]
      getChildAnimations: () => Promise<any>
      transition: $Transition | undefined
      controlActiveState: Partial<Record<string, boolean>> | undefined
      isExit: boolean
    },
  ) {
    const getAnimation = () => Promise.all(factories.map(factory => factory()).filter(Boolean))

    const animationTarget = { ...this.state.target }
    const element = this.state.element
    /**
     * Finish the animation and dispatch events
     */
    const finishAnimation = (animationPromise: Promise<any>) => {
      if (isExit) {
        // set isExiting to true when exit animation is started
        this.state.isExiting = true
      }
      element.dispatchEvent(motionEvent('motionstart', animationTarget))
      this.state.options.onAnimationStart?.(animationTarget)
      animationPromise
        .then(() => {
          if (isExit) {
            // set isExiting to false when exit animation is completed
            this.state.isExiting = false

            // Notify AnimatePresence that exit animation is complete
            const presenceContext = this.state.options.animatePresenceContext
            if (presenceContext?.onMotionExitComplete && this.state.presenceContainer) {
              const state = this.state
              const projection = state.visualElement.projection
              if (!(state.options?.layoutId && projection.currentAnimation?.state === 'running' && !state.options.exit)) {
                presenceContext.onMotionExitComplete(state.presenceContainer, state)
              }
            }
          }
          element.dispatchEvent(motionEvent('motioncomplete', animationTarget, isExit))
          this.state.options.onAnimationComplete?.(animationTarget)
        })
        .catch(noop)
    }

    /**
     * Get the animation promise
     */
    const getAnimationPromise = () => {
      const animationPromise = transition?.when
        ? (transition.when === 'beforeChildren' ? getAnimation() : getChildAnimations())
            .then(() => (transition.when === 'beforeChildren' ? getChildAnimations() : getAnimation()))
        : Promise.all([getAnimation(), getChildAnimations()])

      finishAnimation(animationPromise)
      return animationPromise
    }

    return controlActiveState ? getAnimationPromise : getAnimationPromise()
  }

  /**
   * Setup child animations
   */
  setupChildAnimations(
    transition: $Transition | undefined,
    controlActiveState: Partial<Record<string, boolean>> | undefined,
  ) {
    const visualElement = this.state.visualElement
    if (!visualElement.variantChildren?.size || !controlActiveState)
      return { getChildAnimations: () => Promise.resolve() }

    const { staggerChildren = 0, staggerDirection = 1, delayChildren = 0 } = transition || {}
    const numChildren = visualElement.variantChildren.size
    const maxStaggerDuration = (numChildren - 1) * staggerChildren
    const delayIsFunction = typeof delayChildren === 'function'
    const generateStaggerDuration = delayIsFunction
      ? (i: number) => delayChildren(i, numChildren)
    // Support deprecated staggerChildren,will be removed in next major version
      : staggerDirection === 1
        ? (i = 0) => i * staggerChildren
        : (i = 0) => maxStaggerDuration - i * staggerChildren

    const childAnimations = Array.from(visualElement.variantChildren)
      .map((child: VisualElement & { state: MotionState }, index) => {
        return child.state.animateUpdates({
          controlActiveState,
          controlDelay: (delayIsFunction ? 0 : delayChildren) + generateStaggerDuration(index),
        })
      })

    return {
      getChildAnimations: () => Promise.all(childAnimations.map((animation: () => Promise<any>) => {
        return animation()
      })),
    }
  }

  createAnimationFactories(
    prevTarget: Record<string, any>,
    animationOptions: $Transition,
    controlDelay: number,
  ) {
    const factories: AnimationFactory[] = []

    Object.keys(this.state.target).forEach((key: any) => {
      if (!hasChanged(prevTarget[key], this.state.target[key]))
        return
      this.state.baseTarget[key] ??= style.get(this.state.element, key) as string
      const keyValue = (this.state.target[key] === 'none' && isDef(transformResetValue[key])) ? transformResetValue[key] : this.state.target[key]
      factories.push(() => animate(
        this.state.element,
        { [key]: keyValue },
        {
          ...(animationOptions?.[key] || animationOptions),
          delay: (animationOptions?.[key]?.delay || animationOptions?.delay || 0) + controlDelay,
        } as any,
      ))
    })
    return factories
  }

  /**
   * Resolve direct animation (from AnimationControls / imperative API).
   * This path bypasses createAnimationState.
   */
  resolveDirectAnimation(
    {
      directAnimate,
      directTransition,
    }: {
      directAnimate: Options['animate']
      directTransition: Options['transition'] | undefined
    },
  ) {
    const { variants, custom, transition, animatePresenceContext } = this.state.options
    const customValue = custom ?? animatePresenceContext?.custom

    const variant = resolveVariant(directAnimate, variants, customValue)
    const variantTransition = variant?.transition || directTransition || transition

    if (variant) {
      Object.entries(variant).forEach(([key, value]) => {
        if (key === 'transition')
          return
        this.state.target[key] = value
      })
    }

    return variantTransition
  }

  /**
   * Resolve state animation for controlled child path.
   * Kept for controlled child animations that need controlActiveState + controlDelay.
   */
  resolveStateAnimation(
    {
      controlActiveState,
    }: {
      controlActiveState: Partial<Record<string, boolean>> | undefined
    },
  ) {
    let variantTransition = this.state.options.transition
    let variant: VariantType = {}
    const { variants, custom, transition, animatePresenceContext } = this.state.options
    const customValue = custom ?? animatePresenceContext?.custom

    this.state.activeStates = { ...this.state.activeStates, ...controlActiveState }
    STATE_TYPES.forEach((name) => {
      if (!this.state.activeStates[name] || isAnimationControls(this.state.options[name]))
        return

      const definition = this.state.options[name]
      let resolvedVariant = isDef(definition) ? resolveVariant(definition as any, variants, customValue) : undefined
      // If current node is a variant node, merge the control node's variant
      if (this.state.visualElement.isVariantNode) {
        const controlVariant = resolveVariant(this.state.context[name], variants, customValue)
        resolvedVariant = controlVariant ? Object.assign(controlVariant || {}, resolvedVariant) : Object.assign(variant, resolvedVariant)
      }
      if (!resolvedVariant)
        return
      if (name !== 'initial')
        variantTransition = resolvedVariant.transition || this.state.options.transition || {}
      variant = Object.assign(variant, resolvedVariant)
    })

    Object.entries(variant).forEach(([key, value]) => {
      if (key === 'transition')
        return
      this.state.target[key] = value
    })
    return variantTransition
  }

  /**
   * Subscribe any provided AnimationControls to the component's VisualElement
   */
  mount() {
    const { element } = this.state
    mountedStates.set(element, this.state)
    if (!visualElementStore.get(element)) {
      this.state.visualElement.mount(element)
      visualElementStore.set(element, this.state.visualElement)
    }
    // Add state reference to visual element
    ;(this.state.visualElement as any).state = this.state
    this.updateAnimationControlsSubscription()

    const visualElement = this.state.visualElement
    const parentVisualElement = visualElement.parent
    visualElement.enteringChildren = undefined
    /**
     * when current element is new entering child and it's controlled by parent,
     * animate it by delayChildren
     */
    if (this.state.parent?.isMounted() && !visualElement.isControllingVariants && parentVisualElement?.enteringChildren?.has(visualElement)) {
      const { delayChildren } = this.state.parent.finalTransition || {};
      (this.animateUpdates({
        controlActiveState: this.state.parent.activeStates,
        controlDelay: calcChildStagger(parentVisualElement.enteringChildren, visualElement, delayChildren),
      }) as Function)()
    }
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
