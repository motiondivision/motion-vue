import type { $Transition, MotionStateContext, Options } from '@/types'
import { invariant } from 'hey-listen'
import type { DOMKeyframesDefinition, VisualElement } from 'framer-motion'
import { cancelFrame, frame, noop } from 'framer-motion/dom'
import { isSVGElement, resolveVariant } from '@/state/utils'
import type { Feature, StateType } from '@/features'
import { FeatureManager } from '@/features'
import type { PresenceContext } from '@/components/animate-presence/presence'
import { doneCallbacks } from '@/components/animate-presence/presence'
import type { AnimateUpdates } from '@/features/animation/types'
import { isVariantLabels } from '@/state/utils/is-variant-labels'
import type { LazyMotionContext } from '@/components/lazy-motion/context'

// Map to track mounted motion states by element
export const mountedStates = new WeakMap<Element, MotionState>()
let id = 0

// Track mounted layout IDs to handle component tree lifecycle order
const mountedLayoutIds = new Set<string>()

/**
 * Core class that manages animation state and orchestrates animations.
 * Handles component lifecycle methods in the correct order based on component tree position.
 */
export class MotionState {
  public readonly id: string
  public type: 'html' | 'svg'
  public element: HTMLElement | SVGElement | null = null
  // Parent reference for handling component tree relationships
  public parent?: MotionState
  public options: Options & {
    animatePresenceContext?: PresenceContext
    features?: Feature[]
    lazyMotionContext?: LazyMotionContext
  }

  public isSafeToRemove = false
  public isVShow = false
  // Track child components for proper lifecycle ordering
  private children?: Set<MotionState> = new Set()

  // Track which animation states are currently active
  public activeStates: Partial<Record<StateType, boolean>> = {
    initial: true,
    animate: true,
  }

  /**
   * Current animation process reference
   * Tracks the ongoing animation process for mount/update animations
   * Enables delayed animation loading and parent-child animation orchestration
   * Allows parent variant elements to control child element animations
   */
  public currentProcess: ReturnType<typeof frame.render> | null = null

  // Base animation target values
  public baseTarget: DOMKeyframesDefinition

  // Current animation target values
  public target: DOMKeyframesDefinition
  /**
   * The final transition to be applied to the state
   */
  public finalTransition: $Transition
  private featureManager: FeatureManager

  // Visual element instance from Framer Motion
  public visualElement: VisualElement<Element>

  constructor(options: Options, parent?: MotionState) {
    this.id = `motion-state-${id++}`
    this.options = options
    this.parent = parent
    // Add to parent's children set for lifecycle management
    parent?.children?.add(this)

    // Initialize with either initial or animate variant
    const initial = (options.initial === undefined && options.variants) ? this.context.initial : options.initial
    const initialVariantSource = initial === false ? ['initial', 'animate'] : ['initial']
    this.initTarget(initialVariantSource)
    this.featureManager = new FeatureManager(this)
    this.type = isSVGElement(this.options.as as any) ? 'svg' : 'html'
  }

  private _context: MotionStateContext | null = null

  // Get animation context, falling back to parent context for inheritance
  get context() {
    if (!this._context) {
      const handler = {
        get: (target: MotionStateContext, prop: keyof MotionStateContext) => {
          return isVariantLabels(this.options[prop])
            ? this.options[prop]
            : this.parent?.context[prop]
        },
      }

      this._context = new Proxy({} as MotionStateContext, handler)
    }
    return this._context
  }

  // Initialize animation target values
  private initTarget(initialVariantSource: string[]) {
    const custom = this.options.custom ?? this.options.animatePresenceContext?.custom
    this.baseTarget = initialVariantSource.reduce((acc, variant) => {
      return {
        ...acc,
        ...resolveVariant(this.options[variant] || this.context[variant], this.options.variants, custom),
      }
    }, {})
    this.target = { }
  }

  // Update visual element with new options
  updateOptions(options: Options) {
    this.options = options
    this.visualElement?.update({
      ...this.options as any,
      whileTap: this.options.whilePress,
    }, {
      isPresent: !doneCallbacks.has(this.element),
    } as any)
  }

  // Called before mounting, executes in parent-to-child order
  beforeMount() {
    this.featureManager.beforeMount()
  }

  // Mount motion state to DOM element, handles parent-child relationships
  mount(element: HTMLElement | SVGElement, options: Options, notAnimate = false) {
    invariant(
      Boolean(element),
      'Animation state must be mounted with valid Element',
    )
    this.element = element
    this.updateOptions(options)

    const shouldDelay = this.options.layoutId && this.visualElement.projection.getStack()?.members.length > 0
    // Mount features in parent-to-child order
    this.featureManager.mount()
    if (!notAnimate && this.options.animate) {
      this.startAnimation?.()
    }
  }

  clearAnimation() {
    this.currentProcess && cancelFrame(this.currentProcess)
    this.currentProcess = null
    this.visualElement?.variantChildren?.forEach((child) => {
      (child as any).state.clearAnimation()
    })
  }

  // update trigger animation
  startAnimation() {
    this.clearAnimation()
    this.currentProcess = frame.render(() => {
      this.currentProcess = null
      this.animateUpdates()
    })
  }

  // Called before unmounting, executes in child-to-parent order
  beforeUnmount() {
    this.featureManager.beforeUnmount()
  }

  unmount(unMountChildren = false) {
    const shouldDelay = this.options.layoutId && this.visualElement.projection?.getStack().lead === this.visualElement.projection && this.visualElement.projection.isProjecting()
    if (shouldDelay) {
      Promise.resolve().then(() => {
        this.unmount(unMountChildren)
      })
      return
    }
    if (unMountChildren) {
      Array.from(this.children).reverse().forEach(this.unmountChild)
    }
    this.parent?.children?.delete(this)
    mountedStates.delete(this.element)
    this.featureManager.unmount()
    this.visualElement?.unmount()
    // clear animation
    this.clearAnimation()
  }

  private unmountChild(child: MotionState) {
    child.unmount(true)
  }

  // Called before updating, executes in parent-to-child order
  beforeUpdate() {
    this.featureManager.beforeUpdate()
  }

  // Update motion state with new options
  update(options: Options) {
    this.updateOptions(options)
    // Update features in parent-to-child order
    this.featureManager.update()

    this.startAnimation()
  }

  // Set animation state active status and propagate to children
  setActive(name: StateType, isActive: boolean, isAnimate = true) {
    if (!this.element || this.activeStates[name] === isActive)
      return
    this.activeStates[name] = isActive
    this.visualElement.variantChildren?.forEach((child) => {
      ((child as any).state as MotionState).setActive(name, isActive, false)
    })
    if (isAnimate) {
      this.animateUpdates({
        isExit: name === 'exit' && this.activeStates.exit,
      })
    }
  }

  // Core animation update logic
  animateUpdates: AnimateUpdates = noop as any

  isMounted() {
    return Boolean(this.element)
  }

  // Called before layout updates to prepare for changes
  willUpdate(label: string) {
    if (this.options.layout || this.options.layoutId) {
      this.visualElement.projection?.willUpdate()
    }
  }
}
