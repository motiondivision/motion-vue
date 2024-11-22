import type { EasingFunction } from 'framer-motion'

export interface TransformProperties {
  x?: string | number
  y?: string | number
  z?: string | number
  translateX?: string | number
  translateY?: string | number
  translateZ?: string | number
  rotate?: string | number
  rotateX?: string | number
  rotateY?: string | number
  rotateZ?: string | number
  scale?: string | number
  scaleX?: string | number
  scaleY?: string | number
  scaleZ?: string | number
  skew?: string | number
  skewX?: string | number
  skewY?: string | number
  originX?: string | number
  originY?: string | number
  originZ?: string | number
  perspective?: string | number
  transformPerspective?: string | number
}

export interface TransformOptions<T> {
  /**
   * Clamp values to within the given range. Defaults to `true`
   *
   * @public
   */
  clamp?: boolean

  /**
   * Easing functions to use on the interpolations between each value in the input and output ranges.
   *
   * If provided as an array, the array must be one item shorter than the input and output ranges, as the easings apply to the transition **between** each.
   *
   * @public
   */
  ease?: EasingFunction | EasingFunction[]

  /**
   * Provide a function that can interpolate between any two values in the provided range.
   *
   * @public
   */
  mixer?: (from: T, to: T) => (v: number) => any
}
