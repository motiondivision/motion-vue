import { onMounted, onUnmounted } from 'vue'
import type { MotionState } from '@/state'
import type { ExitFeature } from '@/features/exit/exit'
import type { AnimatePresenceProps } from './types'
import { useMotionConfig } from '@/components/motion-config/context'
import { createExitSession } from './exit-session'
import type { PresenceContext } from './presence'
import { provideAnimatePresence } from './presence'

export function usePresenceContainer(props: AnimatePresenceProps) {
  const motionConfig = useMotionConfig()

  const sessions = createExitSession({
    props,
    getNonce: () => motionConfig.value.nonce,
    onAllComplete: () => props.onExitComplete?.(),
  })

  // ===== Registry =====
  // Motion states under this AnimatePresence register themselves via context
  // (MotionState constructor/teardown). inject resolves to the nearest
  // ancestor, so nested AnimatePresence instances scope correctly — no DOM
  // attribute tagging or querySelectorAll discovery needed.
  const registered = new Set<MotionState>()

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
    register: state => registered.add(state),
    unregister: state => registered.delete(state),
  }

  provideAnimatePresence(presenceContext)

  onMounted(() => {
    hasMounted = true
  })

  // ===== Discover motion states inside a container =====
  // The leaving subtree is exactly the container's descendants — filter the
  // registry by reference containment instead of querying the DOM.
  function findMotionStates(container: Element): MotionState[] {
    const states: MotionState[] = []
    for (const state of registered) {
      const el = state.element
      if (el && (el === container || container.contains(el))) {
        states.push(state)
      }
    }
    return states
  }

  // ===== Transition Handlers =====

  function enter(el: HTMLElement, done: VoidFunction) {
    sessions.abort(el)
    const states = findMotionStates(el)
    states.forEach((state) => {
      state.getFeature<ExitFeature>('exit')?.reenter()
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
