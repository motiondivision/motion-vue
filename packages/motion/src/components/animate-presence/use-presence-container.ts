import { onMounted, onUnmounted, watch } from 'vue'
import { mountedStates } from '@/state'
import { motionGlobalConfig } from '@/config'
import type { MotionState } from '@/state'
import type { AnimatePresenceProps } from './types'
import { usePopLayout } from './use-pop-layout'
import { provideAnimatePresence } from './presence'

interface ExitSession {
  remaining: Set<MotionState>
  states: MotionState[]
  done: VoidFunction
  el: HTMLElement
}

let apId = 0

export function usePresenceContainer(props: AnimatePresenceProps) {
  const presenceId = String(apId++)
  const exitSessions = new Map<Element, ExitSession>()

  // ===== Pop Layout =====
  const { addPopStyle, removePopStyle } = usePopLayout(props)

  // ===== Discover motion states inside a container =====
  function findMotionStates(container: Element): MotionState[] {
    const states: MotionState[] = []
    // Check container itself
    const selfState = mountedStates.get(container)
    if (selfState && container.getAttribute(motionGlobalConfig.motionAttribute) === presenceId) {
      states.push(selfState)
    }
    // Query descendants scoped to this AnimatePresence
    const elements = Array.from(container.querySelectorAll(`[${motionGlobalConfig.motionAttribute}="${presenceId}"]`))
    for (const el of elements) {
      const s = mountedStates.get(el)
      if (s) {
        states.push(s)
      }
    }
    return states
  }

  // ===== Exit completion callback =====
  function onMotionExitComplete(container: Element, state: MotionState) {
    const session = exitSessions.get(container)
    if (!session)
      return

    session.remaining.delete(state)

    if (session.remaining.size === 0) {
      finalizeExit(session)
    }
  }

  // ===== Provide Context =====
  const presenceContext = {
    initial: props.initial,
    custom: props.custom,
    presenceId,
    onMotionExitComplete,
  }

  watch(() => props.custom, (v) => {
    presenceContext.custom = v
  }, { flush: 'pre' })

  provideAnimatePresence(presenceContext)

  onMounted(() => {
    presenceContext.initial = undefined
  })

  // ===== Finalize Exit =====
  function finalizeExit(session: ExitSession) {
    removePopStyle(session.el)
    session.states.forEach((state) => {
      state.getSnapshot(state.options, false)
    })
    // Call done to remove DOM
    session.done()
    exitSessions.delete(session.el)

    // Unmount motion states
    if (!session.el?.isConnected) {
      session.states.forEach((state) => {
        state.unmount()
      })
    }
    else {
      session.states[0]?.didUpdate()
    }
    props.onExitComplete?.()
  }

  // ===== Transition Handlers =====

  function enter(el: HTMLElement, done: VoidFunction) {
    const states = findMotionStates(el)
    states.forEach((state) => {
      state.setActive('exit', false)
      state.getSnapshot(state.options, true)
    })
    done()
  }

  function exit(el: Element, done: VoidFunction) {
    const container = el as HTMLElement
    // Discover all motion states inside this container at exit time
    const states = findMotionStates(container)

    // If no motion components, complete immediately
    if (states.length === 0) {
      done()
      props.onExitComplete?.()
      return
    }

    // Create transient exit session
    const session: ExitSession = {
      remaining: new Set(states),
      states,
      done,
      el: container,
    }
    exitSessions.set(container, session)

    addPopStyle(container)

    // Lazily set presenceContainer and trigger exit animation
    states.forEach((state) => {
      state.presenceContainer = container
      state.setActive('exit', true)
      state.getSnapshot(state.options, false)
    })
    states[0]?.didUpdate()
  }

  onUnmounted(() => {
    exitSessions.forEach((session) => {
      session.states.forEach((state) => {
        state.unmount()
      })
    })
    exitSessions.clear()
  })

  return {
    enter,
    exit,
  }
}
