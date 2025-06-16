import type { AnimatePresenceProps } from '@/components/animate-presence/types'
import { createContext } from '@/utils'
import { onMounted, watch } from 'vue'

export const doneCallbacks = new WeakMap<Element, (v?: any, safeUnmount?: boolean) => void>()

export function removeDoneCallback(element: Element) {
  const prevDoneCallback = doneCallbacks.get(element)
  if (prevDoneCallback) {
    element.removeEventListener('motioncomplete', prevDoneCallback)
  }
  doneCallbacks.delete(element)
}

export interface PresenceContext {
  initial?: boolean
  custom?: any
}

export const [injectAnimatePresence, provideAnimatePresence] = createContext<PresenceContext>('AnimatePresenceContext')

export function useAnimatePresence(props: AnimatePresenceProps) {
  const presenceContext = {
    initial: props.initial,
    custom: props.custom,
  }
  watch(() => props.custom, (v) => {
    presenceContext.custom = v
  }, {
    flush: 'pre',
  })

  provideAnimatePresence(presenceContext)

  onMounted(() => {
    presenceContext.initial = undefined
  })
}
