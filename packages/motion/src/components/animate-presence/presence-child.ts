import type { PropType, VNode } from 'vue'
import { defineComponent, getCurrentInstance, watch } from 'vue'
import type { MotionState } from '@/state'
import type { ExitFeature } from '@/features/exit/exit'
import { useMotionConfig } from '@/components/motion-config/context'
import type { PresenceMode } from './core/presence-core'
import type { PresenceHandler } from './presence'
import { provideAnimatePresence } from './presence'
import { addPopStyle, removePopStyle } from './pop-layout'

/**
 * Per-key wrapper rendered by AnimatePresence. Owns one child's exit:
 * provides the nearest PresenceContext so motion elements and
 * `usePresence` handlers register here (not container-wide), starts their
 * exits when `isPresent` flips, and reports `onExitComplete` once every
 * registered exit settles — the child subtree stays fully mounted until
 * then, because AnimatePresence only drops it from the render list after
 * this callback.
 */
export const PresenceChild = defineComponent({
  name: 'PresenceChild',
  props: {
    child: { type: Object as PropType<VNode>, required: true },
    isPresent: { type: Boolean, required: true },
    getInitial: { type: Function as PropType<() => boolean | undefined>, required: true },
    custom: null,
    mode: { type: String as PropType<PresenceMode>, required: true },
    anchorX: { type: String as PropType<'left' | 'right'>, required: true },
    onExitComplete: { type: Function as PropType<() => void>, required: true },
  },
  setup(props) {
    const motionConfig = useMotionConfig()
    const instance = getCurrentInstance()
    const states = new Set<MotionState>()
    const handlers = new Set<PresenceHandler>()
    // Bumped by exit and reenter; a stale completion then no-ops, mirroring
    // ExitFeature's own generation guard for exit → reenter → exit-again.
    let generation = 0
    let popStyle: HTMLStyleElement | undefined

    provideAnimatePresence({
      get initial() {
        return props.getInitial()
      },
      get custom() {
        return props.custom
      },
      register: state => states.add(state),
      unregister: state => states.delete(state),
      registerHandler: handler => handlers.add(handler),
      unregisterHandler: handler => handlers.delete(handler),
    })

    function rootElement(): HTMLElement | null {
      const el = instance?.subTree?.el
      return el instanceof HTMLElement ? el : null
    }

    function finish() {
      removePopStyle(popStyle)
      popStyle = undefined
      props.onExitComplete()
    }

    function exit() {
      const gen = ++generation
      const el = rootElement()
      if (el) {
        popStyle = addPopStyle(el, {
          mode: props.mode,
          anchorX: props.anchorX,
          getNonce: () => motionConfig.value.nonce,
        })
      }

      const completions: Promise<unknown>[] = []
      for (const state of states)
        completions.push(state.getFeature<ExitFeature>('exit')?.exit() ?? Promise.resolve())
      for (const handler of handlers)
        completions.push(Promise.resolve(handler.onExit()))

      // No motion elements or handlers inside: nothing to wait for.
      if (completions.length === 0) {
        finish()
        return
      }
      Promise.all(completions).then(() => {
        if (gen === generation)
          finish()
      })
    }

    function reenter() {
      generation++
      removePopStyle(popStyle)
      popStyle = undefined
      for (const state of states)
        state.getFeature<ExitFeature>('exit')?.reenter()
      for (const handler of handlers)
        handler.onEnter?.()
    }

    watch(() => props.isPresent, (isPresent) => {
      isPresent ? reenter() : exit()
    })

    return () => props.child
  },
})
