import type { DOMKeyframesDefinition, DynamicAnimationOptions, Target, TargetAndTransition } from 'framer-motion'
import type { MotionValue, animate } from 'framer-motion/dom'
import type { IntrinsicElementAttributes } from 'vue'
import type { TransformProperties } from '@/types/transform'
import type { LayoutOptions } from '@/features/layout/types'
import type { DragProps } from '@/features/gestures/drag/types'
import type { PressProps } from '@/features/gestures/press/types'
import type { HoverProps } from '@/features/gestures/hover/types'
import type { InViewProps } from '@/features/gestures/in-view/types'
import type { LayoutGroupState } from '@/components/context'
import type { PanProps } from '@/features/gestures/pan/types'
import type { MotionConfigState } from '@/components/motion-config/types'

type AnimationPlaybackControls = ReturnType<typeof animate>
export interface Orchestration {
  delay?: number

  when?: false | 'beforeChildren' | 'afterChildren' | string
  delayChildren?: number

  staggerChildren?: number

  staggerDirection?: number
}
export interface AnimateOptions extends Omit<Orchestration, 'delay'>, DynamicAnimationOptions {

}
export type TargetResolver = (
  custom: any,
  current: Target,
  velocity: Target
) => TargetAndTransition | string
export interface Variant extends DOMKeyframesDefinition {
  transition?: AnimateOptions
}
export type VariantLabels = string | Variant

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
export type MotionStyle = Partial<{
  [K in keyof Variant]: Variant[K] | MotionValue
}>
export type ElementType = keyof IntrinsicElementAttributes

export interface Options<T = any> extends
  LayoutOptions, PressProps,
  HoverProps, InViewProps, DragProps,
  PanProps {
  custom?: T
  as?: ElementType
  initial?: string | Variant | boolean
  animate?: string | Variant
  exit?: string | Variant
  variants?: {
    [k: string]: Variant | ((custom: T) => Variant)
  }
  style?: MotionStyle
  transformTemplate?: (
    transform: TransformProperties,
    generatedTransform: string
  ) => string
  transition?: AnimateOptions & {
    layout?: DynamicAnimationOptions
  }
  layoutGroup?: LayoutGroupState
  motionConfig?: MotionConfigState
}

export interface MotionStateContext {
  initial?: string
  animate?: string
  inView?: string
  hover?: string
  press?: string
  exit?: string
}

export type AnimationFactory = () => AnimationPlaybackControls | undefined

export interface CssPropertyDefinition {
  syntax: `<${string}>`
  initialValue: string | number
  toDefaultUnit: (v: number) => string | number
}

export type CssPropertyDefinitionMap = { [key: string]: CssPropertyDefinition }
