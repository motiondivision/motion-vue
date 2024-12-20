import type { Variant } from '@/types'
import type { EventInfo } from 'framer-motion'

export type HoverEvent = (event: MouseEvent, info: EventInfo) => void

export interface HoverProps {
  hover?: string | Variant

  onHoverStart?: HoverEvent
  onHoverEnd?: HoverEvent
}
