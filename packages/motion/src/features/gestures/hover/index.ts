import type { MotionState } from '@/state/motion-state'
import { Feature, extractEventInfo } from '@/features'
import { frame, hover } from 'motion-dom'

function handleHoverEvent(
  state: MotionState,
  event: PointerEvent,
  lifecycle: 'Start' | 'End',
) {
  const props = state.options
  if (props.whileHover) {
    state.setActive('whileHover', lifecycle === 'Start')
  }

  const eventName = (`onHover${lifecycle}`) as
    | 'onHoverStart'
    | 'onHoverEnd'

  const callback = props[eventName]
  if (callback) {
    frame.postRender(() => callback(event, extractEventInfo(event)))
  }
}

export class HoverGesture extends Feature {
  static key = 'hover' as const

  isActive() {
    const { whileHover, onHoverStart, onHoverEnd } = this.state.options
    return Boolean(whileHover || onHoverStart || onHoverEnd)
  }

  constructor(state: MotionState) {
    super(state)
  }

  mount() {
    this.register()
  }

  update() {
    const { whileHover, onHoverStart, onHoverEnd } = this.state.visualElement.prevProps
    if (!(whileHover || onHoverStart || onHoverEnd)) {
      this.register()
    }
  }

  register() {
    const element = this.state.element
    if (!element || !this.isActive())
      return
    // Unmount previous hover handler
    this.unmount()
    this.unmount = hover(
      element,
      (el, startEvent) => {
        handleHoverEvent(this.state, startEvent, 'Start')
        return (endEvent) => {
          handleHoverEvent(this.state, endEvent, 'End')
        }
      },
    )
  }
}
