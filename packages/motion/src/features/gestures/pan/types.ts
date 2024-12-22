import type { PanInfo } from '@/features/gestures/pan/PanSession'

export interface PanProps {
  onPanSessionStart?: (event: PointerEvent, info: PanInfo) => void
  onPanStart?: (event: PointerEvent, info: PanInfo) => void
  onPan?: (event: PointerEvent, info: PanInfo) => void
  onPanEnd?: (event: PointerEvent, info: PanInfo) => void
}
