import { useMotionConfig } from '@/components/motion-config/context'
import type { AnimatePresenceProps } from './types'
import type { MotionState } from '@/state'
import { frame } from 'framer-motion/dom'

export function usePopLayout(props: AnimatePresenceProps) {
  const styles = new WeakMap<MotionState, HTMLStyleElement>()
  const config = useMotionConfig()
  function addPopStyle(state: MotionState) {
    if (props.mode !== 'popLayout')
      return
    const parent = state.element.offsetParent
    const parentWidth
                = parent instanceof HTMLElement ? parent.offsetWidth || 0 : 0
    const size = {
      height: state.element.offsetHeight || 0,
      width: state.element.offsetWidth || 0,
      top: state.element.offsetTop,
      left: state.element.offsetLeft,
      right: 0,
    }
    size.right = parentWidth - size.width - size.left
    const x = props.anchorX === 'left' ? `left: ${size.left}` : `right: ${size.right}`

    state.element.dataset.motionPopId = state.id
    const style = document.createElement('style')
    if (config.value.nonce) {
      style.nonce = config.value.nonce
    }
    styles.set(state, style)
    document.head.appendChild(style)
    if (style.sheet) {
      style.sheet.insertRule(`
    [data-motion-pop-id="${state.id}"] {
      position: absolute !important;
      width: ${size.width}px !important;
      height: ${size.height}px !important;
      top: ${size.top}px !important;
      ${x}px !important;
      }
      `)
    }
  }

  function removePopStyle(state: MotionState) {
    const style = styles.get(state)
    if (!style)
      return
    styles.delete(state)
    frame.render(() => {
      document.head.removeChild(style)
    })
  }
  return {
    addPopStyle,
    removePopStyle,
    styles,
  }
}
