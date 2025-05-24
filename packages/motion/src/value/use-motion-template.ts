import type { MotionValue } from 'framer-motion/dom'
import { isMotionValue } from 'framer-motion/dom'
import { useCombineMotionValues } from './use-combine-values'

/**
 * 将多个motion值组合成一个新的motion值,使用模板字符串语法
 *
 * ```vue
 * <script setup>
 * import { useSpring, motionValue, useMotionTemplate } from 'motion-v'
 *
 * const shadowX = useSpring(0)
 * const shadowY = motionValue(0)
 * const shadow = useMotionTemplate`drop-shadow(${shadowX}px ${shadowY}px 20px rgba(0,0,0,0.3))`
 * </script>
 *
 * <template>
 *   <Motion :style="{ filter: shadow }" />
 * </template>
 * ```
 *
 * @public
 */
export function useMotionTemplate(
  fragments: TemplateStringsArray,
  ...values: Array<MotionValue | number | string>
) {
  /**
   * 创建一个函数用于从最新的motion值构建字符串
   */
  const numFragments = fragments.length

  function buildValue() {
    let output = ''

    for (let i = 0; i < numFragments; i++) {
      output += fragments[i]
      const value = values[i]
      if (value) {
        output += isMotionValue(value) ? value.get() : value
      }
    }

    return output
  }
  const { value, subscribe } = useCombineMotionValues(buildValue)

  subscribe(values.filter(isMotionValue))

  return value
}
