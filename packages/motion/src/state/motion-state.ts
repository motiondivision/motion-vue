import type { $Transition, AnimationFactory, MotionStateContext, Options } from '@/types'
import { invariant } from 'hey-listen'
import { visualElementStore } from 'framer-motion/dist/es/render/store.mjs'
import { isDef } from '@vueuse/core'
import type { AnimationPlaybackControls, DOMKeyframesDefinition, VisualElement } from 'framer-motion'
import { animate, frame, noop } from 'framer-motion/dom'
import { getOptions, hasChanged, resolveVariant } from '@/state/utils'
import { FeatureManager } from '@/features'
import { style } from '@/state/style'
import { transformResetValue } from '@/state/transform'
import { motionEvent } from '@/state/event'
import { createVisualElement } from '@/state/create-visual-element'
import { doneCallbacks } from '@/components/presence'

// Animation state types that can be active
const STATE_TYPES = ['initial', 'animate', 'inView', 'hover', 'press', 'whileDrag', 'focus', 'exit'] as const
type StateType = typeof STATE_TYPES[number]

// Map to track mounted motion states by element
export const mountedStates = new WeakMap<Element, MotionState>()
let id = 0

/**
 * Core class that manages animation state and orchestrates animations
 */
export class MotionState {
  public readonly id: string
  public element: HTMLElement | null = null
  private parent?: MotionState
  public options: Options
  public isSafeToRemove = false
  public isVShow = false
  private children?: Set<MotionState> = new Set()

  // Track which animation states are currently active
  public activeStates: Partial<Record<StateType, boolean>> = {
    initial: true,
    animate: true,
  }

  // Depth in component tree
  public depth: number

  // Base animation target values
  public baseTarget: DOMKeyframesDefinition

  // Current animation target values
  public target: DOMKeyframesDefinition
  private featureManager: FeatureManager

  // Visual element instance from Framer Motion
  public visualElement: VisualElement<Element>

  constructor(options: Options, parent?: MotionState) {
    this.id = `motion-state-${id++}`
    this.options = options
    this.parent = parent
    parent?.children?.add(this)
    this.depth = parent?.depth + 1 || 0

    // Create visual element with initial config
    this.visualElement = createVisualElement(this.options.as!, {
      presenceContext: null,
      parent: parent?.visualElement,
      props: {
        ...this.options,
        whileHover: this.options.hover,
        whileTap: this.options.press,
        whileInView: this.options.inView,
      },
      visualState: {
        renderState: {
          transform: {},
          transformOrigin: {},
          style: {},
          vars: {},
          attrs: {},
        },
        latestValues: {},
      },
      reducedMotionConfig: options.motionConfig.reduceMotion,
    })

    // Initialize with either initial or animate variant
    const initialVariantSource = options.initial === false ? 'animate' : 'initial'
    this.initTarget(initialVariantSource)
    this.featureManager = new FeatureManager(this)
  }

  private _context: MotionStateContext | null = null

  // Get animation context, falling back to parent context
  get context() {
    if (!this._context) {
      const handler = {
        get: (target: MotionStateContext, prop: keyof MotionStateContext) => {
          return typeof this.options[prop] === 'string'
            ? this.options[prop]
            : this.parent?.context[prop]
        },
      }

      this._context = new Proxy({} as MotionStateContext, handler)
    }
    return this._context
  }

  // Initialize animation target values
  private initTarget(initialVariantSource: string) {
    this.baseTarget = resolveVariant(this.options[initialVariantSource] || this.context[initialVariantSource], this.options.variants) || {}
    this.target = { }
  }

  // Get initial animation state
  get initial() {
    return isDef(this.options.initial) ? this.options.initial : this.context.initial
  }

  // Update visual element with new options
  updateOptions() {
    this.visualElement.update({
      ...this.options as any,
      whileHover: this.options.hover,
      whileTap: this.options.press,
      whileInView: this.options.inView,
      reducedMotionConfig: this.options.motionConfig.reduceMotion,
    }, {
      isPresent: !doneCallbacks.has(this.element),
    } as any)
  }

  beforeMount() {
    this.featureManager.beforeMount()
  }

  // Mount motion state to DOM element
  mount(element: HTMLElement, options: Options, notAnimate = false) {
    invariant(
      Boolean(element),
      'Animation state must be mounted with valid Element',
    )
    this.element = element
    this.options = options
    mountedStates.set(element, this)
    if (!visualElementStore.get(element)) {
      this.visualElement.mount(element)
      visualElementStore.set(element, this.visualElement)
    }
    // Add state reference to visual element
    (this.visualElement as any).state = this

    this.updateOptions()

    // Apply initial values
    if (typeof this.initial === 'object') {
      for (const key in this.initial) {
        this.visualElement.setStaticValue(key, this.initial[key])
      }
    }
    else if (typeof this.initial === 'string' && this.options.variants) {
      for (const key in this.options.variants[this.initial]) {
        this.visualElement.setStaticValue(key, this.options.variants[this.initial][key])
      }
    }

    // Mount features
    this.featureManager.mount()
    if (!notAnimate && this.options.animate) {
      this.animateUpdates()
    }
  }

  beforeUnmount() {
    this.featureManager.beforeUnmount()
  }

  // Unmount motion state and optionally unmount children
  unmount(unMountChildren = false) {
    mountedStates.delete(this.element)
    this.featureManager.unmount()
    if (unMountChildren) {
      frame.render(() => {
        this.visualElement?.unmount()
      })
    }
    else {
      this.visualElement?.unmount()
    }
    if (unMountChildren) {
      const unmountChild = (child: MotionState) => {
        child.unmount(true)
        child.children?.forEach(unmountChild)
      }
      Array.from(this.children).forEach(unmountChild)
    }
    this.parent?.children?.delete(this)
  }

