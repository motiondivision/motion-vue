import type { AnimateOptions, AnimationFactory, MotionStateContext, Options } from '@/types'
import { invariant } from 'hey-listen'
import { visualElementStore } from 'framer-motion/dist/es/render/store.mjs'
import { isDef } from '@vueuse/core'
import type { AnimationPlaybackControls, DOMKeyframesDefinition, DynamicAnimationOptions, VisualElement } from 'framer-motion'
import { animate } from 'framer-motion/dom'
import { getOptions, hasChanged, noop, resolveVariant } from '@/state/utils'
import { FeatureManager } from '@/features'
import { style } from '@/state/style'
import { transformResetValue } from '@/state/transform'
import { scheduleAnimation, unscheduleAnimation } from '@/state/schedule'
import { motionEvent } from '@/state/event'
import { createVisualElement } from '@/state/create-visual-element'
import { type ActiveVariant, animateVariantsChildren } from '@/state/animate-variants-children'
import { ref } from 'vue'

const STATE_TYPES = ['initial', 'animate', 'inView', 'hover', 'press', 'exit', 'drag'] as const
type StateType = typeof STATE_TYPES[number]
export const mountedStates = new WeakMap<Element, MotionState>()

export class MotionState {
  public element: HTMLElement | null = null
  /**
   * when in AnimatePresence, whether the element is trigger exit transition
   */
  public isPresence = ref(true)
  private parent?: MotionState
  private options: Options
  private activeStates: Partial<Record<StateType, boolean>> = {
    initial: true,
    animate: true,
  }

  private depth: number

  private baseTarget: DOMKeyframesDefinition

  private target: DOMKeyframesDefinition
  private featureManager: FeatureManager

  public visualElement: VisualElement

  constructor(options: Options, parent?: MotionState) {
    this.options = options
    this.parent = parent
    this.depth = parent?.depth + 1 || 0

    /**
     * create visualElement
     */
    this.visualElement = createVisualElement(this.options.as!, {
      presenceContext: null,
      parent: parent?.visualElement,
      props: {
        ...this.options,
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
    })
    const initialVariantSource = options.initial === false ? 'animate' : 'initial'
    this.featureManager = new FeatureManager(this)
    /**
     * 初始化baseTarget、target
     */
    this.initTarget(initialVariantSource)
  }

  private _context: MotionStateContext | null = null

  get context() {
    if (!this._context) {
      const handler = {
        get: (target: MotionStateContext, prop: keyof MotionStateContext) => {
          return typeof this.options[prop] === 'string'
            ? this.options[prop]
            : (prop === 'initial') && this.parent?.context[prop]
        },
      }

      this._context = new Proxy({} as MotionStateContext, handler)
    }
    return this._context
  }

  private initTarget(initialVariantSource: string) {
    this.baseTarget = resolveVariant(this.options[initialVariantSource] || this.context[initialVariantSource], this.options.variants) || {}
    this.target = { ...this.baseTarget }
  }

  get initial() {
    return isDef(this.options.initial) ? this.options.initial : this.context.initial
  }

  mount(element: HTMLElement) {
    invariant(
      Boolean(element),
      'Animation state must be mounted with valid Element',
    )
    this.element = element
    mountedStates.set(element, this)
    if (!visualElementStore.get(element)) {
      this.visualElement.mount(element)
      visualElementStore.set(element, this.visualElement)
    }
    this.visualElement.update(this.options as any, this.parent?.context as any)
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

    // 挂载特征
    this.featureManager.mount()
  }

  unmount() {
    mountedStates.delete(this.element)
    unscheduleAnimation(this as any)
    visualElementStore.get(this.element)?.unmount()
    // 卸载特征
    this.featureManager.unmount()
  }

  update(options: Options) {
    this.options = options
    this.visualElement.update(this.options as any, this.parent?.context as any)
    // 更新特征
    this.featureManager.update()
    // 更新动画
    scheduleAnimation(this as any)
  }

  setActive(name: StateType, isActive: boolean) {
    if (!this.element)
      return
    this.activeStates[name] = isActive
    scheduleAnimation(this as any)
  }

  * animateUpdates() {
    const prevTarget = this.target
    this.target = {}
    const activeState: ActiveVariant = {}
    const animationOptions: { [key: string]: DynamicAnimationOptions } = {}
    let transition: AnimateOptions
    for (const name of STATE_TYPES) {
      if (!this.activeStates[name])
        continue
      const definition = isDef(this.options[name]) ? this.options[name] : this.context[name]
      const variant = resolveVariant(
        definition,
        this.options.variants,
        this.options.custom,
      )
      transition = Object.assign({}, this.options.transition, variant?.transition)
      if (typeof definition === 'string') {
        activeState[name] = {
          definition,
          transition,
        }
      }

      if (!variant)
        continue

      const allTarget = { ...prevTarget, ...variant }
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

    const allTargetKeys = new Set([
      ...Object.keys(this.target),
      ...Object.keys(prevTarget),
    ])

    const animationFactories: AnimationFactory[] = []
    allTargetKeys.forEach((key: any) => {
      if (this.target[key] === undefined) {
        this.target[key] = this.baseTarget[key]
      }
      if (hasChanged(prevTarget[key], this.target[key])) {
        this.baseTarget[key] ??= style.get(this.element, key) as string
        animationFactories.push(
          () => {
            return animate(
              this.element,
              {
                [key]: this.target[key] === 'none' ? transformResetValue[key] : this.target[key],
              },
              (animationOptions[key] || {}) as any,
            )
          },
        )
      }
    })

    let getChildAnimations: () => Promise<any> = () => Promise.resolve()
    let childAnimations: any[] = []

    // animate variants children
    if (Object.keys(activeState).length) {
      const { getAnimations, animations } = animateVariantsChildren(this, activeState)
      getChildAnimations = getAnimations
      childAnimations = animations
    }

    // Wait for all animation states to read from the DOM
    yield

    let animations: AnimationPlaybackControls[]
    const getAnimation = () => {
      animations = animationFactories
        .map(factory => factory())
        .filter(Boolean)
      return Promise.all(animations)
    }

    /**
     * If the transition explicitly defines a "when" option, we need to resolve either
     * this animation or all children animations before playing the other.
     */
    const { when } = transition

    let animationPromise: Promise<any>
    if (when) {
      const [first, last]
          = when === 'beforeChildren'
            ? [getAnimation, getChildAnimations]
            : [getChildAnimations, getAnimation]

      animationPromise = first().then(() => last())
    }
    else {
      animationPromise = Promise.all([getAnimation(), getChildAnimations()])
    }

    if (!animations?.length && !childAnimations.length)
      return
    const animationTarget = this.target
    this.element.dispatchEvent(motionEvent('motionstart', animationTarget))
    const isExit = this.activeStates.exit
    animationPromise
      .then(() => {
        this.element.dispatchEvent(motionEvent('motioncomplete', {
          ...animationTarget,
        }, isExit))
      })
      .catch(noop)
  }

  isMounted() {
    return Boolean(this.element)
  }

  getDepth() {
    return this.depth
  }

  getOptions() {
    return this.options
  }

  getTarget() {
    return this.target
  }
}
