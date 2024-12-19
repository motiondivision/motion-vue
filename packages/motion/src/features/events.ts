import type { MotionEventNames } from '@/types'
import { Feature } from '@/features'

export class EventFeature extends Feature {
  private handlers: Partial<Record<MotionEventNames, (event: Event) => void>> = {}

  mount() {
    const element = this.state.element
    if (!element)
      return

    // 动画事件
    this.handlers.motionstart = (event: Event) => {
      const target = (event as CustomEvent).detail.target
      this.state.options.onMotionStart?.(target)
    }

    this.handlers.motioncomplete = (event: Event) => {
      const target = (event as CustomEvent).detail.target
      this.state.options.onMotionComplete?.(target)
    }

    // hover事件
    this.handlers.hoverstart = (event: Event) => {
      const e = (event as CustomEvent).detail
      this.state.options.onHoverStart?.(e)
    }

    this.handlers.hoverend = (event: Event) => {
      const e = (event as CustomEvent).detail
      this.state.options.onHoverEnd?.(e)
    }

    // press事件
    this.handlers.pressstart = (event: Event) => {
      const e = (event as CustomEvent).detail
      this.state.options.onPressStart?.(e)
    }

    this.handlers.pressend = (event: Event) => {
      const e = (event as CustomEvent).detail
      this.state.options.onPressEnd?.(e)
    }

    // 视图事件
    this.handlers.viewenter = (event: Event) => {
      const target = (event as CustomEvent).detail.target
      this.state.options.onViewEnter?.(target)
    }

    this.handlers.viewleave = (event: Event) => {
      const target = (event as CustomEvent).detail.target
      this.state.options.onViewLeave?.(target)
    }

    // 注册所有事件监听
    Object.entries(this.handlers).forEach(([event, handler]) => {
      element.addEventListener(event, handler)
    })
  }

  unmount() {
    const element = this.state.element
    if (!element)
      return

    // 移除所有事件监听
    Object.entries(this.handlers).forEach(([event, handler]) => {
      if (handler) {
        element.removeEventListener(event, handler)
        delete this.handlers[event as MotionEventNames]
      }
    })
  }
}
