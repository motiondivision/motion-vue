import { frame } from 'motion-dom'
import type { PresenceMode } from './core/presence-core'

let popId = 0

export interface PopLayoutOptions {
  mode: PresenceMode
  anchorX: 'left' | 'right'
  getNonce: () => string | undefined
}

/**
 * popLayout: pull the exiting element out of flow with an injected
 * stylesheet (inline style would clobber the user's style binding), so
 * siblings reflow immediately while the exit animation plays in place.
 */
export function addPopStyle(el: HTMLElement, options: PopLayoutOptions): HTMLStyleElement | undefined {
  if (options.mode !== 'popLayout')
    return undefined

  const parent = el.offsetParent
  const parentWidth = parent instanceof HTMLElement ? parent.offsetWidth || 0 : 0
  const size = {
    height: el.offsetHeight || 0,
    width: el.offsetWidth || 0,
    top: el.offsetTop,
    left: el.offsetLeft,
    right: 0,
  }
  size.right = parentWidth - size.width - size.left
  const x = options.anchorX === 'left' ? `left: ${size.left}px` : `right: ${size.right}px`

  const elementPopId = `pop-${popId++}`
  el.dataset.motionPopId = elementPopId
  // Use the element's own document so popLayout works when the tree
  // renders into another window or iframe
  const doc = el.ownerDocument
  const style = doc.createElement('style')
  const nonce = options.getNonce()
  if (nonce)
    style.nonce = nonce
  doc.head.appendChild(style)
  if (style.sheet) {
    style.sheet.insertRule(`
    [data-motion-pop-id="${elementPopId}"] {
      position: absolute !important;
      width: ${size.width}px !important;
      height: ${size.height}px !important;
      top: ${size.top}px !important;
      ${x} !important;
    }
    `)
  }
  return style
}

export function removePopStyle(style: HTMLStyleElement | undefined) {
  if (!style)
    return
  frame.render(() => {
    style.parentNode?.removeChild(style)
  })
}
