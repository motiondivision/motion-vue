import { isAnimationControls } from '@/animation/utils'
import type { AnimateUpdates } from '@/features/animation/types'
import { Feature } from '@/features/feature'
import { type MotionState, mountedStates } from '@/state'
import { visualElementStore } from 'framer-motion/dist/es/render/store.mjs'
import { motionEvent } from '@/state/event'
import { style } from '@/state/style'
import { transformResetValue } from '@/state/transform'
import { hasChanged, resolveVariant } from '@/state/utils'
import type { $Transition, AnimationFactory, Options, Variant } from '@/types'
import { isDef } from '@vueuse/core'
import type { VisualElement } from 'framer-motion'
import { animate, noop } from 'framer-motion/dom'
import { createVisualElement } from '@/state/create-visual-element'

const STATE_TYPES = ['initial', 'animate', 'whileInView', 'whileHover', 'whilePress', 'whileDrag', 'whileFocus', 'exit'] as const
export type StateType = typeof STATE_TYPES[number]

export class AnimationFeature extends Feature {
  unmountControls?: () => void
  constructor(state: MotionState) {
    super(state)
    // Create visual element with initial config
    this.state.visualElement = createVisualElement(this.state.options.as!, {
      presenceContext: null,
      parent: this.state.parent?.visualElement,
      props: {
        ...this.state.options,
        whileTap: this.state.options.whilePress,
      },
      visualState: {
        renderState: {
          transform: {},
          transformOrigin: {},
          style: {},
          vars: {},
          attrs: {},
        },
        latestValues: {
          ...this.state.baseTarget,
        },
      },
      reducedMotionConfig: this.state.options.motionConfig.reduceMotion,
    })
    this.state.animateUpdates = this.animateUpdates
    if (this.state.isMounted())
      this.state.startAnimation()
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
    isFallback,
    isExit,
  } = {}) => {
    const prevTarget = this.state.target
    this.state.target = { ...this.state.baseTarget }
    let animationOptions: $Transition = {}
    const transition = { ...this.state.options.transition }

    animationOptions = this.resolveStateAnimation({
      controlActiveState,
      directAnimate,
      directTransition,
    })

    const factories = this.createAnimationFactories(prevTarget, animationOptions, controlDelay)
    const { getChildAnimations, childAnimations } = this.setupChildAnimations(animationOptions, controlActiveState, isFallback)
    return this.executeAnimations({
      factories,
      getChildAnimations,
      childAnimations,
      transition,
      controlActiveState,
      isExit,
    })
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
      childAnimations: (() => Promise<any>)[]
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
      element.dispatchEvent(motionEvent('motionstart', animationTarget))
      this.state.options.onAnimationStart?.(animationTarget)
      animationPromise
        .then(() => {
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
    isFallback: boolean,
  ) {
    if (!this.state.visualElement.variantChildren?.size || !controlActiveState)
      return { getChildAnimations: () => Promise.resolve(), childAnimations: [] }

    const { staggerChildren = 0, staggerDirection = 1, delayChildren = 0 } = transition || {}
    const maxStaggerDuration = (this.state.visualElement.variantChildren.size - 1) * staggerChildren
    const generateStaggerDuration = staggerDirection === 1
      ? (i = 0) => i * staggerChildren
      : (i = 0) => maxStaggerDuration - i * staggerChildren

    const childAnimations = Array.from(this.state.visualElement.variantChildren)
      .map((child: VisualElement & { state: MotionState }, index) => {
        const childDelay = delayChildren + generateStaggerDuration(index)
        return child.state.animateUpdates({
          controlActiveState,
          controlDelay: isFallback ? 0 : childDelay,
        })
      })
      .filter(Boolean) as (() => Promise<any>)[]

    return {
      getChildAnimations: () => Promise.all(childAnimations.map((animation) => {
        return animation?.()
      })),
      childAnimations,
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

  resolveStateAnimation(
    {
      controlActiveState,
      directAnimate,
      directTransition,
    }: {
      controlActiveState: Partial<Record<string, boolean>> | undefined
      directAnimate: Options['animate']
      directTransition: $Transition | undefined
    },
  ) {
    let variantTransition = this.state.options.transition
    let variant: Variant = {}
    const { variants, custom, transition, animatePresenceContext } = this.state.options
    const customValue = isDef(custom) ? custom : animatePresenceContext?.custom

    this.state.activeStates = { ...this.state.activeStates, ...controlActiveState }
    STATE_TYPES.forEach((name) => {
      if (!this.state.activeStates[name] || isAnimationControls(this.state.options[name]))
        return

      const definition = this.state.options[name]
      let resolvedVariant = isDef(definition) ? resolveVariant(definition as any, variants, customValue) : undefined
      // If current node is a variant node, merge the control node's variant
      if (this.state.visualElement.isVariantNode) {
        const controlVariant = resolveVariant(this.state.context[name], variants, customValue)
        resolvedVariant = controlVariant ? Object.assign(controlVariant || {}, resolvedVariant) : variant
      }
      if (!resolvedVariant)
        return
      if (name !== 'initial')
        variantTransition = resolvedVariant.transition || this.state.options.transition || {}
      variant = Object.assign(variant, resolvedVariant)
    })

    if (directAnimate) {
      variant = resolveVariant(directAnimate, variants, customValue)
      variantTransition = variant.transition || directTransition || transition
    }

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
    (this.state.visualElement as any).state = this.state
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