  beforeUpdate() {
    this.featureManager.beforeUpdate()
  }

  // Update motion state with new options
  update(options: Options, notAnimate = false) {
    const prevAnimate = JSON.stringify(this.options.animate)
    this.options = options
    let hasAnimateChange = false
    if (prevAnimate !== JSON.stringify(options.animate)) {
      hasAnimateChange = true
    }
    this.updateOptions()
    // Update features
    this.featureManager.update()

    if (hasAnimateChange && !notAnimate) {
      this.animateUpdates()
    }
  }

  // Set animation state active status
  setActive(name: StateType, isActive: boolean, isAnimate = true) {
    if (!this.element || this.activeStates[name] === isActive)
      return
    this.activeStates[name] = isActive
    this.visualElement.variantChildren?.forEach((child) => {
      ((child as any).state as MotionState).setActive(name, isActive, false)
    })
    if (isAnimate) {
      this.animateUpdates()
    }
  }

  // Core animation update logic
  animateUpdates(controlActiveState: typeof this.activeStates = undefined, controlDelay: number = 0) {
    const prevTarget = this.target
    this.target = {
      ...this.baseTarget,
    }
    const animationOptions: { [key: string]: $Transition } = {}
    let transition: $Transition
    if (controlActiveState) {
      this.activeStates = { ...this.activeStates, ...controlActiveState }
    }
    // Process each active animation state
    for (const name of STATE_TYPES) {
      if (!this.activeStates[name]) {
        continue
      }
      const definition = isDef(this.options[name]) ? this.options[name] : this.context[name]
      const variant = resolveVariant(
        definition,
        this.options.variants,
        this.options.custom,
      )
      transition = Object.assign({}, this.options.transition, variant?.transition)
      if (!variant)
        continue
      const allTarget = { ...variant }
      for (const key in allTarget) {
        if (key === 'transition')
          continue

        this.target[key] = variant[key]

        animationOptions[key] = getOptions(
          transition,
          key,
        )
      }
    }

    // Create animation factories for changed properties
    const allTargetKeys = new Set([
      ...Object.keys(this.target),
    ])
    const animationFactories: AnimationFactory[] = []
    allTargetKeys.forEach((key: any) => {
      if (hasChanged(prevTarget[key], this.target[key])) {
        this.baseTarget[key] ??= style.get(this.element, key) as string
        const keyValue = this.target[key] === 'none' ? transformResetValue[key] : this.target[key]
        const targetTransition = animationOptions[key]
        animationFactories.push(
          () => {
            return animate(
              this.element,
              {
                [key]: keyValue,
              },
              {
                ...targetTransition,
                delay: (targetTransition?.delay || 0) + controlDelay,
              } as any,
            )
          },
        )
      }
    })

    let getChildAnimations: () => Promise<any> = () => Promise.resolve()
    let childAnimations: (() => Promise<any>)[] = []

    // Handle staggered child animations
    if (this.visualElement.variantChildren?.size && !controlActiveState) {
      const { staggerChildren = 0, staggerDirection = 1, delayChildren = 0 } = transition || {}
      const maxStaggerDuration = (this.visualElement.variantChildren.size - 1) * staggerChildren
      const generateStaggerDuration = staggerDirection === 1
        ? (i = 0) => i * staggerChildren
        : (i = 0) => maxStaggerDuration - i * staggerChildren

      childAnimations = Array.from(this.visualElement.variantChildren).map((child: VisualElement & { state: MotionState }, index) => {
        const childDelay = delayChildren + generateStaggerDuration(index)
        return child.state.animateUpdates(this.activeStates, childDelay)
      }).filter(Boolean)

      getChildAnimations = () => Promise.all(childAnimations.map(animation => animation()))
    }

    // Create and run animations
    let animations: AnimationPlaybackControls[]
    const getAnimation = () => {
      animations = animationFactories
        .map(factory => factory())
        .filter(Boolean)
      return Promise.all(animations)
    }

    const { when } = transition

    let animationPromise: Promise<any>
    const isExit = this.activeStates.exit

    const animationTarget = { ...this.target }

    const element = this.element
    // Handle animation completion and events
    function finishAnimation() {
      if (!animations?.length && !childAnimations.length) {
        if (isExit) {
          element.dispatchEvent(motionEvent('motionstart', animationTarget))
          element.dispatchEvent(motionEvent('motioncomplete', animationTarget, isExit))
        }
        return
      }
      element.dispatchEvent(motionEvent('motionstart', animationTarget))
      animationPromise
        .then(() => {
          element.dispatchEvent(motionEvent('motioncomplete', animationTarget, isExit))
        })
        .catch(noop)
    }

    // Orchestrate parent/child animation order
    function getAnimationPromise() {
      if (when) {
        const [first, last]
          = when === 'beforeChildren'
            ? [getAnimation, getChildAnimations]
            : [getChildAnimations, getAnimation]

        animationPromise = first().then(() => last())
        finishAnimation()
        return animationPromise
      }
      else {
        animationPromise = Promise.all([getAnimation(), getChildAnimations()])
        finishAnimation()
        return animationPromise
      }
    }
    if (controlActiveState) {
      return getAnimationPromise
    }
    getAnimationPromise()
  }

  isMounted() {
    return Boolean(this.element)
  }

  getOptions() {
    return this.options
  }

  willUpdate(label: string) {
    this.visualElement.projection?.willUpdate()
  }
}
