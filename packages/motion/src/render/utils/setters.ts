import type { TargetResolver } from '@/types'
import type { TargetAndTransition, VisualElement } from 'framer-motion'

export function setTarget(
  visualElement: VisualElement,
  definition: string | TargetAndTransition | TargetResolver,
) {
  // const resolved = resolveVariant(visualElement, definition)
  // let { transitionEnd = {}, transition = {}, ...target } = resolved || {}

  // target = { ...target, ...transitionEnd }

  // for (const key in target) {
  // const value = resolveFinalValueInKeyframes(
  //   target[key as keyof typeof target] as any,
  // )
  // setMotionValue(visualElement, key, value as string | number)
  // }
}
