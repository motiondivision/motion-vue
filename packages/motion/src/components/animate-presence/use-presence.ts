import { onMounted, onUnmounted, onUpdated } from 'vue'
import type { PresenceHandler } from './presence'
import { injectAnimatePresence } from './presence'

/**
 * Lets a component run its own exit when an `AnimatePresence` removes it,
 * for components that animate out without a `motion` element's `exit`.
 *
 * AnimatePresence keeps the component mounted until the promise `onExit`
 * returns resolves, so teardown the exit needs (an engine, listeners) can
 * wait for that promise or for `onUnmounted`, which runs right after.
 * `onEnter` runs if the element comes back while its exit is running.
 *
 * Outside an `AnimatePresence` it does nothing.
 */
export function usePresence(handler: PresenceHandler) {
  const presence = injectAnimatePresence({})
  if (!presence.registerHandler)
    return
  // Template refs are cleared before the leave starts, so the element is
  // read while mounted and kept.
  let element: Element | null | undefined
  const read = () => {
    element = handler.element() ?? element
  }
  const registered: PresenceHandler = { ...handler, element: () => element }
  onMounted(() => {
    read()
    presence.registerHandler!(registered)
  })
  onUpdated(read)
  // `exit` captures the handler while the subtree unmounts, before this.
  onUnmounted(() => presence.unregisterHandler!(registered))
}
