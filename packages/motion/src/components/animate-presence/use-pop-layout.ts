import { useMotionConfig } from '@/components/motion-config/context'
import type { AnimatePresenceProps } from './types'
import type { MotionState } from '@/state'
import { frame } from 'framer-motion/dom'

export function usePopLayout(props: AnimatePresenceProps) {
  const styles = new WeakMap<MotionState, HTMLStyleElement>()
  const config = useMotionConfig()
  function addPopStyle(state: MotionState, element: HTMLElement) {
    if (props.mode !== 'popLayout')
      return
    const parent = element.offsetParent
    const parentWidth
                = parent instanceof HTMLElement ? parent.offsetWidth || 0 : 0
    const size = {
      height: element.offsetHeight || 0,
      width: element.offsetWidth || 0,
      top: element.offsetTop,
      left: element.offsetLeft,
      right: 0,
    }
    size.right = parentWidth - size.width - size.left
    const x = props.anchorX === 'left' ? `left: ${size.left}px` : `right: ${size.right}px`

    // Only set motionPopId if it doesn't exist, and use a prefix to distinguish from motion element
    if (!element.dataset.motionPopId) {
      element.dataset.motionPopId = `presence-${state.id}`
    }
    const popId = element.dataset.motionPopId
    const style = document.createElement('style')
    if (config.value.nonce) {
      style.nonce = config.value.nonce
    }
    styles.set(state, style)
    document.head.appendChild(style)
    if (style.sheet) {
      style.sheet.insertRule(`
    [data-motion-pop-id="${popId}"] {
      position: absolute !important;
      width: ${size.width}px !important;
      height: ${size.height}px !important;
      top: ${size.top}px !important;
      ${x} !important;
      }
      `)
    }
  }

  function removePopStyle(state: MotionState, element: HTMLElement) {
    const style = styles.get(state)
    if (!style)
      return
    styles.delete(state)
    frame.render(() => {
      document.head.removeChild(style)
      if (element)
        element.dataset.motionPopId = ''
    })
  }
  return {
    addPopStyle,
    removePopStyle,
    styles,
  }
}
