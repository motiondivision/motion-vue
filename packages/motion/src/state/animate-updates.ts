import type { AnimationPlaybackControls, DOMKeyframesDefinition, VisualElement } from 'framer-motion'
import { animate, noop } from 'framer-motion/dom'
import type { $Transition, AnimationFactory, Options } from '@/types'
import { getOptions, hasChanged, resolveVariant } from '@/state/utils'
import { style } from '@/state/style'
import { transformResetValue } from '@/state/transform'
import { motionEvent } from '@/state/event'
import type { MotionState } from './motion-state'
import { isDef } from '@vueuse/core'
import { isAnimationControls } from '@/animation/utils'

// 定义所有可用的动画状态类型
const STATE_TYPES = ['initial', 'animate', 'inView', 'hover', 'press', 'whileDrag', 'focus', 'exit'] as const
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
  }: {
    controlActiveState?: Partial<Record<string, boolean>>
    controlDelay?: number
    directAnimate?: Options['animate']
    directTransition?: $Transition
    isFallback?: boolean
  } = {},
) {
  const prevTarget = this.target
  this.target = { ...this.baseTarget }
  const animationOptions: Record<string, $Transition> = {}
  const transition = { ...this.options.transition }

  // 处理直接动画或状态动画
  if (directAnimate)
    resolveDirectAnimation.call(this, directAnimate, directTransition, animationOptions)
  else
    resolveStateAnimation.call(this, controlActiveState, animationOptions)

  const factories = createAnimationFactories.call(this, prevTarget, animationOptions, controlDelay)
  const { getChildAnimations, childAnimations } = setupChildAnimations.call(this, transition, controlActiveState, isFallback)

  return executeAnimations.call(this, factories, getChildAnimations, childAnimations, transition, controlActiveState)
}

/**
 * 解析直接动画配置
 */
function resolveDirectAnimation(
  this: MotionState,
  directAnimate: Options['animate'],
  directTransition: $Transition | undefined,
  animationOptions: Record<string, $Transition>,
) {
  const variant = resolveVariant(directAnimate, this.options.variants, this.options.custom)
  if (!variant)
    return

  const transition = { ...this.options.transition, ...(directTransition || variant.transition) }

  Object.entries(variant).forEach(([key, value]) => {
    if (key === 'transition')
      return
    this.target[key] = value
    animationOptions[key] = getOptions(transition, key)
  })
}

/**
 * 解析状态动画配置
 */
function resolveStateAnimation(
  this: MotionState,
  controlActiveState: Partial<Record<string, boolean>> | undefined,
  animationOptions: Record<string, $Transition>,
) {
  if (controlActiveState)
    this.activeStates = { ...this.activeStates, ...controlActiveState }

  STATE_TYPES.forEach((name) => {
    if (!this.activeStates[name] || isAnimationControls(this.options[name]))
      return

    const definition = isDef(this.options[name]) ? this.options[name] : this.context[name]
    const variant = resolveVariant(definition, this.options.variants, this.options.custom)
    if (!variant)
      return

    const transition = { ...this.options.transition, ...variant.transition }
    Object.entries(variant).forEach(([key, value]) => {
      if (key === 'transition')
        return
      this.target[key] = value
      animationOptions[key] = getOptions(transition, key)
    })
  })
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

  new Set(Object.keys(this.target)).forEach((key: any) => {
    if (!hasChanged(this.visualElement.getValue(key), this.target[key]))
      return

    this.baseTarget[key] ??= style.get(this.element, key) as string
    const keyValue = this.target[key] === 'none' ? transformResetValue[key] : this.target[key]
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
  if (!this.visualElement.variantChildren?.size || controlActiveState)
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
        controlActiveState: this.activeStates,
        controlDelay: isFallback ? 0 : childDelay,
      })
    })
    .filter(Boolean) as (() => Promise<any>)[]

  return {
    getChildAnimations: () => Promise.all(childAnimations.map(animation => animation())),
    childAnimations,
  }
}

/**
 * 执行动画
 * 处理动画顺序、事件分发和完成回调
 */
function executeAnimations(
  this: MotionState,
  factories: AnimationFactory[],
  getChildAnimations: () => Promise<any>,
  childAnimations: (() => Promise<any>)[],
  transition: $Transition | undefined,
  controlActiveState: Partial<Record<string, boolean>> | undefined,
) {
  let animations: AnimationPlaybackControls[]
  const getAnimation = () => {
    animations = factories.map(factory => factory()).filter(Boolean)
    return Promise.all(animations)
  }

  const isExit = this.activeStates.exit
  const animationTarget = { ...this.target }
  const element = this.element

  // 完成动画并分发事件
  const finishAnimation = (animationPromise: Promise<any>) => {
    if (!animations?.length && !childAnimations.length) {
      if (isExit) {
        element.dispatchEvent(motionEvent('motionstart', animationTarget))
        element.dispatchEvent(motionEvent('motioncomplete', animationTarget, isExit))
      }
      return
    }

    element.dispatchEvent(motionEvent('motionstart', animationTarget))
    animationPromise
      .then(() => element.dispatchEvent(motionEvent('motioncomplete', animationTarget, isExit)))
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
