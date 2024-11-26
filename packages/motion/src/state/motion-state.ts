import type { AnimationFactory, MotionStateContext, Options } from '@/types'
import { invariant } from 'hey-listen'
import { visualElementStore } from 'framer-motion/dist/es/render/store.mjs'
import { createDOMVisualElement } from 'framer-motion/dist/es/animation/utils/create-visual-element.mjs'
import { isDef } from '@vueuse/core'
import type { DOMKeyframesDefinition, DynamicAnimationOptions, VisualElement } from 'framer-motion'
import { animate } from 'framer-motion/dom'
import { getOptions, hasChanged, noop, resolveVariant } from '@/state/utils'
import { FeatureManager } from '@/features'
import { style } from '@/state/style'
import { transformResetValue } from '@/state/transform'
import { scheduleAnimation, unscheduleAnimation } from '@/state/schedule'
import { motionEvent } from '@/state/event'

const STATE_TYPES = ['initial', 'animate', 'inView', 'hover', 'press', 'exit', 'drag'] as const
type StateType = typeof STATE_TYPES[number]
export const mountedStates = new WeakMap<Element, MotionState>()

export class MotionState {
  private element: HTMLElement | null = null
  private context: MotionStateContext = {}

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
    this.initContext()
    const initialVariantSource = options.initial === false ? 'animate' : 'initial'
    this.featureManager = new FeatureManager(this)
    /**
     * 初始化baseTarget、target
     */
    this.initTarget(initialVariantSource)
  }

  private initContext() {
    for (const name of STATE_TYPES) {
      // 为每个状态类型设置上下文
      // 如果options中对应的状态类型是字符串，则直接使用
      // 否则，尝试从父级上下文中获取对应的状态类型值
      this.context[name as keyof typeof this.context]
        = typeof this.options[name] === 'string'
          ? this.options[name]
          : this.parent?.context[name]
    }
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
      createDOMVisualElement(element)
    }
    const visualElement = visualElementStore.get(element)
    this.visualElement = visualElement
    visualElement.update(this.options as any, this.parent?.context as any)
    if (typeof this.initial === 'object') {
      for (const key in this.initial) {
        visualElement.setStaticValue(key, this.initial[key])
      }
    }
    else if (typeof this.initial === 'string' && this.options.variants) {
      for (const key in this.options.variants[this.initial]) {
        visualElement.setStaticValue(key, this.options.variants[this.initial][key])
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
    const resolvedVariants: { [key: string]: DOMKeyframesDefinition } = {}
    const enteringInto: { [key: string]: string } = {}
    const animationOptions: { [key: string]: DynamicAnimationOptions } = {}

    for (const name of STATE_TYPES) {
      if (!this.activeStates[name])
        continue

      const variant = resolveVariant(
        isDef(this.options[name]) ? this.options[name] : this.context[name],
        this.options.variants,
      )
      if (!variant)
        continue

      resolvedVariants[name] = variant

      const allTarget = { ...prevTarget, ...variant }
      for (const key in allTarget) {
        if (key === 'transition')
          continue

        this.target[key] = variant[key]

        animationOptions[key] = getOptions(
          variant.transition ?? this.options.transition ?? {},
          key,
        )

        enteringInto[key] = name
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

    // Wait for all animation states to read from the DOM
    yield

    const animations = animationFactories
      .map(factory => factory())
      .filter(Boolean)

    if (!animations.length)
      return

    const animationTarget = this.target
    this.element.dispatchEvent(motionEvent('motionstart', animationTarget))
    const isExit = this.activeStates.exit
    Promise.all(animations)
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

  getElement() {
    return this.element
  }

  getTarget() {
    return this.target
  }
}
