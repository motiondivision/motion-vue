import type { Feature } from '@/features/feature'

/**
 * Global lazy-loaded features registry
 * Updated by useMotionState when LazyMotion context provides features
 * Read by MotionState during feature initialization
 */
export const lazyFeatures: Array<typeof Feature> = []

/**
 * Update the global lazy features array
 * Called from useMotionState when lazyMotionContext features change
 */
export function updateLazyFeatures(features: Array<typeof Feature>) {
  for (const feature of features) {
    if (feature && !lazyFeatures.includes(feature)) {
      lazyFeatures.push(feature)
    }
  }
}
