import { ref } from 'vue'

export function useDomRef<T extends Element = any>() {
  const dom = ref<T | null>(null)
  const domProxy = new Proxy(dom, {
    get(target, key) {
      if (typeof key === 'string' || typeof key === 'symbol') {
        return Reflect.get(target, key)
      }
      return undefined
    },
    set(target, key, value) {
      if (key === 'value')
        return Reflect.set(target, key, value?.$el || value)
      return true
    },
  })
  return domProxy
}
