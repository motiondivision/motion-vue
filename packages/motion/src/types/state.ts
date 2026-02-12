import type { DOMKeyframesDefinition, LegacyAnimationControls, MotionValue, ResolvedValues, TransformProperties, VariantLabels } from 'motion-dom'
import type { animate } from 'framer-motion/dom'
import type { LayoutOptions } from '@/features/layout/types'
import type { DragProps } from '@/features/gestures/drag/types'
import type { PressProps } from '@/features/gestures/press/types'
import type { HoverProps } from '@/features/gestures/hover/types'
import type { InViewProps } from '@/features/gestures/in-view/types'
import type { LayoutGroupState } from '@/components/context'
import type { PanProps } from '@/features/gestures/pan/types'
import type { MotionConfigState } from '@/components/motion-config/types'
import type { $Transition } from './framer-motion'
import type { FocusProps } from '@/features/gestures/focus/types'
import type { AsTag } from '@/types/common'
import type { PresenceContext } from '@/components/animate-presence/presence'

type AnimationPlaybackControls = ReturnType<typeof animate>
export interface VariantType extends DOMKeyframesDefinition {
  transition?: Options['transition']
  attrX?: DOMKeyframesDefinition['x']
  attrY?: DOMKeyframesDefinition['y']
  attrScale?: DOMKeyframesDefinition['scale']
}

interface BoundingBox {
  top: number
  right: number
  bottom: number
  left: number
}
export interface DragOptions {
  constraints?: false | Partial<BoundingBox>
  dragSnapToOrigin?: boolean
}

type TransformPropertiesWithoutTransition = Omit<TransformProperties, 'transition'>
export type MotionStyleProps = Partial<{
  [K in keyof Omit<VariantType & TransformPropertiesWithoutTransition, 'attrX' | 'attrY' | 'attrScale'>]: string | number | undefined | MotionValue
}>

export interface Options<T = any> extends
  LayoutOptions, PressProps,
  HoverProps, InViewProps, DragProps,
  PanProps, FocusProps {
  custom?: T
  as?: AsTag
  initial?: VariantLabels | VariantType | boolean
  animate?: VariantLabels | VariantType | LegacyAnimationControls
  exit?: VariantLabels | VariantType
  variants?: {
    [k: string]: VariantType | ((custom: T) => VariantType)
  }
  inherit?: boolean
  style?: MotionStyleProps
  transformTemplate?: (
    transform: TransformProperties,
    generatedTransform: string
  ) => string
  transition?: $Transition & {
    layout?: $Transition
  }
  layoutGroup?: LayoutGroupState
  motionConfig?: MotionConfigState
  onAnimationComplete?: (definition: Options['animate']) => void
  onUpdate?: (latest: ResolvedValues) => void
  onAnimationStart?: (definition: Options['animate']) => void
  presenceContext?: PresenceContext
}

export interface MotionStateContext {
  initial?: VariantLabels | boolean
  animate?: VariantLabels
  inView?: VariantLabels
  hover?: VariantLabels
  press?: VariantLabels
  exit?: VariantLabels
}

export type AnimationFactory = () => AnimationPlaybackControls | undefined
