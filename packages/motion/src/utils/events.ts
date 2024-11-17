import type { MotionEventNames } from '../types'

// export function motionEvent(name: MotionEventNames, target: MotionKeyframesDefinition) {
//   return new CustomEvent(name, { detail: { target } })
// }

export function dispatchPointerEvent(
  element: HTMLElement,
  name: MotionEventNames,
  event: any,
) {
  element.dispatchEvent(
    new CustomEvent(name, { detail: { originalEvent: event } }),
  )
}
