import { isSSR } from '@/utils/is'

let hasInsertedTransitionResetStyle = false

/**
 * Force all view transition pseudo-elements to linear timing so Motion
 * transitions fully control the easing via `updateTiming`.
 */
export function injectViewTransitionResetStyles(): void {
  if (hasInsertedTransitionResetStyle || isSSR)
    return
  hasInsertedTransitionResetStyle = true

  const style = document.createElement('style')
  style.textContent = `
    ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) {
        animation-timing-function: linear !important;
    }
    `
  document.head.appendChild(style)
}
