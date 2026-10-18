import type { PropType, VNode } from 'vue'
import { defineComponent, getCurrentInstance, watch } from 'vue'
import type { MotionState } from '@/state'
import type { ExitFeature } from '@/features/exit/exit'
import { useMotionConfig } from '@/components/motion-config/context'
import type { PresenceMode } from './core/presence-core'
import { provideAnimatePresence } from './presence'
import { addPopStyle, removePopStyle } from './pop-layout'

/**
 * Per-key wrapper rendered by AnimatePresence. Owns one child's exit:
 * provides the nearest PresenceContext so motion elements and React-shaped
 * `usePresence` subscribers register here (not container-wide), starts motion
 * exits when `isPresent` flips, and reports `onExitComplete` once every
 * motion exit and every registered presence id settles — the child subtree
 * stays fully mounted until then, because AnimatePresence only drops it from
 * the render list after this callback.
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
    /** React-style presence subscribers: id → exit complete. */
    const presenceChildren = new Map<string | number, boolean>()
    // Bumped by exit and reenter; a stale completion then no-ops, mirroring
    // ExitFeature's own generation guard for exit → reenter → exit-again.
    let generation = 0
    let motionsDone = true
    let exitFinished = false
    let popStyle: HTMLStyleElement | undefined

    function allPresenceComplete() {
      for (const isComplete of presenceChildren.values()) {
        if (!isComplete)
          return false
      }
      return true
    }

    function finish() {
      if (exitFinished)
        return
      exitFinished = true
      removePopStyle(popStyle)
      popStyle = undefined
      props.onExitComplete()
    }

    function maybeFinish() {
      if (props.isPresent || !motionsDone || !allPresenceComplete())
        return
      finish()
    }

    provideAnimatePresence({
      get initial() {
        return props.getInitial()
      },
      get custom() {
        return props.custom
      },
      get isPresent() {
        return props.isPresent
      },
      registerMotion: state => states.add(state),
      unregisterMotion: state => states.delete(state),
      register: (childId) => {
        presenceChildren.set(childId, false)
        return () => {
          presenceChildren.delete(childId)
          maybeFinish()
        }
      },
      onExitComplete: (childId) => {
        // Only record completions for ids still registered (React map semantics).
        if (!presenceChildren.has(childId))
          return
        presenceChildren.set(childId, true)
        maybeFinish()
      },
    })

    function rootElement(): HTMLElement | null {
      const el = instance?.subTree?.el
      return el instanceof HTMLElement ? el : null
    }

    function resetPresenceChildren() {
      presenceChildren.forEach((_, key) => presenceChildren.set(key, false))
    }

    function exit() {
      const gen = ++generation
      exitFinished = false
      const el = rootElement()
      if (el) {
        popStyle = addPopStyle(el, {
          mode: props.mode,
          anchorX: props.anchorX,
          getNonce: () => motionConfig.value.nonce,
        })
      }

      // Mirror React PresenceChild: every isPresent flip resets completions.
      resetPresenceChildren()

      const completions: Promise<unknown>[] = []
      for (const state of states)
        completions.push(state.getFeature<ExitFeature>('exit')?.exit() ?? Promise.resolve())

      // No motion elements and no presence subscribers: nothing to wait for.
      if (completions.length === 0 && presenceChildren.size === 0) {
        motionsDone = true
        finish()
        return
      }

      if (completions.length === 0) {
        motionsDone = true
        maybeFinish()
        return
      }

      motionsDone = false
      Promise.all(completions).then(() => {
        if (gen !== generation)
          return
        motionsDone = true
        maybeFinish()
      })
    }

    function reenter() {
      generation++
      exitFinished = false
      motionsDone = true
      removePopStyle(popStyle)
      popStyle = undefined
      resetPresenceChildren()
      for (const state of states)
        state.getFeature<ExitFeature>('exit')?.reenter()
    }

    watch(() => props.isPresent, (isPresent) => {
      isPresent ? reenter() : exit()
    })

    return () => props.child
  },
})
