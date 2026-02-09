import { Feature } from '@/features/feature'
import { frame } from 'motion-dom'
import { inView } from 'framer-motion/dom'

export class InViewGesture extends Feature {
  static key = 'inView' as const

  private removeObserver: VoidFunction | undefined

  private isActive() {
    const { whileInView, onViewportEnter, onViewportLeave } = this.node.props as any
    return Boolean(whileInView || onViewportEnter || onViewportLeave)
  }

  private startObserver() {
    const element = this.node.current as Element
    if (!element || !this.isActive())
      return

    this.removeObserver?.()
    const { once, ...viewOptions } = (this.node.props as any).inViewOptions || {}
    this.removeObserver = inView(
      element,
      (_, entry) => {
        const props = this.node.props as any
        this.node.animationState?.setActive('whileInView' as any, true)
        if (props.onViewportEnter) {
          frame.postRender(() => props.onViewportEnter(entry))
        }
        if (!once) {
          return () => {
            this.node.animationState?.setActive('whileInView' as any, false)
            const leaveCallback = (this.node.props as any).onViewportLeave
            if (leaveCallback) {
              frame.postRender(() => leaveCallback(entry))
            }
          }
        }
      },
      viewOptions,
    )
  }

  mount() {
    this.startObserver()
  }

  update() {
    const { props, prevProps } = this.node
    const hasOptionsChanged = ['amount', 'margin', 'root'].some((name) => {
      const current = (props as any).inViewOptions?.[name]
      const prev = (prevProps as any)?.inViewOptions?.[name]
      return current !== prev
    })
    if (hasOptionsChanged) {
      this.startObserver()
    }
  }

  unmount() {
    this.removeObserver?.()
    this.removeObserver = undefined
  }
}
