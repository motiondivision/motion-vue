import { createContext } from '@/utils'
import type { MotionConfigState } from './types'
import { type ComputedRef, computed } from 'vue'

/**
 * Default motion configuration
 */
export const defaultConfig: MotionConfigState = {
  reduceMotion: 'never',
  transition: undefined,
  nonce: undefined,
}

/**
 * Context for sharing motion configuration with child components
 */
export const [injectMotionConfig, provideMotionConfig] = createContext<ComputedRef<MotionConfigState>>('MotionConfig')

export function useMotionConfig() {
  return injectMotionConfig(computed(() => defaultConfig))
}
