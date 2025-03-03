import type { Variant, VariantLabels } from '@/types'
import type { EventInfo } from 'framer-motion'

export type HoverEvent = (event: MouseEvent, info: EventInfo) => void

export interface HoverProps {
  hover?: VariantLabels | Variant

  onHoverStart?: HoverEvent
  onHoverEnd?: HoverEvent
}
