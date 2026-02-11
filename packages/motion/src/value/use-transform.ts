import { type MotionValue, type TransformOptions, motionValue, transform } from 'motion-dom'
import { useComputed } from './use-computed'
import { useCombineMotionValues } from '@/value/use-combine-values'
import { type MaybeRef, isRef, watch } from 'vue'

type InputRange = number[]
type SingleTransformer<I, O> = (input: I) => O
type MultiTransformer<I, O> = (input: I[]) => O
type Transformer<I, O> = SingleTransformer<I, O> | MultiTransformer<string | number, O>

/**
 * Create a `MotionValue` that transforms the output of another `MotionValue` by mapping it from one range of values into another.
 *
 * @remarks
 *
 * Given an input range of `[-200, -100, 100, 200]` and an output range of
 * `[0, 1, 1, 0]`, the returned `MotionValue` will:
 *
 * - When provided a value between `-200` and `-100`, will return a value between `0` and  `1`.
 * - When provided a value between `-100` and `100`, will return `1`.
 * - When provided a value between `100` and `200`, will return a value between `1` and  `0`
 *
 *
 * The input range must be a linear series of numbers. The output range
 * can be any value type supported by Framer Motion: numbers, colors, shadows, etc.
 *
 * Every value in the output range must be of the same type and in the same format.
 *
 * ```vue
 * <script setup>
 * import { Motion, motionValue, useTransform } from 'motion-v'
 *
 * const x = motionValue(0)
 * const xRange = [-200, -100, 100, 200]
 * const opacityRange = [0, 1, 1, 0]
 * const opacity = useTransform(x, xRange, opacityRange)
 * </script>
 *
 * <template>
 *   <Motion
 *     :animate="{ x: 200 }"
 *     :style="{ opacity, x }"
 *   />
 * </template>
 * ```
 *
 * @param inputValue - `MotionValue`
 * @param inputRange - A linear series of numbers (either all increasing or decreasing)
 * @param outputRange - A series of numbers, colors or strings. Must be the same length as `inputRange`.
 * @param options -
 *
 *  - clamp: boolean. Clamp values to within the given range. Defaults to `true`
 *  - ease: EasingFunction[]. Easing functions to use on the interpolations between each value in the input and output ranges. If provided as an array, the array must be one item shorter than the input and output ranges, as the easings apply to the transition between each.
 *
 * @returns `MotionValue`
 *
 * @public
 */
export function useTransform<I, O>(
  value: MotionValue<number>,
  inputRange: InputRange | MaybeRef<InputRange>,
  outputRange: O[],
  options?: TransformOptions<O>
): MotionValue<O>

export function useTransform<I, O>(transformer: () => O): MotionValue<O>

export function useTransform<I, O>(
  input: MotionValue<I>,
  transformer: SingleTransformer<I, O>
): MotionValue<O>

export function useTransform<I, O>(
  input: | MotionValue<string>[]
  | MotionValue<number>[]
  | MotionValue<string | number>[],
  transformer: MultiTransformer<I, O>
): MotionValue<O>

/**
 * Create multiple `MotionValue`s that transform the output of a single `MotionValue`.
 *
 * @remarks
 *
 * Allows transforming a single input into multiple outputs, useful for coordinated animations.
 *
 * ```vue
 * <script setup>
 * import { Motion, useMotionValue, useTransform } from 'motion-v'
 *
 * const x = useMotionValue(0)
 * const { opacity, scale } = useTransform(x, [0, 100], {
 *   opacity: [0, 1],
 *   scale: [0.5, 1]
 * })
 * </script>
 *
 * <template>
 *   <Motion
 *     :animate="{ x: 100 }"
 *     :style="{ opacity, scale, x }"
 *   />
 * </template>
 * ```
 *
 * @param value - `MotionValue` to transform
 * @param inputRange - A linear series of numbers (either all increasing or decreasing)
 * @param outputRange - An object where each key maps to an output range array
 * @param options - Transform options (clamp, ease)
 *
 * @returns Object containing `MotionValue` for each output key
 *
 * @public
 */
export function useTransform<O>(
  value: MotionValue<number>,
  inputRange: InputRange | MaybeRef<InputRange>,
  outputRange: { [K in keyof O]: O[K][] },
  options?: TransformOptions<O[keyof O]>
): { [K in keyof O]: MotionValue<O[K]> }

// 实现
export function useTransform<I, O>(
  input: | MotionValue<I>
  | MotionValue<string>[]
  | MotionValue<number>[]
  | MotionValue<string | number>[]
  | (() => O),
  inputRangeOrTransformer?: MaybeRef<InputRange> | Transformer<I, O>,
  outputRange?: O[] | { [K in keyof O]: O[K][] },
  options?: TransformOptions<O>,
): MotionValue<O> | { [K in keyof O]: MotionValue<O[K]> } {
  if (typeof input === 'function') {
    return useComputed(input)
  }

  // Check if outputRange is an object (multi-output mode)
  if (outputRange && !Array.isArray(outputRange) && typeof outputRange === 'object') {
    const result = {} as { [K in keyof O]: MotionValue<O[K]> }

    for (const key in outputRange) {
      if (Object.prototype.hasOwnProperty.call(outputRange, key)) {
        const keyOutputRange = outputRange[key]
        result[key] = useTransform(
          input as MotionValue<number>,
          inputRangeOrTransformer as MaybeRef<InputRange>,
          keyOutputRange as any,
          options as any,
        ) as MotionValue<O[typeof key]>
      }
    }

    return result
  }

  // Handle reactive inputRange by creating a bridge MotionValue
  let inputValues: MotionValue<any>[]
  let transformer: Transformer<I, O>

  if (typeof inputRangeOrTransformer === 'function') {
    // Direct transformer function
    transformer = inputRangeOrTransformer
    inputValues = Array.isArray(input) ? input : [input]
  }
  else if (isRef(inputRangeOrTransformer)) {
    // Reactive inputRange - create a bridge MotionValue to trigger updates
    const bridgeMV = motionValue(0)
    let currentTransformer = transform(inputRangeOrTransformer.value, outputRange as any[], options)

    // Watch the ref and update transformer + trigger re-calculation
    watch(inputRangeOrTransformer, (newRange) => {
      currentTransformer = transform(newRange, outputRange as any[], options)
      // Trigger update by changing bridge value
      bridgeMV.set(bridgeMV.get() + 1)
    }, { flush: 'sync' })

    transformer = (values: any) => {
      return Array.isArray(values)
        ? currentTransformer(values[0])
        : currentTransformer(values)
    }

    inputValues = Array.isArray(input) ? [...input, bridgeMV] : [input, bridgeMV]
  }
  else {
    // Static inputRange
    transformer = transform(inputRangeOrTransformer, outputRange as any[], options) as any
    inputValues = Array.isArray(input) ? input : [input]
  }

  return Array.isArray(input)
    ? useListTransform(inputValues, transformer as MultiTransformer<string | number, O>)
    : useListTransform(inputValues, (values) => {
      // Extract only the input value (ignore bridge if present)
      return (transformer as SingleTransformer<I, O>)(values[0] as I)
    })
}

function useListTransform<I, O>(
  values: MotionValue<I>[],
  transformer: MultiTransformer<I, O>,
): MotionValue<O> {
  const latest: I[] = []

  const combineValues = () => {
    latest.length = 0
    const numValues = values.length
    for (let i = 0; i < numValues; i++) {
      latest[i] = values[i].get()
    }
    return transformer(latest)
  }

  const { value, subscribe } = useCombineMotionValues(combineValues)

  subscribe(values)

  return value
}
