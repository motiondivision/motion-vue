import type { PropType, TransitionState, VNode } from 'vue'
import { defineComponent, getCurrentInstance, onUnmounted, resolveTransitionHooks, setTransitionHooks, watch } from 'vue'
import type { IProjectionNode } from 'motion-dom'
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
 *
 * The child vnode carries transition hooks so `v-show` defers `display: none`
 * and KeepAlive defers moving a deactivated subtree into its storage
 * container. Both feed the same exit protocol as a `v-if` removal, which the
 * presence core drives by itself.
 *
 * The hooks are set on the vnode directly rather than through Vue's
 * `Transition` component: all that component does is write these same hooks,
 * and mounting one instance per child costs roughly 40% of mount time in long
 * lists. `TransitionGroup` takes the same approach — one shared
 * `TransitionState`, hooks resolved per keyed child.
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
    /** Shared across every child of one AnimatePresence, as TransitionGroup does. */
    transitionState: { type: Object as PropType<TransitionState>, required: true },
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
    let exitActive = false
    let exitFinished = false
    /** Release callback of the Transition leave currently in flight. */
    let pendingLeaveDone: VoidFunction | undefined
    let leaveElement: HTMLElement | undefined
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
      exitActive = false
      // Keep the pop style until the whole batch commits. Dropping it here
      // would put this element back in flow while siblings are still exiting,
      // shoving them down for a frame before the render set collapses.
      const done = pendingLeaveDone
      pendingLeaveDone = undefined
      // Release the transition first: Vue applies the actual removal from
      // this callback (display: none for v-show, the storage move for
      // KeepAlive). Only then can we tell whether the element survived.
      done?.()
      if (leaveElement && !leaveElement.isConnected)
        states.forEach(state => state.unmount())
      leaveElement = undefined
      props.onExitComplete()
    }

    function releasePopStyle() {
      removePopStyle(popStyle)
      popStyle = undefined
    }

    onUnmounted(releasePopStyle)

    function maybeFinish() {
      if (!exitActive || !motionsDone || !allPresenceComplete())
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

    function exit(el?: HTMLElement) {
      if (exitActive)
        return
      const gen = ++generation
      exitActive = true
      exitFinished = false
      leaveElement = el ?? rootElement() ?? undefined
      if (leaveElement) {
        const projection = [...states][0]?.visualElement?.projection as IProjectionNode | undefined
        popStyle = addPopStyle(leaveElement, {
          mode: props.mode,
          anchorX: props.anchorX,
          getNonce: () => motionConfig.value.nonce,
          root: projection?.root,
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
      exitActive = false
      exitFinished = false
      motionsDone = true
      pendingLeaveDone = undefined
      leaveElement = undefined
      releasePopStyle()
      resetPresenceChildren()
      for (const state of states)
        state.getFeature<ExitFeature>('exit')?.reenter()
    }

    /**
     * `v-show` hide and KeepAlive deactivation both arrive here through the
     * Transition wrapper. The core drives `v-if` exits directly instead.
     */
    function transitionLeave(el: Element, done: VoidFunction) {
      // The core already settled a `v-if` exit and is dropping the vnode now;
      // this leave only needs to release the element.
      if (exitFinished) {
        done()
        return
      }
      pendingLeaveDone = done
      exit(el as HTMLElement)
    }

    /** `v-show` show and KeepAlive activation reverse an in-flight exit. */
    function transitionEnter(_el: Element, done: VoidFunction) {
      // Only a present entry may cancel. When the core is removing the key,
      // the element is still rendered and a v-show flip must not abort the
      // exit the core is waiting on.
      if (props.isPresent)
        reenter()
      done()
    }

    watch(() => props.isPresent, (isPresent) => {
      isPresent ? reenter() : exit()
    })

    return () => {
      // Deliberately reuses the caller's vnode object. An exiting child is
      // rendered from the core's frozen vnode, and returning that same object
      // is what lets Vue's `n1 === n2` bailout skip patching the subtree.
      // Cloning here would defeat it and re-render the exiting component.
      const child = props.child
      setTransitionHooks(child, resolveTransitionHooks(
        child,
        { onEnter: transitionEnter, onLeave: transitionLeave },
        props.transitionState,
        instance!,
      ))
      return child
    }
  },
})
