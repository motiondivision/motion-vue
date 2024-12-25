import { useMotionConfig } from '@/components/motion-config/context'
import type { AnimatePresenceProps } from './types'
import type { MotionState } from '@/state'

export function usePopLayout(props: AnimatePresenceProps) {
  const styles = new WeakMap<MotionState, HTMLStyleElement>()
  const config = useMotionConfig()

  function addPopStyle(state: MotionState) {
    if (props.mode !== 'popLayout')
      return
    const size = {
      height: state.element.offsetHeight || 0,
      width: state.element.offsetWidth || 0,
      top: state.element.offsetTop,
      left: state.element.offsetLeft,
    }
    state.element.dataset.motionPopId = state.id
    const style = document.createElement('style')
    if (config.value.nonce) {
      style.nonce = config.value.nonce
    }
    styles.set(state, style)
    document.head.appendChild(style)
    style.textContent = `
      [data-motion-pop-id="${state.id}"] {
        animation: pop 0.3s ease-in-out;
      }
    `
    if (style.sheet) {
      style.sheet.insertRule(`
    [data-motion-pop-id="${state.id}"] {
      position: absolute !important;
      width: ${size.width}px !important;
      height: ${size.height}px !important;
      top: ${size.top}px !important;
          left: ${size.left}px !important;
        }
      `)
    }
  }

  function removePopStyle(state: MotionState) {
    const style = styles.get(state)
    if (style) {
      styles.delete(state)
      document.head.removeChild(style)
    }
  }
  return {
    addPopStyle,
    removePopStyle,
  }
}
