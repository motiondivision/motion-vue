import { dispatchPointerEvent } from '@/utils/events'
import type { MotionState } from '@/state/motion-state'
import { BaseGesture } from '@/state/features/gestures'

export class PressGesture extends BaseGesture {
  isActive() {
    return Boolean(this.state.getOptions().press)
  }

  constructor(state: MotionState) {
    super(state)
    this.subscribeEvents = () => {
      const element = this.state.getElement()

      const onPointerUp = (event: PointerEvent) => {
        this.state.setActive('press', false)
        dispatchPointerEvent(element, 'pressend', event)
        window.removeEventListener('pointerup', onPointerUp)
      }

      const onPointerDown = (event: PointerEvent) => {
        this.state.setActive('press', true)
        dispatchPointerEvent(element, 'pressstart', event)
        window.addEventListener('pointerup', onPointerUp)
      }

      element.addEventListener('pointerdown', onPointerDown as EventListener)

      return () => {
        element.removeEventListener('pointerdown', onPointerDown as EventListener)
        window.removeEventListener('pointerup', onPointerUp)
      }
    }
  }

  mount() {
    this.updateGestureSubscriptions()
  }

  update() {
    this.updateGestureSubscriptions()
  }
}
