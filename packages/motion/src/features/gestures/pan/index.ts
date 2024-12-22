import { frame, noop } from 'framer-motion/dom'
import type { PanInfo } from './PanSession'
import { PanSession } from './PanSession'
import { addPointerEvent } from '@/events'
import { Feature } from '@/features/feature'
import { getContextWindow } from '@/utils'

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
    return {
      onSessionStart: asyncHandler((_, info) => {
        const { onPanSessionStart } = this.state.options
        onPanSessionStart && onPanSessionStart(_, info)
      }),
      onStart: asyncHandler((_, info) => {
        const { onPanStart } = this.state.options
        onPanStart && onPanStart(_, info)
      }),
      onMove: (event, info) => {
        const { onPan } = this.state.options
        onPan && onPan(event, info)
      },
      onEnd: (event: PointerEvent, info: PanInfo) => {
        const { onPanEnd } = this.state.options
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
      this.onPointerDown.bind(this),
    )
  }

  update() {
    // this.session && this.session.updateHandlers(this.createPanHandlers())
  }

  unmount() {
    this.removePointerDownListener()
    this.session && this.session.end()
  }
}
