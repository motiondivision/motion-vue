import { onMounted, onUnmounted, watch } from 'vue'
import { mountedStates } from '@/state'
import type { MotionState } from '@/state'
import type { AnimatePresenceProps } from './types'
import { usePopLayout } from './use-pop-layout'
import { PRESENCE_CHILD_ATTR, provideAnimatePresence } from './presence'

interface ContainerState {
  motions: Set<MotionState>
  exitingMotions: Set<MotionState>
  done?: VoidFunction
  el: HTMLElement
}

export function usePresenceContainer(props: AnimatePresenceProps) {
  // ===== Container State Management =====
  const containerStates = new Map<Element, ContainerState>()
  // Pending states for SSR hydration scenario (enter hook not triggered)
  const pendingStates = new Set<MotionState>()

  // ===== Pop Layout =====
  const { addPopStyle, removePopStyle } = usePopLayout(props)

  // ===== Context Methods =====

  // Called by motion component on mount
  function register(container: Element, state: MotionState) {
    let containerState = containerStates.get(container)
    if (!containerState) {
      containerState = {
        motions: new Set(),
        exitingMotions: new Set(),
        el: container as HTMLElement,
      }
      containerStates.set(container, containerState)
    }
    containerState.motions.add(state)
  }

  // Called when a motion component's exit animation is complete
  function onMotionExitComplete(container: Element, state: MotionState) {
    const containerState = containerStates.get(container)
    if (!containerState)
      return

    containerState.exitingMotions.delete(state)

    // When all motion components have completed exit
    if (containerState.exitingMotions.size === 0 && containerState.done) {
      finalizeExit(containerState)
    }
  }

  // Register a motion component to pending list (for SSR hydration scenario)
  function registerPending(state: MotionState) {
    pendingStates.add(state)
  }

  // Unregister a motion component from pending list
  function unregisterPending(state: MotionState) {
    pendingStates.delete(state)
  }

  // ===== Provide Context =====
  const presenceContext = {
    initial: props.initial,
    custom: props.custom,
    register,
    onMotionExitComplete,
    registerPending,
    unregisterPending,
  }

  watch(() => props.custom, (v) => {
    presenceContext.custom = v
  }, { flush: 'pre' })

  provideAnimatePresence(presenceContext)

  onMounted(() => {
    presenceContext.initial = undefined
  })

  // ===== Mark Children with PRESENCE_CHILD_ATTR =====
  function markChild(el: Element) {
    if (el instanceof HTMLElement && !el.hasAttribute(PRESENCE_CHILD_ATTR)) {
      el.setAttribute(PRESENCE_CHILD_ATTR, '')
      // If child is a motion component, register it
      const state = mountedStates.get(el)
      if (state && !state.presenceContainer) {
        state.presenceContainer = el
        register(el, state)
      }
    }
  }

  // ===== Finalize Exit =====
  function finalizeExit(containerState: ContainerState) {
    // Remove pop style
    removePopStyle(containerState.el)
    // Call done to remove DOM
    containerState.done?.()
    containerState.done = undefined

    // Unmount motion states
    if (!containerState.el?.isConnected) {
      containerState.motions.forEach((state) => {
        state.unmount()
      })
      containerState.motions.clear()
    }
    else {
      containerState.motions.values().next()?.value?.didUpdate()
    }
    props.onExitComplete?.()
  }

  // ===== Transition Handlers =====

  function enter(el: HTMLElement, done: VoidFunction) {
    markChild(el)
    // Reset exit state for all motion components in this container
    const containerState = containerStates.get(el)
    if (containerState) {
      containerState.exitingMotions.clear()
      containerState.motions.forEach((s) => {
        s.setActive('exit', false)
        s.getSnapshot(s.options, true)
      })
    }
    done()
  }

  function exit(el: Element, done: VoidFunction) {
    const container = el as HTMLElement
    markChild(container)

    // Register pending states that belong to this container (SSR hydration scenario)
    pendingStates.forEach((state) => {
      if (state.element && container.contains(state.element)) {
        state.presenceContainer = container
        register(container, state)
        pendingStates.delete(state)
      }
    })

    const containerState = containerStates.get(container)
    const containerMotionState = mountedStates.get(container)

    // If no registered motion components, complete immediately
    if ((!containerState || containerState.motions.size === 0) && !containerMotionState) {
      done()
      props.onExitComplete?.()
      return
    }

    // Save done callback
    containerState.done = done

    // Add pop style to the container
    addPopStyle(container)

    // Trigger exit animation for all motion components
    containerState.motions.forEach((state) => {
      containerState.exitingMotions.add(state)
      state.setActive('exit', true)
      state.getSnapshot(state.options, false)
    })
    containerState.motions.values().next()?.value?.didUpdate()
  }

  onUnmounted(() => {
    // Unmount all motion states in all containers
    containerStates.forEach((containerState) => {
      containerState.motions.forEach((state) => {
        state.unmount()
      })
    })
    containerStates.clear()
  })

  return {
    enter,
    exit,
  }
}
