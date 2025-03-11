import type { DOMKeyframesDefinition, VisualElement } from 'framer-motion'
import { animate, noop } from 'framer-motion/dom'
import type { $Transition, AnimationFactory, Options, Variant } from '@/types'
import { getOptions, hasChanged, resolveVariant } from '@/state/utils'
import { style } from '@/state/style'
import { transformResetValue } from '@/state/transform'
import { motionEvent } from '@/state/event'
import type { MotionState } from './motion-state'
import { isDef } from '@vueuse/core'
import { isAnimationControls } from '@/animation/utils'

// 定义所有可用的动画状态类型
const STATE_TYPES = ['initial', 'animate', 'whileInView', 'whileHover', 'whilePress', 'whileDrag', 'whileFocus', 'exit'] as const
export type StateType = typeof STATE_TYPES[number]

/**
 * 核心动画更新函数,处理所有动画状态变化和执行
 * @param controlActiveState - 需要更新的动画状态
 * @param controlDelay - 动画延迟时间
 * @param directAnimate - 直接动画目标值
 * @param directTransition - 直接动画过渡配置
 */
export function animateUpdates(
  this: MotionState,
  {
    controlActiveState = undefined,
    controlDelay = 0,
    directAnimate,
    directTransition,
    isFallback = false,
    isExit = false,
  }: {
    controlActiveState?: Partial<Record<string, boolean>>
    controlDelay?: number
    directAnimate?: Options['animate']
    directTransition?: $Transition
    isFallback?: boolean
    isExit?: boolean
  } = {},
) {
  const prevTarget = this.target
  this.target = { ...this.baseTarget }
  let animationOptions: Record<string, $Transition> = {}
  const transition = { ...this.options.transition }
  // 处理直接动画或状态动画
  if (directAnimate)
    animationOptions = resolveDirectAnimation.call(this, directAnimate, directTransition, animationOptions)
  else
    animationOptions = resolveStateAnimation.call(this, controlActiveState, transition)
  const factories = createAnimationFactories.call(this, prevTarget, animationOptions, controlDelay)
  const { getChildAnimations, childAnimations } = setupChildAnimations.call(this, transition, this.activeStates, isFallback)

  return executeAnimations.call(this, {
    factories,
    getChildAnimations,
    childAnimations,
    transition,
    controlActiveState,
    isExit,
  })
}

/**
 * 解析直接动画配置
 */
function resolveDirectAnimation(
  this: MotionState,
  directAnimate: Options['animate'],
  directTransition: $Transition | undefined,
) {
  const variant = resolveVariant(directAnimate, this.options.variants, this.options.custom)
  if (!variant)
    return {}

  const transition = { ...this.options.transition, ...(directTransition || variant.transition) }
  const animationOptions = {}
  Object.entries(variant).forEach(([key, value]) => {
    if (key === 'transition')
      return
    this.target[key] = value
    animationOptions[key] = getOptions(transition, key)
  })
  return animationOptions
}

/**
 * 解析状态动画配置
 */
function resolveStateAnimation(
  this: MotionState,
  controlActiveState: Partial<Record<string, boolean>> | undefined,
  transition: $Transition,
) {
  if (controlActiveState)
    this.activeStates = { ...this.activeStates, ...controlActiveState }

  const transitionOptions = {}
  let variantTransition = {}
  let variant: Variant = {}
  STATE_TYPES.forEach((name) => {
    if (!this.activeStates[name] || isAnimationControls(this.options[name]))
      return

    const definition = this.options[name]
    let resolvedVariant = isDef(definition) ? resolveVariant(definition as any, this.options.variants, this.options.custom) : undefined
    // If current node is a variant node, merge the control node's variant
    if (this.visualElement.isVariantNode) {
      const controlVariant = resolveVariant(this.context[name], this.options.variants, this.options.custom)
      resolvedVariant = controlVariant ? Object.assign(controlVariant || {}, resolvedVariant) : variant
    }
    if (!resolvedVariant)
      return
    if (name !== 'initial')
      variantTransition = resolvedVariant.transition || this.options.transition
    variant = Object.assign(variant, resolvedVariant)
  })
  Object.assign(transition, variantTransition)
  Object.entries(variant).forEach(([key, value]) => {
    if (key === 'transition')
      return
    this.target[key] = value
    transitionOptions[key] = getOptions(transition, key)
  })
  return transitionOptions
}

