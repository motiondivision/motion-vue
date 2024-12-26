import { createContext } from '@/utils'
import { type Ref, ref } from 'vue'

export const doneCallbacks = new WeakMap<Element, (v?: any, safeUnmount?: boolean) => void>()

export const unPresenceDom = ref(new WeakMap<Element, boolean>())

export function removeDoneCallback(element: Element) {
  const prevDoneCallback = doneCallbacks.get(element)
  if (prevDoneCallback) {
    element.removeEventListener('motioncomplete', prevDoneCallback)
  }
  doneCallbacks.delete(element)
}

export interface PresenceContext {
  initial: Ref<boolean>
  safeUnmount: (el: Element) => boolean
}

export const [injectAnimatePresence, provideAnimatePresence] = createContext<PresenceContext>('AnimatePresenceContext')
