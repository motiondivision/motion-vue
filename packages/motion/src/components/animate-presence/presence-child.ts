import type { PropType, TransitionState, VNode } from 'vue'
import { computed, createVNode, defineComponent, getCurrentInstance, onUnmounted, ref, resolveTransitionHooks, setTransitionHooks, watch } from 'vue'
import { useMotionConfig } from '@/components/motion-config/context'
import type { MotionState } from '@/state'
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
    /** Every motion state registered under the AnimatePresence, shared across children. */
    motionStates: { type: Object as PropType<Set<MotionState>>, required: true },
  },
  setup(props) {
    const motionConfig = useMotionConfig()
    const instance = getCurrentInstance()
    /**
     * Raised for the whole duration of an exit, however it started. `v-if` is
     * already visible through `props.isPresent`; `v-show` and KeepAlive are
     * not, so this carries them into the same signal every subscriber watches.
     */
    const exitSignal = ref(false)
    /** Reactive mirror of `props.isPresent && !exitSignal`, which `watch` can track. */
    const isPresentState = computed(() => props.isPresent && !exitSignal.value)
    /** React-style presence subscribers: id → exit complete. */
    const presenceChildren = new Map<string | number, boolean>()
    let exitActive = false
    let exitFinished = false
    /** Release callback of the Transition leave currently in flight. */
    let pendingLeaveDone: VoidFunction | undefined
    let leaveElement: HTMLElement | undefined
    let popStyle: HTMLStyleElement | undefined
    /**
     * What the child's slot resolved to on its last present render, and the
     * snapshot replayed while it exits. See the note above `resolveSlot` for
     * why both exist.
     */
    let presentChildren: VNode['children'] | undefined
    let frozenChildren: VNode['children'] | undefined

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
      leaveElement = undefined
      // The exit is over, so the freeze has served its purpose. Dropping it
      // here is what lets a `v-show` element pick up the flip back to visible:
      // while frozen the vnode is rebuilt each render, which leaves the
      // directive reading a stale `value` and Vue skips `beforeEnter`.
      frozenChildren = undefined
      props.onExitComplete()
    }

    function releasePopStyle() {
      removePopStyle(popStyle)
      popStyle = undefined
    }

    onUnmounted(releasePopStyle)

    function maybeFinish() {
      if (!exitActive || !allPresenceComplete())
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
        return isPresentState.value
      },
      register: (childId, state) => {
        presenceChildren.set(childId, false)
        if (state)
          props.motionStates.add(state)
        return () => {
          presenceChildren.delete(childId)
          if (state)
            props.motionStates.delete(state)
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

    /**
     * Resolve the child's slot to plain children.
     *
     * Slot children are lazy functions, so a frozen vnode alone is not enough:
     * Vue calls the slot again on every patch and the closure reads whatever
     * the parent's state is *now*. React keeps the element it rendered, so an
     * exiting child shows the content it had when it started leaving — this is
     * the equivalent.
     *
     * The snapshot is taken on every present render rather than inside
     * `exit()`: `isPresent` flips in a pre-flush watcher, by which point
     * `props.child` already carries the new content. Only the children are
     * frozen, not the vnode — reusing the vnode object would make Vue's
     * `n1 === n2` bailout skip the whole patch, including directive updates,
     * leaving `v-show` stuck on its old binding.
     */
    function resolveSlot(children: VNode['children']): VNode['children'] | undefined {
      // Component children are already resolved vnodes, and array/text
      // children are static — only a slot function re-reads parent state.
      if (!children || typeof children !== 'object' || Array.isArray(children) || typeof (children as any).default !== 'function')
        return undefined
      return (children as any).default()
    }

    function exit(el?: HTMLElement) {
      if (exitActive)
        return
      exitActive = true
      exitFinished = false
      exitSignal.value = true
      // Fall back to resolving now if the child never rendered while present.
      frozenChildren ??= presentChildren ?? resolveSlot(props.child.children)
      leaveElement = el ?? rootElement() ?? undefined
      if (leaveElement) {
        // The pop style reflows the siblings the moment it lands, before
        // their own update hooks could measure them. Snapshot every
        // registered layout child first so each FLIP starts from its
        // pre-pop position — willUpdate is idempotent, so a state's own
        // later snapshot keeps this measurement.
        if (props.mode === 'popLayout') {
          for (const state of props.motionStates) {
            if (state.options.layout || state.options.layoutId)
              state.getSnapshot(true)
          }
        }
        popStyle = addPopStyle(leaveElement, {
          mode: props.mode,
          anchorX: props.anchorX,
          getNonce: () => motionConfig.value.nonce,
        })
      }

      // Mirror React PresenceChild: every isPresent flip resets completions.
      resetPresenceChildren()

      // Nothing registered: no motion element and no hook subscriber, so
      // there is nothing to wait for.
      if (presenceChildren.size === 0) {
        finish()
        return
      }

      maybeFinish()
    }

    function reenter() {
      exitActive = false
      exitFinished = false
      exitSignal.value = false
      // The child is present again, so it must track parent state once more.
      frozenChildren = undefined
      pendingLeaveDone = undefined
      leaveElement = undefined
      releasePopStyle()
      resetPresenceChildren()
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

    /**
     * `v-show` show and KeepAlive activation reverse an in-flight exit.
     *
     * This runs from `beforeEnter` rather than `onEnter`: Vue's enter hook
     * bails out when `leavingVNodes[key] === vnode`, which is exactly the case
     * here — we reuse one vnode object across renders. `beforeEnter` is not
     * gated that way, so it is the only place a reversal is observable.
     */
    function transitionBeforeEnter(_el: Element) {
      // Only a present entry may cancel. When the core is removing the key,
      // the element is still rendered and a v-show flip must not abort the
      // exit the core is waiting on.
      if (props.isPresent && (exitActive || exitFinished))
        reenter()
    }

    function transitionEnter(_el: Element, done: VoidFunction) {
      done()
    }

    watch(() => props.isPresent, (isPresent) => {
      isPresent ? reenter() : exit()
    })

    return () => {
      const current = props.child
      if (frozenChildren === undefined) {
        // Present: remember what this render's slot resolves to, so an exit
        // starting later can replay this content instead of the parent's
        // state at exit time. Rendering the vnode by reference keeps Vue's
        // `n1 === n2` bailout available for untouched subtrees.
        presentChildren = resolveSlot(current.children) ?? current.children
        setTransitionHooks(current, resolveTransitionHooks(
          current,
          { onBeforeEnter: transitionBeforeEnter, onEnter: transitionEnter, onLeave: transitionLeave },
          props.transitionState,
          instance!,
        ))
        return current
      }

      // Exiting: rebuild the vnode so props and directives stay live, but swap
      // in the children captured above. The slot function is what would
      // otherwise re-read the parent's state.
      //
      // cloneVNode copies the source's children verbatim — `children` in its
      // extra props only lands in `props` — and the shape flag has to follow
      // the new children form, so the vnode is rebuilt instead.
      const child = createVNode(
        current.type as any,
        current.props,
        frozenChildren as any,
      )
      child.key = current.key
      child.ref = current.ref
      child.scopeId = current.scopeId
      child.slotScopeIds = current.slotScopeIds
      child.patchFlag = current.patchFlag
      child.dynamicProps = current.dynamicProps
      // Directives carry the `v-show` binding. Dropping them here would leave
      // the exiting element unable to see the flip back to visible.
      child.dirs = current.dirs
      setTransitionHooks(child, resolveTransitionHooks(
        child,
        { onBeforeEnter: transitionBeforeEnter, onEnter: transitionEnter, onLeave: transitionLeave },
        props.transitionState,
        instance!,
      ))
      return child
    }
  },
})
