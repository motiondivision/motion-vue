import type { DOMKeyframesDefinition, DynamicAnimationOptions } from 'framer-motion'

export interface Variant extends DOMKeyframesDefinition {
  transition?: DynamicAnimationOptions
}

export interface AnimateOptions {
  initial?: string | Variant | boolean
  animate?: string | Variant
  exit?: string | Variant
  variants?: {
    [k: string]: Variant
  }
  transition?: DynamicAnimationOptions
}

export type MotionEventNames =
  | 'motionstart'
  | 'motioncomplete'
  | 'hoverstart'
  | 'hoverend'
  | 'pressstart'
  | 'pressend'
  | 'viewenter'
  | 'viewleave'
