import type { AnimationScope } from 'framer-motion'
import { createScopedAnimate } from 'framer-motion/dom'
import { onUnmounted } from 'vue'

export function useAnimate<T extends Element = any>(): [AnimationScope<T>, ReturnType<typeof createScopedAnimate>] {
  const scope: AnimationScope<T> = {
    current: null!,
    animations: [],
  }

  const animate = createScopedAnimate(scope)

  onUnmounted(() => {
    scope.animations.forEach((animation) => {
      animation.stop()
    })
  })

  return [scope, animate] as [AnimationScope<T>, typeof animate]
}
