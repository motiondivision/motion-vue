import { dispatchPointerEvent } from '@/utils/events'
import { Feature } from '@/features/feature'
import type { MotionEventNames } from '@/types'

export abstract class BaseGesture extends Feature {
  abstract isActive(): boolean
  removeGestureSubscriptions?: VoidFunction
  subscribeEvents?: () => VoidFunction
  protected updateGestureSubscriptions(
  ) {
    const isActive = this.isActive()
    if (isActive && !this.removeGestureSubscriptions) {
      this.removeGestureSubscriptions = this.subscribeEvents()
    }
    else if (!isActive && this.removeGestureSubscriptions) {
      this.removeGestureSubscriptions()
      this.removeGestureSubscriptions = undefined
    }
  }

  unmount() {
    this.removeGestureSubscriptions?.()
  }
}

export function createGestureEvent(
  element: Element,
  name: MotionEventNames,
  action: VoidFunction,
) {
  return (event: PointerEvent) => {
    action()
    dispatchPointerEvent(element, name, event)
  }
}
