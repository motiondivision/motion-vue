import type { Feature } from '@/features'
import { createContext } from '@/utils'
import type { Ref } from 'vue'

export type LazyMotionContext = {
  features: Ref<Array<typeof Feature>>
  strict: boolean
}
export const [useLazyMotionContext, lazyMotionContextProvider] = createContext<LazyMotionContext>('LazyMotionContext')
