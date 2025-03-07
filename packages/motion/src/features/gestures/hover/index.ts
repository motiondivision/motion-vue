import type { MotionState } from '@/state/motion-state'
import { Feature, extractEventInfo } from '@/features'
import { frame, hover } from 'framer-motion/dom'

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
  isActive() {
    return Boolean(this.state.getOptions().whileHover)
  }

  constructor(state: MotionState) {
    super(state)
  }

  mount() {
    const element = this.state.element
    if (!element)
      return
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
