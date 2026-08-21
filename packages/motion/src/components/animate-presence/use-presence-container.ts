import { onMounted, onUnmounted } from 'vue'
import { mountedStates } from '@/state'
import { motionGlobalConfig } from '@/config'
import type { MotionState } from '@/state'
import type { AnimatePresenceProps } from './types'
import { useMotionConfig } from '@/components/motion-config/context'
import { createExitSession } from './exit-session'
import type { PresenceContext } from './presence'
import { provideAnimatePresence } from './presence'

let apId = 0

export function usePresenceContainer(props: AnimatePresenceProps) {
  const presenceId = String(apId++)
  const motionConfig = useMotionConfig()

  const sessions = createExitSession({
    props,
    getNonce: () => motionConfig.value.nonce,
    onAllComplete: () => props.onExitComplete?.(),
  })

  // ===== Provide Context =====
  // Pure data, never mutated after provide: `initial`/`custom` are getters,
  // so consumers read current values lazily by construction.
  let hasMounted = false
  const presenceContext: PresenceContext = {
    get initial() {
      return hasMounted ? undefined : props.initial
    },
    get custom() {
      return props.custom
    },
    presenceId,
  }

  provideAnimatePresence(presenceContext)

  onMounted(() => {
    hasMounted = true
  })

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

  // ===== Transition Handlers =====

  function enter(el: HTMLElement, done: VoidFunction) {
    sessions.abort(el)
    const states = findMotionStates(el)
    states.forEach((state) => {
      state.reenter()
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

    sessions.track(container, states, done)
  }

  onUnmounted(() => {
    sessions.dispose()
  })

  return {
    enter,
    exit,
  }
}
