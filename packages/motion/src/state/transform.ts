import { isDef } from '@vueuse/core'
import type { CssPropertyDefinition, CssPropertyDefinitionMap } from './types'
import { noopReturn } from './utils'

const rotation: CssPropertyDefinition = {
  syntax: '<angle>',
  initialValue: '0deg',
  toDefaultUnit: (v: number) => `${v}deg`,
}

const baseTransformProperties: CssPropertyDefinitionMap = {
  translate: {
    syntax: '<length-percentage>',
    initialValue: '0px',
    toDefaultUnit: (v: number) => `${v}px`,
  },
  rotate: rotation,
  scale: {
    syntax: '<number>',
    initialValue: 1,
    toDefaultUnit: noopReturn,
  },
  skew: rotation,
}

/**
 * An ordered array of each transformable value. By default, transform values
 * will be sorted to this order.
 */
const order = ['translate', 'scale', 'rotate', 'skew']

/**
 * A list of all transformable axes. We'll use this list to generated a version
 * of each axes for each transform.
 */
export const axes = ['', 'X', 'Y', 'Z']

export const transformDefinitions = new Map<string, CssPropertyDefinition>()
/**
 * Generate a list of every possible transform key
 */
const transforms = ['transformPerspective', 'x', 'y', 'z', 'translateX', 'translateY', 'translateZ', 'scale', 'scaleX', 'scaleY', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'skew', 'skewX', 'skewY']
order.forEach((name) => {
  axes.forEach((axis) => {
    transforms.push(name + axis)
    transformDefinitions.set(
      name + axis,
      baseTransformProperties[name],
    )
  })
})

/**
 * Provide a quick way to check if a string is the name of a transform
 */
const transformLookup = new Set(transforms)
export const isTransform = (name: string) => transformLookup.has(name)

export const transformAlias = {
  x: 'translateX',
  y: 'translateY',
  z: 'translateZ',
}

export function compareTransformOrder([a]: [string, any], [b]: [string, any]) {
  return transforms.indexOf(a) - transforms.indexOf(b)
}

function transformListToString(template: string, [name, value]: [string, any]) {
  return `${template} ${name}(${value})`
}

export function buildTransformTemplate(transforms: [string, any][]): string {
  return transforms
    .sort(compareTransformOrder)
    .reduce(transformListToString, '')
    .trim()
}

export function getFirstAnimateTransform(initialFrame: any, animateFrame: any) {
  const first = Array.isArray(initialFrame) ? initialFrame[0] : initialFrame
  if (Array.isArray(animateFrame)) {
    return isDef(first) ? [first, ...animateFrame] : animateFrame
  }
  else {
    return isDef(first) ? [first, animateFrame] : animateFrame
  }
}

export const transformResetValue = {
  translate: [0, 0],
  rotate: 0,
  scale: 1,
  skew: 0,
  x: 0,
  y: 0,
  z: 0,
}
