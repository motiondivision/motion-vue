import type { DOMKeyframesDefinition, DynamicAnimationOptions } from 'framer-motion'
import type { animate } from 'framer-motion/dom'
import type { CSSProperties } from 'vue'

type AnimationPlaybackControls = ReturnType<typeof animate>

export interface Variant extends DOMKeyframesDefinition {
  transition?: DynamicAnimationOptions
}
type MarginValue = `${number}${'px' | '%'}`
type MarginType = MarginValue | `${MarginValue} ${MarginValue}` | `${MarginValue} ${MarginValue} ${MarginValue}` | `${MarginValue} ${MarginValue} ${MarginValue} ${MarginValue}`
export interface InViewOptions {
  root?: Element | Document
  margin?: MarginType
  amount?: 'some' | 'all' | number
}
export interface Options {
  inViewOptions?: InViewOptions & { once?: boolean }
  inView?: string | Variant
  press?: string | Variant
  hover?: string | Variant
  initial?: string | Variant | boolean
  animate?: string | Variant
  exit?: string | Variant
  variants?: {
    [k: string]: Variant
  }
  transition?: DynamicAnimationOptions
  style?: CSSProperties
  onMotionStart?: (target: DOMKeyframesDefinition) => void
  onMotionComplete?: (target: DOMKeyframesDefinition) => void
  onHoverStart?: (e: PointerEvent) => void
  onHoverEnd?: (e: PointerEvent) => void
  onPressStart?: (e: PointerEvent) => void
  onPressEnd?: (e: PointerEvent) => void
  onViewEnter?: (target: Element) => void
  onViewLeave?: (target: Element) => void
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
