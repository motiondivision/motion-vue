import type { PropType, VNode } from 'vue'
import { Comment, Fragment, Text, defineComponent, h, onMounted, shallowRef, useTransitionState } from 'vue'
import { warning } from 'hey-listen'
import type { MotionState } from '@/state'
import type { PresenceMode } from './core/presence-core'
import { createPresenceCore } from './core/presence-core'
import { PresenceChild } from './presence-child'

/**
 * Flatten slot output into animatable children: unwrap Fragments (v-for
 * blocks) and drop text/comment placeholders, mirroring TransitionGroup's
 * child resolution. Children meant to exit independently need keys.
 */
function flatten(children: VNode[], out: VNode[] = []): VNode[] {
  for (const vnode of children) {
    if (vnode.type === Fragment && Array.isArray(vnode.children))
      flatten(vnode.children as VNode[], out)
    else if (vnode.type !== Comment && vnode.type !== Text)
      out.push(vnode)
  }
  return out
}

/**
 * Manages child removal itself rather than delegating to Vue's Transition:
 * every render diffs the slot's keys through the presence core, which keeps
 * vanished children rendered with the vnode they last had, and only drops
 * them from the render list once every registered exit has completed.
 * Component instances therefore stay alive for the whole exit animation;
 * `onUnmounted` runs when the exit commits, not when `v-if` flips.
 *
 * PresenceChild also sets transition hooks on each child vnode, which is
 * what makes `v-show` and KeepAlive deferrals work: both read
 * `vnode.transition`, and both feed the same exit protocol.
 */
export const AnimatePresence = defineComponent({
  name: 'AnimatePresence',
  inheritAttrs: false,
  props: {
    mode: { type: String as PropType<PresenceMode>, default: 'sync' },
    initial: { type: Boolean, default: true },
    as: String,
    custom: null,
    onExitComplete: Function as PropType<VoidFunction>,
    anchorX: { type: String as PropType<'left' | 'right'>, default: 'left' },
  },
  setup(props, { slots, attrs }) {
    /** Bumped when an exit commits, the one render-set change made outside render. */
    const exitCommits = shallowRef(0)
    let hasMounted = false

    // One transition state for the whole container, shared by every child's
    // vnode hooks — the same arrangement Vue's TransitionGroup uses.
    const transitionState = useTransitionState()

    /**
     * Every motion state registered under this AnimatePresence, across all
     * children. A popLayout exit pulls its element out of flow synchronously,
     * reflowing the siblings before their own update hooks could measure
     * them — so the exit snapshots this whole set first, giving each layout
     * animation a pre-pop position to start from.
     */
    const motionStates = new Set<MotionState>()

    const core = createPresenceCore<VNode>({
      getMode: () => props.mode,
      onExitComplete: () => {
        exitCommits.value++
        props.onExitComplete?.()
      },
    })

    onMounted(() => {
      hasMounted = true
    })

    return () => {
      // Diff in render, as React does: the slot is only guaranteed to be
      // current here. Vue swaps in a new slot function when the parent
      // re-renders, and a slot that closes over plain values (scoped-slot
      // props, render-function locals) has no reactive read to watch.
      void exitCommits.value
      core.syncChildren(flatten(slots.default?.() ?? []).map((vnode, index) => ({
        key: vnode.key ?? `ap_${index}`,
        child: vnode,
      })))
      const rendered = core.getRendered()

      if (
        process.env.NODE_ENV !== 'production'
        && props.mode === 'wait'
        && rendered.length > 1
      ) {
        warning(
          false,
          'You\'re attempting to animate multiple children within AnimatePresence, but its mode is set to "wait". This will lead to odd visual behaviour.',
        )
      }

      const children = rendered.map(entry =>
        h(PresenceChild, {
          key: entry.key,
          child: entry.child,
          isPresent: entry.isPresent,
          getInitial: () => (hasMounted ? undefined : props.initial),
          custom: props.custom,
          mode: props.mode,
          anchorX: props.anchorX,
          transitionState,
          motionStates,
          onExitComplete: () => {
            // A v-show or KeepAlive exit leaves the key in the render set, so
            // the core is not waiting on it and must not hear about it.
            if (entry.isPresent)
              props.onExitComplete?.()
            else
              core.completeExit(entry.key)
          },
        }),
      )
      return props.as ? h(props.as, attrs, children) : h(Fragment, children)
    }
  },
})
