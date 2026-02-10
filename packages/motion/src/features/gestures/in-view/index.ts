import { Feature } from '@/features/feature'
import { frame } from 'motion-dom'
import { inView } from 'framer-motion/dom'

export class InViewGesture extends Feature {
  static key = 'inView' as const

  private removeObserver: VoidFunction | undefined

  constructor(state) {
    super(state)
  }

  private isActive() {
    const { whileInView, onViewportEnter, onViewportLeave } = this.state.options as any
    return Boolean(whileInView || onViewportEnter || onViewportLeave)
  }

  private startObserver() {
    const element = this.state.element as Element
    if (!element || !this.isActive())
      return

    this.removeObserver?.()
    const { once, ...viewOptions } = (this.state.options as any).inViewOptions || {}
    this.removeObserver = inView(
      element,
      (_, entry) => {
        const props = this.state.options as any
        this.state.setActive('whileInView', true)
        if (props.onViewportEnter) {
          frame.postRender(() => props.onViewportEnter(entry))
        }
        if (!once) {
          return () => {
            this.state.setActive('whileInView', false)
            const leaveCallback = (this.state.options as any).onViewportLeave
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
    const { props, prevProps } = this.state.visualElement
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
