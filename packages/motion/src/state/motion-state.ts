import type { $Transition, MotionStateContext, Options } from '@/types'
import { invariant } from 'hey-listen'
import type { DOMKeyframesDefinition, VisualElement } from 'motion-dom'
import { cancelFrame, frame } from 'motion-dom'
import { noop } from 'motion-utils'
import { isSVGElement, resolveVariant } from '@/state/utils'
import type { Feature, FeatureClass, FeatureKey, StateType } from '@/features'
import { lazyFeatures } from '@/features/lazy-features'
import type { PresenceContext } from '@/components/animate-presence/presence'
import type { AnimateUpdates } from '@/features/animation/types'
import { isVariantLabels } from '@/state/utils/is-variant-labels'

// Map to track mounted motion states by element
export const mountedStates = new WeakMap<Element, MotionState>()
let id = 0

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

  // Whether the element is exiting
  public isExiting = false
  // The AnimatePresence container this motion component belongs to
  public presenceContainer: Element | null = null
  public options: Options & {
    animatePresenceContext?: PresenceContext
    features?: Array<typeof Feature>
  }

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

  // Feature instances managed by key
  private features = new Map<FeatureKey, Feature>()

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
    this.initFeatures()
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

  /**
   * Initialize features from options and global lazy features
   * Features are stored by key to avoid duplicate instantiation
   */
  initFeatures() {
    for (const FeatureCtor of lazyFeatures) {
      // Skip if already registered
      if (this.features.has(FeatureCtor.key)) {
        continue
      }

      const instance = new (FeatureCtor as FeatureClass)(this)
      this.features.set(FeatureCtor.key, instance)
    }
  }

  /**
   * Get a feature instance by key
   * Useful for feature-to-feature communication
   */
  getFeature<T extends Feature>(key: FeatureKey): T | undefined {
    return this.features.get(key) as T | undefined
  }

  // Update visual element with new options
  updateOptions(options: Options) {
    this.options = options
    this.visualElement?.update({
      ...this.options as any,
      whileTap: this.options.whilePress,
    }, null as any)
  }

  // Called before mounting, executes in parent-to-child order
  beforeMount() {
    this.features.forEach(f => f.beforeMount?.())
  }

  // Mount motion state to DOM element, handles parent-child relationships
  mount(element: HTMLElement | SVGElement, options: Options, notAnimate = false) {
    invariant(
      Boolean(element),
      'Animation state must be mounted with valid Element',
    )
    this.element = element
    this.updateOptions(options)

    // Mount features in parent-to-child order
    this.features.forEach(f => f.mount?.())
    if (!notAnimate && this.options.animate) {
      this.startAnimation?.()
    }
  }

  clearAnimation() {
    this.currentProcess && cancelFrame(this.currentProcess)
    this.currentProcess = null
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
    this.features.forEach(f => f.beforeUnmount?.())
  }

  unmount() {
    this.parent?.children?.delete(this)
    mountedStates.delete(this.element)
    this.features.forEach(f => f.unmount?.())
    this.visualElement?.unmount()
    // clear animation
    this.clearAnimation()
  }

  // Called before updating, executes in parent-to-child order
  beforeUpdate(options: Options) {
  }

  // Update motion state with new options
  update(options: Options) {
    this.updateOptions(options)
    this.startAnimation()
  }

  // Set animation state active status and propagate to children
  // [Vue] Delegates to animationState.setActive which handles child propagation
  // + animateChanges internally, aligned with motion-dom's architecture.
  setActive(name: StateType, isActive: boolean) {
    if (!this.element)
      return
    this.activeStates[name] = isActive // keep mirror for compat
    const animationFeature = this.getFeature('animation') as any
    animationFeature?.animationState?.setActive(name, isActive)
  }

  // Core animation update logic
  animateUpdates: AnimateUpdates = noop as any

  isMounted() {
    return Boolean(this.element)
  }

  getSnapshot(options: Options, isPresent?: boolean) {}
  didUpdate(label?: string) {}
}
