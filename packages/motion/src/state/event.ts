import type { Variant } from '@/types'

export type MotionEventNames =
  | 'motionstart'
  | 'motioncomplete'

export function motionEvent(name: MotionEventNames, target: Variant, isExit?: boolean) {
  return new CustomEvent(name, { detail: { target, isExit } })
}
