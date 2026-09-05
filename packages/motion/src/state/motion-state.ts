import type { MotionStateContext, Options } from '@/types'
import { invariant } from 'hey-listen'
import type { AnimationType, DOMKeyframesDefinition, VisualElement, VisualElementOptions } from 'motion-dom'
import { isVariantLabel } from 'motion-dom'
import { isSVGElement, resolveInitialValues } from '@/state/utils'
import type { Feature, FeatureKey, StateType } from '@/features'
import type { PresenceContext } from '@/components/animate-presence/presence'

// Map to track mounted motion states by element
export const mountedStates = new WeakMap<Element, MotionState>()

export type VisualElementRenderer = (tag: string, options: VisualElementOptions<any, any>) => VisualElement<Element>

/**
 * The render + feature bundle a motion instance runs with — from the
 * component's own feature bundle or resolved asynchronously by LazyMotion.
 */
export interface MotionBundle {
  renderer?: VisualElementRenderer
  features?: Array<typeof Feature>
}

/**
 * Core class that manages animation state and orchestrates animations.
 * Handles component lifecycle methods in the correct order based on component tree position.
 */
export class MotionState {
  public type: 'html' | 'svg'
  public element: HTMLElement | SVGElement | null = null
  // Parent reference for handling component tree relationships
  public parent?: MotionState

  // Whether the element is exiting (driven by ExitFeature / setActive)
  public isExiting = false
  public options: Options & {
    presenceContext?: PresenceContext
  }

  // Track child components for proper lifecycle ordering
  private children?: Set<MotionState> = new Set()

  // Initial style values, serves as fallback before visualElement exists
  public latestValues: DOMKeyframesDefinition

  // Feature instances managed by key
  private features = new Map<FeatureKey, Feature>()
  // Feature constructors for this state only — set at construction,
  // replaced later via setBundle() (e.g. LazyMotion async resolution)
  private featureCtors: Array<typeof Feature> = []

  // Visual element instance from Framer Motion (created by setBundle via initVisualElement)
  public visualElement!: VisualElement<Element>

  constructor(options: Options, parent?: MotionState, bundle: MotionBundle = {}) {
    this.options = options
    this.parent = parent
    // Add to parent's children set for lifecycle management
    parent?.children?.add(this)

    this.latestValues = resolveInitialValues(options, this.context)
    this.type = isSVGElement(this.options.as as any) ? 'svg' : 'html'
    // Create the visual element and features eagerly when a renderer is
    // available — constructors run top-down, so parents exist before children
    this.setBundle(bundle)
  }

  private _context: MotionStateContext | null = null

  // Get animation context, falling back to parent context for inheritance
  get context() {
    if (!this._context) {
      const handler = {
        get: (_target: MotionStateContext, prop: keyof MotionStateContext) => {
          const value = this.options[prop as keyof Options]
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

  /**
   * Declare (or asynchronously resolve, e.g. LazyMotion) the render + feature
   * bundle for this state, then sync — the visual element and feature
   * instances are created lazily inside updateFeatures().
   */
  setBundle(bundle: MotionBundle) {
    if (bundle.renderer)
      this.initVisualElement(bundle.renderer)
    if (bundle.features?.length)
      this.featureCtors = bundle.features
    this.updateFeatures()
  }

  /**
   * Instantiate any missing features, then mount unmounted ones and update
   * the rest. Feature constructors dereference the visual element, so this
   * no-ops until setBundle() has created one. Feature mount is isMount-guarded,
   * so this is safe to call repeatedly and from any lifecycle stage.
   */
  updateFeatures() {
    if (!this.visualElement)
      return
    for (const FeatureCtor of this.featureCtors) {
      let feature = this.features.get(FeatureCtor.key)
      if (!feature) {
        feature = new FeatureCtor(this)
        this.features.set(FeatureCtor.key, feature)
      }
      if (!this.isMounted())
        continue
      if (feature.isMount) {
        feature.update()
      }
      else {
        feature.mount()
        feature.isMount = true
      }
    }
  }

  // Update visual element with new options
  updateOptions(options: Options) {
    this.options = options
    this.visualElement?.update({
      ...this.options as any,
      whileTap: this.options.whilePress,
      // @ts-expect-error — VisualElement.update's second arg types presenceContext as PresenceContextProps, not our narrowed data shape
    }, this.options.presenceContext ?? null)
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

  // Called before unmounting, lets features capture pre-removal state
  // (e.g. LayoutFeature's layout snapshot)
  beforeUnmount() {
    this.getSnapshot(false)
  }

  unmount() {
    this.parent?.children?.delete(this)
    if (this.element)
      mountedStates.delete(this.element)
    this.features.forEach((f) => {
      f.unmount()
      f.isMount = false
    })
    this.visualElement?.unmount()
    // Truthful isMounted() for KeepAlive remounts — the element reference
    // must not survive unmount.
    this.element = null
  }

  // Called before updating, executes in parent-to-child order
  beforeUpdate() {
    this.getSnapshot(!this.isExiting)
  }

  // Update motion state with new options
  update() {
    this.updateFeatures()
    this.didUpdate()
  }

  /** Access an installed feature by key, e.g. getFeature<ExitFeature>('exit') */
  getFeature<T extends Feature>(key: FeatureKey): T | undefined {
    return this.features.get(key) as T | undefined
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
        }
      })
  }

  isMounted() {
    return Boolean(this.element)
  }

  /**
   * Create and attach the visual element using the given renderer.
   * Called by setBundle(); no-ops once created.
   */
  private initVisualElement(renderer: VisualElementRenderer) {
    if (this.visualElement)
      return
    this.visualElement = renderer(this.options.as as string, {
      // @ts-expect-error — VisualElementOptions types presenceContext as PresenceContextProps, not our narrowed data shape
      presenceContext: this.options.presenceContext ?? null,
      parent: this.parent?.visualElement,
      props: { ...this.options, whileTap: this.options.whilePress } as any,
      visualState: {
        renderState: {
          transform: {},
          transformOrigin: {},
          style: {},
          vars: {},
          attrs: {},
        },
        latestValues: { ...this.latestValues } as any,
      },
      reducedMotionConfig: this.options.motionConfig?.reducedMotion,
    })
    this.visualElement.parent?.addChild(this.visualElement)
    if (this.isMounted()) {
      this.visualElement.mount(this.element!)
    }
  }

  getSnapshot(isPresent: boolean) {
    this.features.get('layout')?.getSnapshot(isPresent)
  }

  didUpdate() {}
}
