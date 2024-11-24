import type { DOMKeyframesDefinition } from 'framer-motion'
import { isCssVar, isNumber } from './utils'
import { buildTransformTemplate, isTransform, transformAlias, transformDefinitions } from './transform'
import { isMotionValue } from '@/utils'
import type { MotionStyle } from '@/types'

type MotionStyleKey = Exclude<
  keyof CSSStyleDeclaration,
  'length' | 'parentRule'
>

export const style = {
  get: (element: Element, name: string): string | undefined => {
    let value = isCssVar(name)
      ? (element as HTMLElement).style.getPropertyValue(name)
      : getComputedStyle(element)[name as MotionStyleKey]
    if (!value && value !== '0') {
      const definition = transformDefinitions.get(name)
      if (definition)
        value = definition.initialValue as any
    }
    return value as string | undefined
  },
  set: (element: Element, name: string, value: string | number) => {
    if (isCssVar(name)) {
      ;(element as HTMLElement).style.setProperty(name, value as string)
    }
    else {
      ;(element as HTMLElement).style[name as MotionStyleKey] = value as any
    }
  },
}

export function createStyles(keyframes?: MotionStyle | DOMKeyframesDefinition): any {
  const initialKeyframes: any = {}
  const transforms: [string, any][] = []
  for (let key in keyframes as any) {
    let value = keyframes[key]
    value = isMotionValue(value) ? value.get() : value
    if (isTransform(key)) {
      if (key in transformAlias) {
        key = transformAlias[key as keyof typeof transformAlias]
      }
    }

    let initialKeyframe = Array.isArray(value) ? value[0] : value

    /**
     * If this is a number and we have a default value type, convert the number
     * to this type.
     */
    const definition = transformDefinitions.get(key)
    if (definition) {
      // @ts-ignore
      initialKeyframe = isNumber(value)
        ? definition.toDefaultUnit?.(value as number)
        : value

      transforms.push([key, initialKeyframe])
    }
    else {
      initialKeyframes[key] = initialKeyframe
    }
  }
  if (transforms.length) {
    initialKeyframes.transform = buildTransformTemplate(transforms)
  }
  return initialKeyframes
}

const SVG_STYLE_TO_ATTRIBUTES = {
  fill: true,
  stroke: true,
  strokeWidth: true,
  opacity: true,
  fillOpacity: true,
  strokeOpacity: true,
  strokeLinecap: true,
  strokeLinejoin: true,
  strokeDasharray: true,
  strokeDashoffset: true,
  cx: true,
  cy: true,
  r: true,
  d: true,
  x: true,
  y: true,
  x1: true,
  y1: true,
  x2: true,
  y2: true,
  points: true,
  pathLength: true,
  transform: true,
  viewBox: true,
  width: true,
  height: true,
  preserveAspectRatio: true,
  clipPath: true,
  filter: true,
  mask: true,
  stopColor: true,
  stopOpacity: true,
  gradientTransform: true,
  gradientUnits: true,
  spreadMethod: true,
  markerEnd: true,
  markerMid: true,
  markerStart: true,
  textAnchor: true,
  dominantBaseline: true,
  fontFamily: true,
  fontSize: true,
  fontWeight: true,
  letterSpacing: true,
  vectorEffect: true,
} as const

export function convertSvgStyleToAttributes(keyframes?: MotionStyle | DOMKeyframesDefinition) {
  const attributes: Record<string, any> = {}
  const styleProps: Record<string, any> = {}

  for (const key in keyframes as any) {
    if (key in SVG_STYLE_TO_ATTRIBUTES) {
      const attrKey = SVG_STYLE_TO_ATTRIBUTES[key as keyof typeof SVG_STYLE_TO_ATTRIBUTES]
      const attrName = typeof attrKey === 'string' ? attrKey : key
      const value = keyframes[key]
      attributes[attrName] = isMotionValue(value) ? value.get() : value
    }
    else {
      styleProps[key] = keyframes[key]
    }
  }

  return {
    attributes,
    style: styleProps,
  }
}
