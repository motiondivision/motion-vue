import type { MotionState } from '@/state/motion-state'
import { Feature } from '@/features'
import { frame, press } from 'framer-motion/dom'
import type { EventInfo } from 'framer-motion'

export function extractEventInfo(event: PointerEvent): EventInfo {
  return {
    point: {
      x: event.pageX,
      y: event.pageY,
    },
  }
}

function handlePressEvent(
  state: MotionState,
  event: PointerEvent,
  lifecycle: 'Start' | 'End' | 'Cancel',
) {
  const props = state.options
  if (props.whilePress) {
    state.setActive('whilePress', lifecycle === 'Start')
  }

  const eventName = (`onPress${lifecycle === 'End' ? '' : lifecycle}`) as
    | 'onPressStart'
    | 'onPress'
    | 'onPressCancel'

  const callback = props[eventName]
  if (callback) {
    frame.postRender(() => callback(event, extractEventInfo(event)))
  }
}

export class PressGesture extends Feature {
  isActive() {
    return Boolean(this.state.options.press)
  }

  constructor(state: MotionState) {
    super(state)
  }

  mount() {
    const element = this.state.element
    if (!element)
      return
    this.unmount = press(
      element,
      (el, startEvent) => {
        handlePressEvent(this.state, startEvent, 'Start')

        return (endEvent, { success }) =>
          handlePressEvent(
            this.state,
            endEvent,
            success ? 'End' : 'Cancel',
          )
      },
      { useGlobalTarget: this.state.options.globalPressTarget },
    )
  }
}
