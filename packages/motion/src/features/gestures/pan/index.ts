import { frame } from 'framer-motion/dom'
import type { PanInfo } from './PanSession'
import { PanSession } from './PanSession'
import { addPointerEvent } from '@/events'
import { Feature } from '@/features/feature'
import { getContextWindow, noop } from '@/utils'

type PanEventHandler = (event: PointerEvent, info: PanInfo) => void
function asyncHandler(handler?: PanEventHandler) {
  return (event: PointerEvent, info: PanInfo) => {
    if (handler) {
      frame.postRender(() => handler(event, info))
    }
  }
}

export class PanGesture extends Feature {
  private session?: PanSession

  private removePointerDownListener: Function = noop

  onPointerDown(pointerDownEvent: PointerEvent) {
    this.session = new PanSession(
      pointerDownEvent,
      this.createPanHandlers(),
      {
        transformPagePoint: this.state.visualElement.getTransformPagePoint(),
        contextWindow: getContextWindow(this.state.visualElement),
      },
    )
  }

  createPanHandlers() {
    const { onPanSessionStart, onPanStart, onPan, onPanEnd }
      = this.state.visualElement.getProps()

    return {
      onSessionStart: asyncHandler(onPanSessionStart),
      onStart: asyncHandler(onPanStart),
      onMove: onPan,
      onEnd: (event: PointerEvent, info: PanInfo) => {
        delete this.session
        if (onPanEnd) {
          frame.postRender(() => onPanEnd(event, info))
        }
      },
    }
  }

  mount() {
    this.removePointerDownListener = addPointerEvent(
      this.state.element!,
      'pointerdown',
      (event: PointerEvent) => this.onPointerDown(event),
    )
  }

  update() {
    this.session && this.session.updateHandlers(this.createPanHandlers())
  }

  unmount() {
    this.removePointerDownListener()
    this.session && this.session.end()
  }
}
