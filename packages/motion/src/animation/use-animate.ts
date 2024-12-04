import type { AnimationPlaybackControls, AnimationScope } from 'framer-motion'
import type { Ref, UnwrapRef } from 'vue'
import { onUnmounted, ref } from 'vue'
import { createScopedAnimate } from 'framer-motion/dom'

type Scope = Ref<UnwrapRef<Element>> & { animations: AnimationPlaybackControls[] }
export function useAnimate<T extends Element = any>(): [Scope, ReturnType<typeof createScopedAnimate>] {
  const dom = ref<T | null>(null)
  const domProxy = new Proxy(dom, {
    get(target, key) {
      if (typeof key === 'string' || typeof key === 'symbol') {
        if (key === 'current')
          return Reflect.get(target, 'value')
        return Reflect.get(target, key)
      }
      return undefined
    },
    set(target, key, value) {
      if (key === 'value')
        return Reflect.set(target, key, value?.$el || value)
      if (key === 'animations')
        return Reflect.set(target, key, value)
      return true
    },
  }) as unknown as Scope

  domProxy.animations = []

  const animate = createScopedAnimate(domProxy as unknown as AnimationScope<T>)

  onUnmounted(() => {
    domProxy.animations.forEach(animation => animation.stop())
  })

  return [domProxy, animate]
}
