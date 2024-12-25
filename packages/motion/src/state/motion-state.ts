import type { AnimateOptions, AnimationFactory, MotionStateContext, Options } from '@/types'
import { invariant } from 'hey-listen'
import { visualElementStore } from 'framer-motion/dist/es/render/store.mjs'
import { isDef } from '@vueuse/core'
import type { AnimationPlaybackControls, DOMKeyframesDefinition, DynamicAnimationOptions, VisualElement } from 'framer-motion'
import { animate, noop } from 'framer-motion/dom'
import { getOptions, hasChanged, resolveVariant } from '@/state/utils'
import { FeatureManager } from '@/features'
import { style } from '@/state/style'
import { transformResetValue } from '@/state/transform'
import { scheduleAnimation, unscheduleAnimation } from '@/state/schedule'
import { motionEvent } from '@/state/event'
import { createVisualElement } from '@/state/create-visual-element'
import { type ActiveVariant, animateVariantsChildren } from '@/state/animate-variants-children'
import { doneCallbacks } from '@/components/presence'

const STATE_TYPES = ['initial', 'animate', 'inView', 'hover', 'press', 'whileDrag', 'exit'] as const
type StateType = typeof STATE_TYPES[number]
export const mountedStates = new WeakMap<Element, MotionState>()
let id = 0
export class MotionState {
  public readonly id: string
  public element: HTMLElement | null = null
  private parent?: MotionState
  public options: Options

  private isFirstAnimate = true
  public activeStates: Partial<Record<StateType, boolean>> = {
    initial: true,
    animate: true,
  }

  public depth: number

  public baseTarget: DOMKeyframesDefinition

  public target: DOMKeyframesDefinition
  private featureManager: FeatureManager

  public visualElement: VisualElement<Element>

  constructor(options: Options, parent?: MotionState) {
    this.id = `motion-state-${id++}`
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
            : this.parent?.context[prop]
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

  mount(element: HTMLElement, options: Options) {
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
    // 添加state引用到visualElement
    (this.visualElement as any).state = this

    this.updateOptions()

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
    scheduleAnimation(this as any)
  }

  beforeUnmount() {
    this.featureManager.beforeUnmount()
  }

  unmount() {
    mountedStates.delete(this.element)
    unscheduleAnimation(this as any)
    visualElementStore.get(this.element)?.unmount()
    // 卸载特征
    this.featureManager.unmount()
  }

  beforeUpdate() {
    this.featureManager.beforeUpdate()
  }

  update(options: Options) {
    this.options = options
    this.updateOptions()
    // 更新特征
    this.featureManager.update()
    // 更新动画
    scheduleAnimation(this as any)
  }

  setActive(name: StateType, isActive: boolean) {
    if (!this.element || this.activeStates[name] === isActive)
      return
    this.activeStates[name] = isActive
    this.visualElement.variantChildren?.forEach((child) => {
      ((child as any).state as MotionState).setActive(name, isActive)
    })
    scheduleAnimation(this)
  }

  * animateUpdates() {
    const prevTarget = this.target
    this.target = {}
    const activeState: ActiveVariant = {}
    const animationOptions: { [key: string]: DynamicAnimationOptions } = {}
    let transition: AnimateOptions

    for (const name of STATE_TYPES) {
      if (name === 'initial') {
        if (!this.isFirstAnimate) {
          continue
        }
        this.isFirstAnimate = false
      }
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
        const keyValue = this.target[key] === 'none' ? transformResetValue[key] : this.target[key]
        animationFactories.push(
          () => {
            return animate(
              this.element,
              {
                [key]: keyValue,
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
    const isExit = this.activeStates.exit

    if (!animations?.length && !childAnimations.length) {
      if (isExit) {
        this.element.dispatchEvent(motionEvent('motionstart', this.target))
        this.element.dispatchEvent(motionEvent('motioncomplete', {
          ...this.target,
        }, isExit))
      }
      return
    }
    const animationTarget = this.target
    this.element.dispatchEvent(motionEvent('motionstart', animationTarget))
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

  getOptions() {
    return this.options
  }

  willUpdate(label: string) {
    // console.log('willUpdate', label)
    if (!this.visualElement.projection?.isLayoutDirty) {
      const layoutGroup = this.options.layoutGroup
      if (layoutGroup?.group && label === 'beforeUpdate') {
        layoutGroup.group?.dirty()
      }
      else {
        this.visualElement.projection?.willUpdate()
      }
    }
  }
}
