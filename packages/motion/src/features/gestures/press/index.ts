import type { MotionState } from '@/state/motion-state'
import { Feature } from '@/features'
import { frame, press } from 'motion-dom'
import type { EventInfo } from 'motion-dom'

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
    const { whilePress, onPress, onPressCancel, onPressStart } = this.state.options
    return Boolean(whilePress || onPress || onPressCancel || onPressStart)
  }

  constructor(state: MotionState) {
    super(state)
  }

  mount() {
    this.register()
  }

  update() {
    const { whilePress, onPress, onPressCancel, onPressStart } = this.state.options
    // Re-register if whilePress changes
    if (!(whilePress || onPress || onPressCancel || onPressStart)) {
      this.register()
    }
  }

  register() {
    const element = this.state.element
    if (!element || !this.isActive())
      return
    // Unmount previous press handler
    this.unmount()
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
