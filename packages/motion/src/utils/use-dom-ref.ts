import { getMotionElement } from '@/components/hooks/use-motion-elm'
import { ref } from 'vue'

export function useDomRef() {
  const dom = ref<any | null>(null)
  const domProxy = new Proxy(dom, {
    get(target, key) {
      if (typeof key === 'string' || typeof key === 'symbol') {
        return Reflect.get(target, key)
      }
      return undefined
    },
    set(target, key, value) {
      if (key === 'value')
        return Reflect.set(target, key, getMotionElement(value?.$el || value))
      return true
    },
  })
  return domProxy
}
