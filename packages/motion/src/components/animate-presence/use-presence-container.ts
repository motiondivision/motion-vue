import { onMounted, onUnmounted } from 'vue'
import type { AnimatePresenceProps } from './types'
import { useMotionConfig } from '@/components/motion-config/context'
import { createExitSession } from './exit-session'
import type { PresenceContext } from './presence'
import { provideAnimatePresence } from './presence'

export function usePresenceContainer(props: AnimatePresenceProps) {
  const motionConfig = useMotionConfig()

  const session = createExitSession({
    props,
    getNonce: () => motionConfig.value.nonce,
    onAllComplete: () => props.onExitComplete?.(),
  })

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
    register: session.register,
    unregister: session.unregister,
    registerHandler: session.registerHandler,
    unregisterHandler: session.unregisterHandler,
    isChild: session.isChild,
  }

  provideAnimatePresence(presenceContext)

  onMounted(() => {
    hasMounted = true
  })

  onUnmounted(() => {
    session.dispose()
  })

  return {
    enter: session.enter,
    exit: session.exit,
  }
}
