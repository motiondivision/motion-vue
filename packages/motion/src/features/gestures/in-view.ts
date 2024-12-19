import { dispatchPointerEvent } from '@/utils/events'
import type { MotionState } from '@/state/motion-state'
import { BaseGesture } from '@/features'
import { inView } from 'framer-motion/dom'
import type { VisualElement } from 'framer-motion'

export class InViewGesture extends BaseGesture {
  isActive() {
    return Boolean(this.state.options.inView)
  }

  constructor(state: MotionState) {
    super(state)
    this.subscribeEvents = () => {
      const element = this.state.element
      const { once, ...viewOptions } = this.state.options.inViewOptions || {}
      return inView(element, (enterEntry) => {
        this.state.setActive('inView', true)
        this.state.visualElement.variantChildren?.forEach((child: VisualElement & { state: MotionState }) => {
          child.state.setActive('inView', true)
        })
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
