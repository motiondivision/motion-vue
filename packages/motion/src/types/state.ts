import type { DOMKeyframesDefinition, ResolvedValues, Target, TargetAndTransition } from 'framer-motion'
import type { MotionValue, TransformProperties, animate } from 'framer-motion/dom'
import type { IntrinsicElementAttributes } from 'vue'
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
import type { AnimationControls } from '@/animation/types'

type AnimationPlaybackControls = ReturnType<typeof animate>

export type TargetResolver = (
  custom: any,
  current: Target,
  velocity: Target
) => TargetAndTransition | string
export interface Variant extends DOMKeyframesDefinition {
  transition?: $Transition
  attrX?: DOMKeyframesDefinition['x']
  attrY?: DOMKeyframesDefinition['y']
  attrScale?: DOMKeyframesDefinition['scale']
}
/**
 * Either a string, or array of strings, that reference variants defined via the `variants` prop.
 * @public
 */
export type VariantLabels = string | string[]

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
export type MotionStyle = Partial<{
  [K in keyof Omit<Variant & TransformPropertiesWithoutTransition, 'attrX' | 'attrY' | 'attrScale'>]: string | number | undefined | MotionValue
}>
export type ElementType = keyof IntrinsicElementAttributes

export interface Options<T = any> extends
  LayoutOptions, PressProps,
  HoverProps, InViewProps, DragProps,
  PanProps, FocusProps {
  custom?: T
  as?: ElementType
  initial?: VariantLabels | Variant | boolean
  animate?: VariantLabels | Variant | AnimationControls
  exit?: VariantLabels | Variant
  variants?: {
    [k: string]: Variant | ((custom: T) => Variant)
  }
  style?: MotionStyle
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

export interface CssPropertyDefinition {
  syntax: `<${string}>`
  initialValue: string | number
  toDefaultUnit: (v: number) => string | number
}

export type CssPropertyDefinitionMap = { [key: string]: CssPropertyDefinition }
