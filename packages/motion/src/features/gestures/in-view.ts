import { dispatchPointerEvent } from '@/utils/events'
import type { MotionState } from '@/state/motion-state'
import { BaseGesture } from '@/features'
import { inView } from 'framer-motion/dom'

export class InViewGesture extends BaseGesture {
  isActive() {
    return Boolean(this.state.getOptions().inView)
  }

  constructor(state: MotionState) {
    super(state)
    this.subscribeEvents = () => {
      const element = this.state.element
      const { once, ...viewOptions } = this.state.getOptions()?.inViewOptions || {}
      return inView(element, (enterEntry) => {
        this.state.setActive('inView', true)
        dispatchPointerEvent(element, 'viewenter', enterEntry)
        if (!once) {
          return (leaveEntry) => {
            this.state.setActive('inView', false)
            dispatchPointerEvent(element, 'viewleave', leaveEntry)
          }
        }
      }, viewOptions)
    }
  }

  mount() {
    this.updateGestureSubscriptions()
  }

  update() {
    this.updateGestureSubscriptions()
  }
}
