import type { MotionState } from '@/state/motion-state'
import { style } from '@/state/style'
import { transformResetValue } from '@/state/transform'
import { getOptions, hasChanged, resolveVariant } from '@/state/utils'
import type { AnimateOptions, AnimationFactory } from '@/types'
import type { DynamicAnimationOptions, VisualElement } from 'framer-motion'
import { animate } from 'framer-motion/dom'

export type ActiveVariant = {
  [key: string]: {
    definition: string
    transition: AnimateOptions
  }
}
export function animateVariantsChildren(state: MotionState, activeState: ActiveVariant) {
  const variantChildren = state.visualElement.variantChildren
  if (!variantChildren?.size) {
    return {
      animations: [],
      getAnimations: () => Promise.resolve(),
    }
  }

  const animationFactories: AnimationFactory[] = []

  Array.from(variantChildren).forEach((child: VisualElement & { state: MotionState }, index) => {
    const prevTarget = child.state.target
    const childState = child.state
    childState.target = {}
    for (const name in activeState) {
      childState.activeStates[name] = true
      const { definition, transition } = activeState[name]
      const { staggerChildren = 0, staggerDirection = 1, delayChildren = 0 } = transition

      const maxStaggerDuration
    = (variantChildren.size - 1) * staggerChildren

      const generateStaggerDuration
    = staggerDirection === 1
      ? (i = 0) => i * staggerChildren
      : (i = 0) => maxStaggerDuration - i * staggerChildren

      const variant = resolveVariant(
        definition,
        child.props.variants,
        child.props.custom,
      )
      const animationOptions: { [key: string]: DynamicAnimationOptions } = {}

      const allTarget = { ...prevTarget, ...variant }
      console.log('allTarget', allTarget)
      for (const key in allTarget) {
        if (key === 'transition')
          continue

        childState.target[key] = allTarget[key]
        if (childState.target[key] === undefined) {
          childState.target[key] = childState.baseTarget[key]
        }
        if (hasChanged(prevTarget[key], childState.target[key])) {
          childState.baseTarget[key] ??= style.get(child.current as Element, key)
          console.log('childState.baseTarget[key]', childState.target[key])
          animationOptions[key] = getOptions(
            Object.assign({}, allTarget.transition, child.props.transition),
            key,
          )
          animationFactories.push(
            () => {
              return animate(
                child.current,
                {
                  [key]: childState.target[key] === 'none' ? transformResetValue[key] : childState.target[key],
                },
                {
                  ...(animationOptions[key] || {}),
                  delay: ((animationOptions[key]?.delay || 0) as number) + delayChildren + generateStaggerDuration(index),
                },
              )
            },
          )
        }
      }
    }
  })

  return {
    animations: animationFactories,
    getAnimations: () => Promise.all(animationFactories.map(factory => factory())),
  }
}
