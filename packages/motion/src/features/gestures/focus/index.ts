import { pipe } from 'motion-utils'
import { addDomEvent } from '@/events'
import { Feature } from '@/features/feature'

export class FocusGesture extends Feature {
  static key = 'focus' as const

  private isFocused = false
  private removeFocus: VoidFunction | undefined

  private onFocus() {
    let isFocusVisible = false
    /**
     * If this element doesn't match focus-visible then don't
     * apply whileFocus. But, if matches throws that focus-visible
     * is not a valid selector then in that browser outline styles will be applied
     * to the element by default and we want to match that behaviour with whileFocus.
     */
    try {
      isFocusVisible = (this.node.current as Element).matches(':focus-visible')
    }
    catch {
      isFocusVisible = true
    }
    if (!isFocusVisible)
      return
    this.node.animationState?.setActive('whileFocus', true)
    this.isFocused = true
  }

  private onBlur() {
    if (!this.isFocused)
      return
    this.node.animationState?.setActive('whileFocus' as any, false)
    this.isFocused = false
  }

  mount() {
    const element = this.node.current as Element
    this.removeFocus = pipe(
      addDomEvent(element, 'focus', () => this.onFocus()),
      addDomEvent(element, 'blur', () => this.onBlur()),
    ) as VoidFunction
  }

  unmount() {
    this.removeFocus?.()
    this.removeFocus = undefined
  }
}
