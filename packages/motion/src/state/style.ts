import type { DOMKeyframesDefinition, ResolvedValues } from 'framer-motion'
import { isCssVar, isNumber } from './utils'
import { buildTransformTemplate, isTransform, transformAlias, transformDefinitions } from './transform'
import { isMotionValue } from '@/utils'
import type { MotionStyle } from '@/types'
import { px } from '@/value/types/numbers/units'

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
  if (Object.keys(initialKeyframes).length === 0) {
    return null
  }
  return initialKeyframes
}

const SVG_STYLE_TO_ATTRIBUTES = {
  'fill': true,
  'stroke': true,
  'opacity': true,
  'stroke-width': true,
  'fill-opacity': true,
  'stroke-opacity': true,
  'stroke-linecap': true,
  'stroke-linejoin': true,
  'stroke-dasharray': true,
  'stroke-dashoffset': true,
  'cx': true,
  'cy': true,
  'r': true,
  'd': true,
  'x1': true,
  'y1': true,
  'x2': true,
  'y2': true,
  'points': true,
  'path-length': true,
  'viewBox': true,
  'width': true,
  'height': true,
  'preserve-aspect-ratio': true,
  'clip-path': true,
  'filter': true,
  'mask': true,
  'stop-color': true,
  'stop-opacity': true,
  'gradient-transform': true,
  'gradient-units': true,
  'spread-method': true,
  'marker-end': true,
  'marker-mid': true,
  'marker-start': true,
  'text-anchor': true,
  'dominant-baseline': true,
  'font-family': true,
  'font-size': true,
  'font-weight': true,
  'letter-spacing': true,
  'vector-effect': true,
} as const

function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

function buildSVGPath(
  attrs: ResolvedValues,
  length: number,
  spacing = 1,
  offset = 0,
) {
  attrs['path-length'] = 1
  // Build the dash offset
  attrs['stroke-dashoffset'] = px.transform(-offset)

  // Build the dash array
  const pathLength = px.transform!(length)
  const pathSpacing = px.transform!(spacing)
  attrs['stroke-dasharray'] = `${pathLength} ${pathSpacing}`
}

export function convertSvgStyleToAttributes(keyframes?: MotionStyle | DOMKeyframesDefinition) {
  const attributes: Record<string, any> = {}
  const styleProps: Record<string, any> = {}
  for (const key in keyframes as any) {
    const kebabKey = camelToKebab(key)
    if (kebabKey in SVG_STYLE_TO_ATTRIBUTES) {
      const value = keyframes[key]
      attributes[kebabKey] = isMotionValue(value) ? value.get() : value
    }
    else {
      styleProps[key] = keyframes[key]
    }
  }
  if (attributes['path-length'] !== undefined) {
    buildSVGPath(attributes, attributes['path-length'], attributes['path-spacing'], attributes['path-offset'])
  }
  return {
    attributes,
    style: styleProps,
  }
}
