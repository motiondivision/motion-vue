import type { AnimationPlaybackControls, AnimationScope } from 'motion-dom'
import type { Ref, UnwrapRef } from 'vue'
import { onUnmounted, ref } from 'vue'
import { createScopedAnimate } from 'framer-motion/dom'
import { MotionGlobalConfig } from 'motion-utils'
import { useMotionConfig } from '@/components/motion-config'

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

  const config = useMotionConfig()
  const scopedAnimate = createScopedAnimate({
    scope: domProxy as unknown as AnimationScope<T>,
  })

  const animate = ((...args: Parameters<typeof scopedAnimate>) => {
    if (!config.value.skipAnimations)
      return scopedAnimate(...args)

    const previousSkipAnimations = MotionGlobalConfig.skipAnimations
    MotionGlobalConfig.skipAnimations = true
    try {
      return scopedAnimate(...args)
    }
    finally {
      MotionGlobalConfig.skipAnimations = previousSkipAnimations
    }
  }) as typeof scopedAnimate

  onUnmounted(() => {
    domProxy.animations.forEach(animation => animation.stop())
  })

  return [domProxy, animate]
}
