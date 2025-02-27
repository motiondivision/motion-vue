import type { MotionStateContext, Options } from '@/types'
import { invariant } from 'hey-listen'
import { visualElementStore } from 'framer-motion/dist/es/render/store.mjs'
import type { DOMKeyframesDefinition, VisualElement } from 'framer-motion'
import { frame } from 'framer-motion/dom'
import { isAnimateChanged, resolveVariant } from '@/state/utils'
import { FeatureManager } from '@/features'
import { createVisualElement } from '@/state/create-visual-element'
import { doneCallbacks } from '@/components/presence'
import type { StateType } from './animate-updates'
import { animateUpdates } from './animate-updates'

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
  public element: HTMLElement | null = null
  // Parent reference for handling component tree relationships
  private parent?: MotionState
  public options: Options
  public isSafeToRemove = false
  public isVShow = false
  // Track child components for proper lifecycle ordering
  private children?: Set<MotionState> = new Set()

  // Track which animation states are currently active
  public activeStates: Partial<Record<StateType, boolean>> = {
    initial: true,
    animate: true,
  }

  // Depth in component tree for lifecycle ordering
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
    // Add to parent's children set for lifecycle management
    parent?.children?.add(this)
    // Calculate depth in component tree
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

  // Get animation context, falling back to parent context for inheritance
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
    for (const key in this.baseTarget) {
      this.visualElement.setStaticValue(key, this.baseTarget[key])
    }

    this.target = { }
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

  // Called before mounting, executes in parent-to-child order
  beforeMount() {
    this.featureManager.beforeMount()
  }

  // Mount motion state to DOM element, handles parent-child relationships
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

    // Mount features in parent-to-child order
    this.featureManager.mount()
    if (!notAnimate && this.options.animate) {
      this.animateUpdates()
    }
    if (this.options.layoutId) {
      mountedLayoutIds.add(this.options.layoutId)
      frame.render(() => {
        mountedLayoutIds.clear()
      })
    }
  }

  // Called before unmounting, executes in child-to-parent order
  beforeUnmount() {
    this.featureManager.beforeUnmount()
  }

  // Unmount motion state and optionally unmount children
  // Handles unmounting in the correct order based on component tree
  unmount(unMountChildren = false) {
    /**
     * Unlike React, within the same update cycle, the execution order of unmount and mount depends on the component's order in the component tree.
     * Here we delay unmount for components with layoutId to ensure unmount executes after mount for layout animations.
     */
    const shouldDelay = this.options.layoutId && !mountedLayoutIds.has(this.options.layoutId)
    const unmount = () => {
      if (unMountChildren) {
        Array.from(this.children).reverse().forEach(this.unmountChild)
      }

      const unmountState = () => {
        this.parent?.children?.delete(this)
        mountedStates.delete(this.element)
        this.featureManager.unmount()
        this.visualElement?.unmount()
      }
      // Delay unmount if needed for layout animations
      if (shouldDelay) {
        Promise.resolve().then(unmountState)
      }
      else {
        unmountState()
      }
    }

    unmount()
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
    const hasAnimateChange = isAnimateChanged(this.options, options)
    this.options = options
    this.updateOptions()
    // Update features in parent-to-child order
    this.featureManager.update()

    if (hasAnimateChange) {
      this.animateUpdates()
    }
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
        isFallback: !isActive && name !== 'exit' && this.visualElement.isControllingVariants,
      })
    }
  }

  // Core animation update logic
  animateUpdates = animateUpdates

  isMounted() {
    return Boolean(this.element)
  }

  getOptions() {
    return this.options
  }

  // Called before layout updates to prepare for changes
  willUpdate(label: string) {
    if (this.options.layout || this.options.layoutId) {
      this.visualElement.projection?.willUpdate()
    }
  }
}
