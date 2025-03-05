import type { Variant, VariantLabels } from '@/types'
import type { EventInfo } from 'framer-motion'

export type HoverEvent = (event: MouseEvent, info: EventInfo) => void

export interface HoverProps {
  /**
   * @deprecated Use `whileHover` instead.
   */
  hover?: VariantLabels | Variant
  /**
   * Variant to apply when the element is hovered.
   */
  whileHover?: VariantLabels | Variant
  onHoverStart?: HoverEvent
  onHoverEnd?: HoverEvent
}
