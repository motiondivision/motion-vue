import type { Options } from '@/types'

/**
 * Motion configuration state shared through context
 */
export interface MotionConfigState {
  /** Default transition settings for animations */
  transition?: Options['transition']
  /** Controls motion reduction based on user preference or explicit setting */
  reduceMotion?: 'user' | 'never' | 'always'
  /** Custom nonce for CSP compliance with inline styles */
  nonce?: string
}

/** Props interface matching the config state */
export type MotionConfigProps = MotionConfigState
