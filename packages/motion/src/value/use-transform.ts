import type { TransformOptions } from '@/types'
import { type MotionValue, transform } from 'framer-motion/dom'
import { useComputed } from './use-computed'
import { useCombineMotionValues } from '@/value/use-combine-values'
import { type MaybeRef, computed, isRef } from 'vue'

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
  inputRange: InputRange,
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

// 实现
export function useTransform<I, O>(
  input: | MotionValue<I>
  | MotionValue<string>[]
  | MotionValue<number>[]
  | MotionValue<string | number>[]
  | (() => O),
  inputRangeOrTransformer?: MaybeRef<InputRange> | Transformer<I, O>,
  outputRange?: O[],
  options?: TransformOptions<O>,
): MotionValue<O> {
  if (typeof input === 'function') {
    return useComputed(input)
  }

  const transformer = computed(() => {
    return typeof inputRangeOrTransformer === 'function'
      ? inputRangeOrTransformer
      : transform(isRef(inputRangeOrTransformer) ? inputRangeOrTransformer.value : inputRangeOrTransformer, outputRange!, options)
  })

  return Array.isArray(input)
    ? useListTransform(
      input,
      transformer as MaybeRef<MultiTransformer<string | number, O>>,
    )
    : useListTransform([input], ([latest]) => {
      if (isRef(transformer)) {
        return (transformer.value as SingleTransformer<I, O>)(latest)
      }
      return (transformer as SingleTransformer<I, O>)(latest)
    })
}

function useListTransform<I, O>(
  values: MotionValue<I>[],
  transformer: MaybeRef<MultiTransformer<I, O>>,
): MotionValue<O> {
  const latest: I[] = []

  const { value, subscribe } = useCombineMotionValues(() => {
    latest.length = 0
    const numValues = values.length
    for (let i = 0; i < numValues; i++) {
      latest[i] = values[i].get()
    }

    return isRef(transformer) ? transformer.value(latest) : transformer(latest)
  })

  subscribe(values)

  return value
}