/**
 * 创建动画工厂函数
 */
function createAnimationFactories(
  this: MotionState,
  prevTarget: DOMKeyframesDefinition,
  animationOptions: Record<string, $Transition>,
  controlDelay: number,
): AnimationFactory[] {
  const factories: AnimationFactory[] = []

  Object.keys(this.target).forEach((key: any) => {
    if (!hasChanged(prevTarget[key], this.target[key]))
      return
    this.baseTarget[key] ??= style.get(this.element, key) as string
    const keyValue = (this.target[key] === 'none' && isDef(transformResetValue[key])) ? transformResetValue[key] : this.target[key]
    const targetTransition = animationOptions[key]
    factories.push(() => animate(
      this.element,
      { [key]: keyValue },
      {
        ...targetTransition,
        delay: (targetTransition?.delay || 0) + controlDelay,
      } as any,
    ))
  })

  return factories
}

/**
 * 设置子元素动画
 * 处理交错动画和子元素延迟
 */
function setupChildAnimations(
  this: MotionState,
  transition: $Transition | undefined,
  controlActiveState: Partial<Record<string, boolean>> | undefined,
  isFallback: boolean,
) {
  if (!this.visualElement.variantChildren?.size || !controlActiveState)
    return { getChildAnimations: () => Promise.resolve(), childAnimations: [] }

  const { staggerChildren = 0, staggerDirection = 1, delayChildren = 0 } = transition || {}
  const maxStaggerDuration = (this.visualElement.variantChildren.size - 1) * staggerChildren
  const generateStaggerDuration = staggerDirection === 1
    ? (i = 0) => i * staggerChildren
    : (i = 0) => maxStaggerDuration - i * staggerChildren

  const childAnimations = Array.from(this.visualElement.variantChildren)
    .map((child: VisualElement & { state: MotionState }, index) => {
      const childDelay = delayChildren + generateStaggerDuration(index)
      return child.state.animateUpdates({
        controlActiveState,
        controlDelay: isFallback ? 0 : childDelay,
      })
    })
    .filter(Boolean) as (() => Promise<any>)[]

  return {
    getChildAnimations: () => Promise.all(childAnimations.map((animation) => {
      return animation?.()
    })),
    childAnimations,
  }
}

/**
 * 执行动画
 * 处理动画顺序、事件分发和完成回调
 */
function executeAnimations(
  this: MotionState,
  {
    factories,
    getChildAnimations,
    childAnimations,
    transition,
    controlActiveState,
    isExit = false,
  }: {
    factories: AnimationFactory[]
    getChildAnimations: () => Promise<any>
    childAnimations: (() => Promise<any>)[]
    transition: $Transition | undefined
    controlActiveState: Partial<Record<string, boolean>> | undefined
    isExit: boolean
  },
) {
  const getAnimation = () => Promise.all(factories.map(factory => factory()).filter(Boolean))

  const animationTarget = { ...this.target }
  const element = this.element

  // 完成动画并分发事件
  const finishAnimation = (animationPromise: Promise<any>) => {
    element.dispatchEvent(motionEvent('motionstart', animationTarget))
    animationPromise
      .then(() => {
        element.dispatchEvent(motionEvent('motioncomplete', animationTarget, isExit))
      })
      .catch(noop)
  }
  // 获取动画Promise
  const getAnimationPromise = () => {
    const animationPromise = transition?.when
      ? (transition.when === 'beforeChildren' ? getAnimation() : getChildAnimations())
          .then(() => (transition.when === 'beforeChildren' ? getChildAnimations() : getAnimation()))
      : Promise.all([getAnimation(), getChildAnimations()])

    finishAnimation(animationPromise)
    return animationPromise
  }

  return controlActiveState ? getAnimationPromise : getAnimationPromise()
}
