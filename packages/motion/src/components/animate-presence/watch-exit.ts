import type { WatchStopHandle } from 'vue'
import { watch } from 'vue'
import type { ExitFeature } from '@/features/exit/exit'
import type { PresenceContext } from '@/components/animate-presence/presence'
import type { MotionState } from '@/state'

/**
 * The single exit entry point for a motion element.
 *
 * `v-if`, `v-show` and KeepAlive all surface through the presence context's
 * `isPresent`, so one watcher covers every way a child can leave. Every creator
 * of a `MotionState` under a presence context must install it — the component
 * path and the `v-motion` directive both do.
 *
 * Returns a stop handle, or `undefined` outside an AnimatePresence.
 */
export function watchPresenceExit(
  state: MotionState,
  presenceContext: PresenceContext,
): WatchStopHandle | undefined {
  if (presenceContext.isPresent === undefined)
    return undefined

  const h = watch(
    () => presenceContext.isPresent,
    (isPresent) => {
      const exit = state.getFeature<ExitFeature>('exit')
      if (!exit)
        return
      isPresent ? exit.reenter() : exit.exit()
    },
    { flush: 'pre' },
  )
  return h
}
