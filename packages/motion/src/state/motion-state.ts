import type { MotionStateContext, Options } from '@/types'
import { invariant } from 'hey-listen'
import type { AnimationType, DOMKeyframesDefinition, VisualElement, VisualElementOptions } from 'motion-dom'
import { frame, isVariantLabel } from 'motion-dom'
import { isSVGElement, resolveInitialValues } from '@/state/utils'
import type { Feature, FeatureKey, StateType } from '@/features'
import { lazyFeatures } from '@/features/lazy-features'
import type { PresenceContext } from '@/components/animate-presence/presence'
import { motionGlobalConfig } from '@/config'

// Map to track mounted motion states by element
export const mountedStates = new WeakMap<Element, MotionState>()

/**
 * Normalize public options to upstream (motion-dom) naming.
 * The public API prop is `whilePress`; motion-dom internals speak
 * `whileTap`. This boundary is the ONLY place the translation happens —
 * everything downstream (animationState, setActive, variantProps)
 * uses upstream names.
 */
function toUpstreamProps(options: Options): Options & { whileTap: Options['whilePress'] } {
  return { ...options, whileTap: options.whilePress }
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

  // Whether the element is exiting
  public isExiting = false
  // The AnimatePresence container this motion component belongs to
  public presenceContainer: HTMLElement | null = null
  public options: Options & {
    presenceContext?: PresenceContext
    features?: Array<typeof Feature>
  }

  // Track child components for proper lifecycle ordering
  private children?: Set<MotionState> = new Set()

  // Initial style values, serves as fallback before visualElement exists
  public latestValues: DOMKeyframesDefinition

  // Feature instances managed by key
  private features = new Map<FeatureKey, Feature>()

  // Visual element instance from Framer Motion (assigned by initVisualElement)
  public visualElement!: VisualElement<Element>

  constructor(options: Options, parent?: MotionState) {
    this.options = options
    this.parent = parent
    // Add to parent's children set for lifecycle management
    parent?.children?.add(this)

    this.latestValues = resolveInitialValues(options, this.context)
    this.type = isSVGElement(this.options.as as any) ? 'svg' : 'html'
  }

  private _context: MotionStateContext | null = null

  // Get animation context, falling back to parent context for inheritance
  get context() {
    if (!this._context) {
      const handler = {
        get: (target: MotionStateContext, prop: keyof MotionStateContext) => {
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
      const feature = this.features.get(FeatureCtor.key)!
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
    this.visualElement?.update(
      toUpstreamProps(this.options) as any,
      // @ts-expect-error — VisualElement.update's second arg types presenceContext as PresenceContextProps, not our narrowed data shape
      this.options.presenceContext ?? null,
    )
  }

  // Mount motion state to DOM element, handles parent-child relationships
  mount(element: HTMLElement | SVGElement) {
    invariant(
      Boolean(element),
      'Animation state must be mounted with valid Element',
    )
    mountedStates.set(element, this)
    this.element = element
    const presenceId = this.options.presenceContext?.presenceId
    if (presenceId !== undefined) {
      element.setAttribute(motionGlobalConfig.motionAttribute, presenceId)
    }
    this.visualElement?.mount(element)
    this.updateFeatures()
  }

  // Called before unmounting, executes in child-to-parent order
  beforeUnmount() {
    this.getSnapshot(this.options, false)
  }

  unmount() {
    this.parent?.children?.delete(this)
    if (this.element)
      mountedStates.delete(this.element)
    this.settleExit()
    this.features.forEach(f => f.unmount?.())
    this.visualElement?.unmount()
  }

  // Called before updating, executes in parent-to-child order
  beforeUpdate() {
    this.getSnapshot(this.options, undefined)
  }

  // Update motion state with new options
  update() {
    this.updateFeatures()
    this.didUpdate()
  }

  // ===== Presence exit protocol =====
  // Generation counter: bumped by exit() and reenter(). A completion carrying
  // a stale generation is a silent no-op — this is how mid-exit reentry and
  // re-entry-then-exit-again sequences stay consistent.
  private exitGeneration = 0
  private pendingExit?: { resolve: () => void }

  /**
   * Run the full exit sequence for AnimatePresence and resolve when this
   * state's exit completes — including the layoutId projection handoff,
   * which is signalled back via completeExitFromProjection().
   */
  exit(container: HTMLElement): Promise<void> {
    const generation = ++this.exitGeneration
    this.presenceContainer = container
    this.isExiting = true

    const completion = new Promise<void>((resolve) => {
      this.pendingExit = { resolve }
    })

    const exitAnimation = this.visualElement?.animationState?.setActive('exit' as AnimationType, true)
    if (exitAnimation) {
      exitAnimation.then(() => {
        if (generation !== this.exitGeneration)
          return
        this.isExiting = false
        this.options?.layoutId
          ? frame.postRender(() => this.tryCompleteExit(generation))
          : this.tryCompleteExit(generation)
      })
    }
    else {
      this.isExiting = false
      this.tryCompleteExit(generation)
    }

    this.getSnapshot(this.options, false)
    return completion
  }

  /** Re-enter while an exit is in flight; the stale exit resolves silently. */
  reenter() {
    this.exitGeneration++
    this.settleExit()
    this.isExiting = false
    this.setActive('exit', false)
    this.getSnapshot(this.options, true)
  }

  /** ProjectionFeature notifies here when a layoutId exit handoff completes. */
  completeExitFromProjection() {
    this.tryCompleteExit(this.exitGeneration)
  }

  private tryCompleteExit(generation: number) {
    if (generation !== this.exitGeneration || this.isExiting)
      return
    if (this.options?.layoutId
      && this.visualElement.projection?.currentAnimation?.state === 'running') {
      return
    }
    this.settleExit()
  }

  private settleExit() {
    this.pendingExit?.resolve()
    this.pendingExit = undefined
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
   * Create and attach a visual element using the given renderer.
   * Shared by both the Motion component and v-motion directive.
   */
  initVisualElement(renderer: (tag: string, options: VisualElementOptions<any, any>) => VisualElement<Element>) {
    if (this.visualElement)
      return
    this.visualElement = renderer(this.options.as as string, {
      // @ts-expect-error — VisualElementOptions types presenceContext as PresenceContextProps, not our narrowed data shape
      presenceContext: this.options.presenceContext ?? null,
      parent: this.parent?.visualElement,
      props: toUpstreamProps(this.options) as any,
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

  getSnapshot(options: Options, isPresent?: boolean) {}
  didUpdate() {}
}
