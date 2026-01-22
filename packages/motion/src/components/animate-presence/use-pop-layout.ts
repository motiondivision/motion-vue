import { useMotionConfig } from '@/components/motion-config/context'
import type { AnimatePresenceProps } from './types'
import { PRESENCE_CHILD_ATTR } from './presence'
import { frame } from 'framer-motion/dom'

let popId = 0

export function usePopLayout(props: AnimatePresenceProps) {
  const styles = new WeakMap<Element, HTMLStyleElement>()
  const config = useMotionConfig()

  function addPopStyle(element: HTMLElement) {
    if (props.mode !== 'popLayout')
      return

    const parent = element.offsetParent
    const parentWidth = parent instanceof HTMLElement ? parent.offsetWidth || 0 : 0
    const size = {
      height: element.offsetHeight || 0,
      width: element.offsetWidth || 0,
      top: element.offsetTop,
      left: element.offsetLeft,
      right: 0,
    }
    size.right = parentWidth - size.width - size.left
    const x = props.anchorX === 'left' ? `left: ${size.left}px` : `right: ${size.right}px`

    // Use unique pop id for CSS selector
    const elementPopId = `pop-${popId++}`
    element.setAttribute(PRESENCE_CHILD_ATTR, elementPopId)

    const style = document.createElement('style')
    if (config.value.nonce) {
      style.nonce = config.value.nonce
    }
    styles.set(element, style)
    document.head.appendChild(style)
    if (style.sheet) {
      style.sheet.insertRule(`
    [${PRESENCE_CHILD_ATTR}="${elementPopId}"] {
      position: absolute !important;
      width: ${size.width}px !important;
      height: ${size.height}px !important;
      top: ${size.top}px !important;
      ${x} !important;
      }
      `)
    }
  }

  function removePopStyle(element: HTMLElement) {
    const style = styles.get(element)
    if (!style)
      return
    styles.delete(element)
    frame.render(() => {
      document.head.removeChild(style)
    })
  }

  return {
    addPopStyle,
    removePopStyle,
  }
}
