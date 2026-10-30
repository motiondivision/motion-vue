import type { Box } from 'motion-utils'

export interface LayoutLifecycles {
  onBeforeLayoutMeasure?: (box: Box) => void

  onLayoutMeasure?: (box: Box, prevBox: Box) => void

  /**
   * @internal
   */
  onLayoutAnimationStart?: () => void

  /**
   * @internal
   */
  onLayoutAnimationComplete?: () => void
}

export interface LayoutOptions extends LayoutLifecycles {
  'layout'?: boolean | 'position' | 'size' | 'preserve-aspect'

  'layoutId'?: string
  'layoutScroll'?: boolean
  'layoutRoot'?: boolean
  /**
   * The point on the parent used as the reference for relative layout
   * projection. Defaults to the top-left corner. `false` disables relative
   * projection.
   */
  'layoutAnchor'?: { x: number, y: number } | false
  'data-framer-portal-id'?: string
  'crossfade'?: boolean
  /**
   * @public
   */
  'layoutDependency'?: any
}
