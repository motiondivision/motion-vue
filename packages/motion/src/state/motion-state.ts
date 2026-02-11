import type { MotionStateContext, Options } from '@/types'
import { invariant } from 'hey-listen'
import type { AnimationType, DOMKeyframesDefinition, VisualElement } from 'motion-dom'
import { frame, isVariantLabel } from 'motion-dom'
import { isSVGElement, resolveVariant } from '@/state/utils'
import type { Feature, FeatureKey, StateType } from '@/features'
import { lazyFeatures } from '@/features/lazy-features'
import type { PresenceContext } from '@/components/animate-presence/presence'

// Map to track mounted motion states by element
export const mountedStates = new WeakMap<Element, MotionState>()

/**
 * Core class that manages animation state and orchestrates animations.
 * Handles component lifecycle methods in the correct order based on component tree position.
 */
export class MotionState {
  public type: 'html' | 'svg'
  public element: HTMLElement | SVGElement | null = null
  // Parent reference for handling component tree relationships
  public parent?: MotionState

  // Whether the element is exiting
  public isExiting = false
  // The AnimatePresence container this motion component belongs to
  public presenceContainer: HTMLElement | null = null
  public options: Options & {
    animatePresenceContext?: PresenceContext
    features?: Array<typeof Feature>
  }

  // Track child components for proper lifecycle ordering
  private children?: Set<MotionState> = new Set()

  // Initial style values, serves as fallback before visualElement exists
  public latestValues: DOMKeyframesDefinition

  // Feature instances managed by key
  private features = new Map<FeatureKey, Feature>()

  // Visual element instance from Framer Motion
  public visualElement: VisualElement<Element>

  constructor(options: Options, parent?: MotionState) {
    this.options = options
    this.parent = parent
    // Add to parent's children set for lifecycle management
    parent?.children?.add(this)

    // Initialize with either initial or animate variant
    const initial = (options.initial === undefined && options.variants) ? this.context.initial : options.initial
    const initialVariantSource = initial === false ? ['initial', 'animate'] : ['initial']
    this.resolveInitialLatestValues(initialVariantSource)
    this.type = isSVGElement(this.options.as as any) ? 'svg' : 'html'
  }

  private _context: MotionStateContext | null = null

  // Get animation context, falling back to parent context for inheritance
  get context() {
    if (!this._context) {
      const handler = {
        get: (target: MotionStateContext, prop: keyof MotionStateContext) => {
          const value = this.options[prop]
          if (isVariantLabel(value) || (prop === 'initial' && value === false)) {
            return value
          }
          return this.parent?.context[prop]
        },
      }

      this._context = new Proxy({} as MotionStateContext, handler)
    }
    return this._context
  }

  // Resolve initial style values from variant sources
  private resolveInitialLatestValues(initialVariantSource: string[]) {
    const custom = this.options.custom ?? this.options.animatePresenceContext?.custom
    this.latestValues = initialVariantSource.reduce((acc, variant) => {
      return {
        ...acc,
        ...resolveVariant(this.options[variant] || this.context[variant], this.options.variants, custom),
      }
    }, {})
  }

  /**
   * Initialize features from options and global lazy features
   * Features are stored by key to avoid duplicate instantiation
   */
  updateFeatures() {
    if (!this.visualElement)
      return
    for (const FeatureCtor of lazyFeatures) {
      if (!this.features.has(FeatureCtor.key)) {
        this.features.set(FeatureCtor.key, new FeatureCtor(this))
      }
      const feature = this.features.get(FeatureCtor.key)
      if (this.isMounted()) {
        if (!feature.isMount) {
          feature.mount()
          feature.isMount = true
        }
        else {
          feature.update()
        }
      }
    }
  }

  // Update visual element with new options
  updateOptions(options: Options) {
    this.options = options
    this.visualElement?.update({
      ...this.options as any,
      whileTap: this.options.whilePress,
    }, null as any)
  }

  // Mount motion state to DOM element, handles parent-child relationships
  mount(element: HTMLElement | SVGElement) {
    invariant(
      Boolean(element),
      'Animation state must be mounted with valid Element',
    )
    mountedStates.set(element, this)
    this.element = element
    this.visualElement?.mount(element)
    this.updateFeatures()
  }

  // Called before unmounting, executes in child-to-parent order
  beforeUnmount() {
    this.getSnapshot(this.options, false)
  }

  unmount() {
    this.parent?.children?.delete(this)
    mountedStates.delete(this.element)
    this.features.forEach(f => f.unmount?.())
    this.visualElement?.unmount()
  }

  // Called before updating, executes in parent-to-child order
  beforeUpdate() {
    this.getSnapshot(this.options, undefined)
  }

  // Update motion state with new options
  update(options: Options) {
    this.updateOptions(options)
    this.updateFeatures()
    this.didUpdate()
  }

  tryExitComplete() {
    if (this.isExiting)
      return
    if (this.options?.layoutId
      && this.visualElement.projection?.currentAnimation?.state === 'running') {
      return
    }
    this.options.animatePresenceContext?.onMotionExitComplete?.(this.presenceContainer, this)
  }

  // Set animation state active status and propagate to children
  setActive(name: StateType, isActive: boolean) {
    if (name === 'exit' && isActive) {
      this.isExiting = true
    }
    this.visualElement?.animationState?.setActive(name as AnimationType, isActive)
      .then(() => {
        if (name === 'exit' && isActive) {
          this.isExiting = false
          this.options?.layoutId
            ? frame.postRender(() => this.tryExitComplete())
            : this.tryExitComplete()
        }
      })
  }

  isMounted() {
    return Boolean(this.element)
  }

  getSnapshot(options: Options, isPresent?: boolean) {}
  didUpdate() {}
}
