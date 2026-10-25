import type { PropType, TransitionState, VNode } from 'vue'
import { computed, createVNode, defineComponent, getCurrentInstance, onUnmounted, ref, resolveTransitionHooks, setTransitionHooks, watch } from 'vue'
import { useMotionConfig } from '@/components/motion-config/context'
import type { MotionState } from '@/state'
import type { PresenceMode } from './core/presence-core'
import { provideAnimatePresence } from './presence'
import { addPopStyle, removePopStyle } from './pop-layout'

type ExitPhase = 'present' | 'exiting' | 'exited'

function resolveSlot(children: VNode['children']): VNode['children'] | undefined {
  // Component children are already resolved vnodes, and array/text
  // children are static — only a slot function re-reads parent state.
  if (!children || typeof children !== 'object' || Array.isArray(children) || typeof (children as any).default !== 'function')
    return undefined
  return (children as any).default()
}

/**
 * Rebuild `vnode` around `children`, keeping props and directives live.
 *
 * cloneVNode copies the source's children verbatim — `children` in its extra
 * props only lands in `props` — and the shape flag has to follow the new
 * children form, so the vnode is rebuilt instead.
 */
function withChildren(vnode: VNode, children: VNode['children']): VNode {
  const child = createVNode(vnode.type as any, vnode.props, children as any)
  child.key = vnode.key
  child.ref = vnode.ref
  child.scopeId = vnode.scopeId
  child.slotScopeIds = vnode.slotScopeIds
  child.patchFlag = vnode.patchFlag
  child.dynamicProps = vnode.dynamicProps
  // Directives carry the `v-show` binding. Dropping them here would leave
  // the exiting element unable to see the flip back to visible.
  child.dirs = vnode.dirs
  return child
}

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
     * Where this child's exit stands, however it started. Not reactive:
     * render must not re-run when an exit settles, or an exited child still
     * waiting on its siblings would swap its frozen content for live content.
     */
    let phase: ExitPhase = 'present'
    /**
     * Reactive mirror of `phase !== 'present'`. `v-if` exits are already
     * visible through `props.isPresent`; `v-show` and KeepAlive exits are
     * not, so this carries them into the signal every subscriber watches.
     */
    const hidden = ref(false)
    const isPresentState = computed(() => props.isPresent && !hidden.value)
    /** React-style presence subscribers: id → exit complete. */
    const presenceChildren = new Map<string | number, boolean>()
    /** Release callback of the Transition leave currently in flight. */
    let pendingLeaveDone: VoidFunction | undefined
    let popStyle: HTMLStyleElement | undefined
    /**
     * What the child's slot resolved to on its last render outside an exit,
     * replayed while it exits so it keeps the content it had when it started
     * leaving, as React does. Taken on every such render rather than in
     * `exit()`: `isPresent` flips in a pre-flush watcher, by which point
     * `props.child` already carries the new content.
     */
    let snapshot: VNode['children'] = null

    function setPhase(next: ExitPhase) {
      phase = next
      hidden.value = next !== 'present'
    }

    function finish() {
      setPhase('exited')
      // Keep the pop style until the whole batch commits. Dropping it here
      // would put this element back in flow while siblings are still exiting,
      // shoving them down for a frame before the render set collapses.
      const done = pendingLeaveDone
      pendingLeaveDone = undefined
      // Release the transition first: Vue applies the actual removal from
      // this callback (display: none for v-show, the storage move for
      // KeepAlive). Only then can we tell whether the element survived.
      done?.()
      props.onExitComplete()
    }

    function maybeFinish() {
      if (phase !== 'exiting')
        return
      for (const isComplete of presenceChildren.values()) {
        if (!isComplete)
          return
      }
      finish()
    }

    function releasePopStyle() {
      removePopStyle(popStyle)
      popStyle = undefined
    }

    onUnmounted(releasePopStyle)

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

    function resetPresenceChildren() {
      presenceChildren.forEach((_, key) => presenceChildren.set(key, false))
    }

    function exit(el?: HTMLElement) {
      if (phase === 'exiting')
        return
      // A settled v-show or KeepAlive exit already took `isPresent` to false.
      // Subscribers finished their exits on that edge and will not see
      // another one, so a `v-if` removal now has nothing left to wait for.
      if (phase === 'exited') {
        props.onExitComplete()
        return
      }
      setPhase('exiting')

      const rootElement = instance?.subTree?.el
      const leaveElement = el ?? (rootElement instanceof HTMLElement ? rootElement : undefined)
      if (leaveElement) {
        // The pop style reflows the siblings the moment it lands, before
        // their own update hooks could measure them. Snapshot every
        // registered layout child first so each FLIP starts from its
        // pre-pop position — willUpdate is idempotent, so a state's own
        // later snapshot keeps this measurement.
        if (props.mode === 'popLayout') {
          for (const state of props.motionStates) {
            if (state.options.layout || state.options.layoutId)
              state.visualElement?.projection?.willUpdate()
          }
        }
        popStyle = addPopStyle(leaveElement, {
          mode: props.mode,
          anchorX: props.anchorX,
          getNonce: () => motionConfig.value.nonce,
        })
      }

      // Mirror React PresenceChild: every isPresent flip resets completions.
      // With nothing registered this finishes at once.
      resetPresenceChildren()
      maybeFinish()
    }

    function reenter() {
      setPhase('present')
      pendingLeaveDone = undefined
      releasePopStyle()
      resetPresenceChildren()
    }

    /**
     * `v-show` hide and KeepAlive deactivation both arrive here through the
     * vnode's transition hooks. The core drives `v-if` exits directly instead.
     */
    function transitionLeave(el: Element, done: VoidFunction) {
      // The core already settled a `v-if` exit and is dropping the vnode now;
      // this leave only needs to release the element.
      if (phase === 'exited') {
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
      if (props.isPresent && phase !== 'present')
        reenter()
    }

    function attachTransitionHooks(vnode: VNode) {
      setTransitionHooks(vnode, resolveTransitionHooks(
        vnode,
        { onBeforeEnter: transitionBeforeEnter, onLeave: transitionLeave },
        props.transitionState,
        instance!,
      ))
    }

    watch(() => props.isPresent, (isPresent) => {
      isPresent ? reenter() : exit()
    })

    return () => {
      const current = props.child
      if (phase !== 'exiting') {
        // Rendering the vnode by reference keeps Vue's `n1 === n2` bailout
        // available for untouched subtrees.
        snapshot = resolveSlot(current.children) ?? current.children
        attachTransitionHooks(current)
        return current
      }

      const child = withChildren(current, snapshot)
      attachTransitionHooks(child)
      return child
    }
  },
})
