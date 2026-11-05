import { Comment, Fragment, Text, cloneVNode, onMounted, onUnmounted, withDirectives } from 'vue'
import type { ObjectDirective, VNode } from 'vue'
import type { MotionState } from '@/state'
import type { ExitFeature } from '@/features/exit/exit'
import type { AnimatePresenceProps } from './types'
import { useMotionConfig } from '@/components/motion-config/context'
import { createExitSession } from './exit-session'
import type { PresenceContext, PresenceHandler } from './presence'
import { provideAnimatePresence } from './presence'

export function usePresenceContainer(props: AnimatePresenceProps) {
  const motionConfig = useMotionConfig()

  const sessions = createExitSession({
    props,
    getNonce: () => motionConfig.value.nonce,
    onAllComplete: () => props.onExitComplete?.(),
  })

  // ===== Registry =====
  // Motion states under this AnimatePresence are registered by ExitFeature
  // (mount/unmount) via context. inject resolves to the nearest
  // ancestor, so nested AnimatePresence instances scope correctly — no DOM
  // attribute tagging or querySelectorAll discovery needed.
  const registered = new Set<MotionState>()
  const handlers = new Set<PresenceHandler>()
  // Elements the Transition renders directly. Marked while their vnode is
  // patched, not when the transition enters them: Vue skips transition.enter
  // for regular elements during hydration, but still runs directive hooks.
  const children = new WeakSet<Element>()

  const markPresenceChild: ObjectDirective<Element> = {
    created: el => children.add(el),
  }

  function markChildren(vnodes: VNode[]): VNode[] {
    return vnodes.map((vnode) => {
      if (vnode.type === Fragment) {
        const clone = cloneVNode(vnode)
        if (Array.isArray(vnode.children))
          clone.children = markChildren(vnode.children as VNode[])
        return clone
      }
      if (vnode.type === Comment || vnode.type === Text)
        return vnode
      const clone = cloneVNode(vnode)
      // cloneVNode shares the dirs array, and withDirectives pushes onto it
      clone.dirs = clone.dirs ? clone.dirs.slice() : null
      return withDirectives(clone, [[markPresenceChild]])
    })
  }

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
    registerHandler: handler => handlers.add(handler),
    unregisterHandler: handler => handlers.delete(handler),
    isChild: el => children.has(el),
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

  function findHandlers(container: Element): PresenceHandler[] {
    const found: PresenceHandler[] = []
    for (const handler of handlers) {
      const el = handler.element()
      if (el && (el === container || container.contains(el)))
        found.push(handler)
    }
    return found
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
    const exiting = findHandlers(container)

    // If no motion components, complete immediately
    if (states.length === 0 && exiting.length === 0) {
      done()
      props.onExitComplete?.()
      return
    }

    sessions.track(container, states, done, exiting)
  }

  onUnmounted(() => {
    sessions.dispose()
  })

  return {
    enter,
    exit,
    markChildren,
  }
}
