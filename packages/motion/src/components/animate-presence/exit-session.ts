import { frame } from 'framer-motion/dom'
import type { MotionState } from '@/state'
import type { ExitFeature } from '@/features/exit/exit'
import type { AnimatePresenceProps } from './types'

export interface ExitSessionConfig {
  // Read lazily at track time — mode/anchorX are reactive props
  props: Pick<AnimatePresenceProps, 'mode' | 'anchorX'>
  getNonce: () => string | undefined
  onAllComplete: () => void
}

interface ExitSession {
  el: HTMLElement
  states: MotionState[]
  done: VoidFunction
  aborted: boolean
  popStyle?: HTMLStyleElement
}

let popId = 0

/**
 * Bookkeeping unit for AnimatePresence exits: one session per exiting
 * container element. Owns pop-layout styling and the fan-in toward
 * `onAllComplete`. `abort` cancels a session whose element re-entered
 * mid-exit; its states' exit promises then resolve silently.
 */
export function createExitSession(config: ExitSessionConfig) {
  const sessions = new Map<HTMLElement, ExitSession>()

  // ===== Pop layout =====

  function addPopStyle(session: ExitSession) {
    if (config.props.mode !== 'popLayout')
      return

    const element = session.el
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
    const x = config.props.anchorX === 'left' ? `left: ${size.left}px` : `right: ${size.right}px`

    // Use unique pop id for CSS selector
    const elementPopId = `pop-${popId++}`
    element.dataset.motionPopId = elementPopId
    const style = document.createElement('style')
    const nonce = config.getNonce()
    if (nonce) {
      style.nonce = nonce
    }
    session.popStyle = style
    document.head.appendChild(style)
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
  }

  function removePopStyle(session: ExitSession) {
    const style = session.popStyle
    if (!style)
      return
    session.popStyle = undefined
    frame.render(() => {
      document.head.removeChild(style)
    })
  }

  // ===== Session lifecycle =====

  function track(el: HTMLElement, states: MotionState[], done: VoidFunction) {
    const session: ExitSession = { el, states, done, aborted: false }
    sessions.set(el, session)
    addPopStyle(session)

    const completions = states.map(state =>
      state.getFeature<ExitFeature>('exit')?.exit() ?? Promise.resolve(),
    )

    Promise.all(completions).then(() => {
      if (!session.aborted)
        finalize(session)
    })
  }

  function abort(el: HTMLElement) {
    const session = sessions.get(el)
    if (!session)
      return
    session.aborted = true
    sessions.delete(el)
    removePopStyle(session)
  }

  function finalize(session: ExitSession) {
    sessions.delete(session.el)
    removePopStyle(session)
    session.states.forEach((state) => {
      state.getSnapshot(false)
    })
    // Call done to remove DOM
    session.done()

    if (!session.el.isConnected) {
      session.states.forEach((state) => {
        state.unmount()
      })
    }
    config.onAllComplete()
  }

  function dispose() {
    sessions.forEach((session) => {
      session.states.forEach((state) => {
        state.unmount()
      })
    })
    sessions.clear()
  }

  return {
    track,
    abort,
    dispose,
  }
}
