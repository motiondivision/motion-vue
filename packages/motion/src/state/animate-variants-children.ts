import type { MotionState } from '@/state/motion-state'
import { transformResetValue } from '@/state/transform'
import { getOptions, resolveVariant } from '@/state/utils'
import type { AnimateOptions, AnimationFactory } from '@/types'
import type { DynamicAnimationOptions } from 'framer-motion'
import { animate } from 'framer-motion/dom'

export type ActiveVariant = {
  [key: string]: {
    definition: string
    transition: AnimateOptions
  }
}
export function animateVariantsChildren(state: MotionState, activeState: ActiveVariant) {
  const variantChildren = state.visualElement.variantChildren
  if (!variantChildren?.size)
    return () => Promise.resolve()

  const animationFactories: AnimationFactory[] = []

  Array.from(variantChildren).forEach((child, index) => {
    for (const name in activeState) {
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

      for (const key in variant) {
        if (child.latestValues[key] !== variant[key]) {
          animationOptions[key] = getOptions(
            Object.assign({}, variant.transition, child.props.transition),
            key,
          )
          animationFactories.push(
            () => {
              return animate(
                child.current,
                {
                  [key]: variant[key] === 'none' ? transformResetValue[key] : variant[key],
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

  return () => {
    return Promise.all(animationFactories.map(factory => factory()))
  }
}
