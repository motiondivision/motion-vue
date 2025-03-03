import type { Variant, VariantLabels } from '@/types'
import type { EventInfo } from 'framer-motion'

export type PressEvent = (
  event: PointerEvent,
  info: EventInfo
) => void

export interface PressProps {
  /**
   * If `true`, the press gesture will attach its start listener to window.
   */
  globalPressTarget?: boolean
  press?: VariantLabels | Variant
  onPressStart?: PressEvent
  onPress?: PressEvent
  onPressCancel?: PressEvent
}
