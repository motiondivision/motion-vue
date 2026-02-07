import type { FeatureBundle } from '@/features/dom-animation'
import { createContext } from '@/utils'
import type { Ref } from 'vue'

export type LazyMotionContext = {
  features: Ref<Partial<FeatureBundle>>
  strict: boolean
}
export const [useLazyMotionContext, lazyMotionContextProvider] = createContext<LazyMotionContext>('LazyMotionContext')
