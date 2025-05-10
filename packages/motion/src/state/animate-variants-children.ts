import type { MotionState } from '@/state/motion-state'
import { style } from '@/state/style'
import { transformResetValue } from '@/state/transform'
import { getOptions, hasChanged, resolveVariant } from '@/state/utils'
import type { $Transition, AnimationFactory } from '@/types'
import type { VisualElement } from 'framer-motion'
import { animate } from 'framer-motion/dom'

export type ActiveVariant = {
  [key: string]: {
    definition: string
    transition: $Transition
  }
}
export function animateVariantsChildren(state: MotionState, activeState: ActiveVariant, isFirstAnimate = false) {
  const variantChildren = state.visualElement.variantChildren

  if (!variantChildren?.size) {
    return {
      animations: [],
      getAnimations: () => Promise.resolve(),
    }
  }

  const animationFactories: AnimationFactory[] = []
  Array.from(variantChildren).forEach((child: VisualElement & { state: MotionState }, index) => {
    const prevTarget = isFirstAnimate ? child.state.baseTarget : child.state.target
    const childState = child.state
    childState.target = {}
    for (const name in activeState) {
      if (name === 'initial' && !isFirstAnimate) {
        continue
      }
      const { definition, transition } = activeState[name]
      const { staggerChildren = 0, staggerDirection = 1, delayChildren = 0 } = transition || {}
      const maxStaggerDuration
    = (variantChildren.size - 1) * staggerChildren

      const generateStaggerDuration
    = staggerDirection === 1
      ? (i = 0) => i * staggerChildren
      : (i = 0) => maxStaggerDuration - i * staggerChildren

      const variant = resolveVariant(
        definition,
        child.props.variants as any,
        child.props.custom,
      )
      const animationOptions: { [key: string]: $Transition } = {}

      const allTarget = { ...prevTarget, ...variant }
      for (const key in allTarget) {
        if (key === 'transition')
          continue

        childState.target[key] = allTarget[key]
        if (childState.target[key] === undefined) {
          childState.target[key] = childState.baseTarget[key]
        }
        if (hasChanged(prevTarget[key], childState.target[key])) {
          childState.baseTarget[key] ??= style.get(child.current as Element, key)
          animationOptions[key] = getOptions(
            Object.assign({}, transition, (allTarget as any).transition, child.props.transition),
            key,
          )
          const keyValue = childState.target[key] === 'none' ? transformResetValue[key] : childState.target[key]
          animationFactories.push(
            () => {
              return animate(
                child.current,
                {
                  [key]: keyValue,
                },
                {
                  ...(animationOptions[key] || {}),
                  delay: ((animationOptions[key]?.delay || 0) as number) + delayChildren + generateStaggerDuration(index),
                } as any,
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
