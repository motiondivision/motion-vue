import type { VariantType } from '@/types'
import type { EventInfo } from 'framer-motion'
import type { VariantLabels } from 'motion-dom'

export type HoverEvent = (event: MouseEvent, info: EventInfo) => void

export interface HoverProps {
  /**
   * @deprecated Use `whileHover` instead.
   */
  hover?: VariantLabels | VariantType
  /**
   * Variant to apply when the element is hovered.
   */
  whileHover?: VariantLabels | VariantType
  onHoverStart?: HoverEvent
  onHoverEnd?: HoverEvent
}
