import type { VariantType } from '@/types'
import type { EventInfo, VariantLabels } from 'motion-dom'

export type HoverEvent = (event: MouseEvent, info: EventInfo) => void

export interface HoverProps {
  /**
   * Variant to apply when the element is hovered.
   */
  whileHover?: VariantLabels | VariantType
  onHoverStart?: HoverEvent
  onHoverEnd?: HoverEvent
}
