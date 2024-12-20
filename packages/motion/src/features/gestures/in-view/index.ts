import type { MotionState } from '@/state/motion-state'
import { Feature } from '@/features'
import { frame, inView } from 'framer-motion/dom'

function handleHoverEvent(
  state: MotionState,
  entry: IntersectionObserverEntry,
  lifecycle: 'Enter' | 'Leave',
) {
  const props = state.options
  if (props.inView) {
    state.setActive('inView', lifecycle === 'Enter')
  }

  const eventName = (`onViewport${lifecycle}`) as
    | 'onViewportEnter'
    | 'onViewportLeave'

  const callback = props[eventName]
  if (callback) {
    frame.postRender(() => callback(entry))
  }
}

export class InViewGesture extends Feature {
  isActive() {
    return Boolean(this.state.getOptions().inView)
  }

  constructor(state: MotionState) {
    super(state)
  }

  mount() {
    const element = this.state.element
    if (!element)
      return
    this.unmount = inView(
      element,
      (entry) => {
        handleHoverEvent(this.state, entry, 'Enter')
        return (endEvent) => {
          handleHoverEvent(this.state, entry, 'Leave')
        }
      },
    )
  }
}
