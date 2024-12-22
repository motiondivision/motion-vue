import { isPrimaryPointer } from '@/events'
import type { EventInfo } from './types'

export type EventListenerWithPointInfo = (
  e: PointerEvent,
  info: EventInfo
) => void

export function extractEventInfo(
  event: PointerEvent,
  pointType: 'page' | 'client' = 'page',
): EventInfo {
  return {
    point: {
      x: event[`${pointType}X`],
      y: event[`${pointType}Y`],
    },
  }
}

export function addPointerInfo(handler: EventListenerWithPointInfo): EventListener {
  return (event: PointerEvent) =>
    isPrimaryPointer(event) && handler(event, extractEventInfo(event))
}
