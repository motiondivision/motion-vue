export * from './transform'
import type { DOMKeyframesDefinition, DynamicAnimationOptions } from 'framer-motion'

export interface Variant extends DOMKeyframesDefinition {
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
  | 'dragstart'
  | 'dragend'
  | 'dragcancel'
  | 'dragmove'
  | 'drag'
