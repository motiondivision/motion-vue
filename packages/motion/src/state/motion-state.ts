import type { MotionStateContext, Options } from '@/types'
import { invariant } from 'hey-listen'
import { visualElementStore } from 'framer-motion/dist/es/render/store.mjs'
import { isDef } from '@vueuse/core'
import type { DOMKeyframesDefinition, VisualElement } from 'framer-motion'
import { frame } from 'framer-motion/dom'
import { resolveVariant } from '@/state/utils'
import { FeatureManager } from '@/features'
import { createVisualElement } from '@/state/create-visual-element'
import { doneCallbacks } from '@/components/presence'
import type { StateType } from './animate-updates'
import { animateUpdates } from './animate-updates'

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
      this.animateUpdates({
        isFallback: !isActive,
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

  willUpdate(label: string) {
    this.visualElement.projection?.willUpdate()
  }
}
