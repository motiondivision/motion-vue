import type { Ref } from 'vue'
import { ref } from 'vue'

export function useForceUpdate(): [() => void, Ref<number>] {
  const key = ref(0)
  function forceUpdate() {
    key.value++
  }

  return [forceUpdate, key]
}
