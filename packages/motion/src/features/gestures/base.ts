import { Feature } from '@/features/feature'

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
