import { pipe } from 'motion-utils'
import { addDomEvent } from '@/events'
import { Feature } from '@/features/feature'

export class FocusGesture extends Feature {
  private isActive = false

  onFocus() {
    let isFocusVisible = false
    /**
     * If this element doesn't match focus-visible then don't
     * apply whileHover. But, if matches throws that focus-visible
     * is not a valid selector then in that browser outline styles will be applied
     * to the element by default and we want to match that behaviour with whileFocus.
     */
    try {
      isFocusVisible = this.state.element.matches(':focus-visible')
    }
    catch (e) {
      isFocusVisible = true
    }
    if (!isFocusVisible)
      return
    this.state.setActive('whileFocus', true)
    this.isActive = true
  }

  onBlur() {
    if (!this.isActive)
      return
    this.state.setActive('whileFocus', false)
    this.isActive = false
  }

  mount() {
    this.unmount = pipe(
      addDomEvent(this.state.element!, 'focus', () => this.onFocus()),
      addDomEvent(this.state.element!, 'blur', () => this.onBlur()),
    ) as VoidFunction
  }
}
