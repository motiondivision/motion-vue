import { Feature } from '@/features/feature'
import { extractEventInfo } from '@/events/event-info'
import { frame, hover } from 'motion-dom'

export class HoverGesture extends Feature {
  static key = 'hover' as const

  private removeHover: VoidFunction | undefined

  private isActive() {
    const { whileHover, onHoverStart, onHoverEnd } = this.node.props as any
    return Boolean(whileHover || onHoverStart || onHoverEnd)
  }

  private register() {
    const element = this.node.current as HTMLElement
    if (!element || !this.isActive())
      return

    this.removeHover?.()
    this.removeHover = hover(
      element,
      (_el, startEvent) => {
        const props = this.node.props as any
        this.node.animationState?.setActive('whileHover' as any, true)
        if (props.onHoverStart) {
          frame.postRender(() => props.onHoverStart(startEvent, extractEventInfo(startEvent)))
        }
        return (endEvent) => {
          this.node.animationState?.setActive('whileHover' as any, false)
          const callback = (this.node.props as any).onHoverEnd
          if (callback) {
            frame.postRender(() => callback(endEvent, extractEventInfo(endEvent)))
          }
        }
      },
    )
  }

  mount() {
    this.register()
  }

  update() {
    const prev = this.node.prevProps as any
    const wasActive = Boolean(prev?.whileHover || prev?.onHoverStart || prev?.onHoverEnd)
    if (!wasActive && this.isActive()) {
      this.register()
    }
  }

  unmount() {
    this.removeHover?.()
    this.removeHover = undefined
  }
}
