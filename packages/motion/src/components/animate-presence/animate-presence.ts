import type { PropType, VNode } from 'vue'
import { Comment, Fragment, Text, defineComponent, h, onMounted, shallowRef, useTransitionState, watch } from 'vue'
import { warning } from 'hey-listen'
import type { PresenceEntry, PresenceMode } from './core/presence-core'
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
 * the presence core diffs slot keys, keeps vanished children rendered
 * (frozen — Vue's `n1 === n2` patch bailout leaves the subtree untouched),
 * and only drops them from the render list once every registered exit has
 * completed. Component instances therefore stay alive for the whole exit
 * animation; `onUnmounted` runs when the exit commits, not when `v-if`
 * flips.
 *
 * Each child also gets a Transition wrapper (in PresenceChild), which is
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
    const rendered = shallowRef<ReadonlyArray<PresenceEntry<VNode>>>([])
    let hasMounted = false

    // One transition state for the whole container, shared by every child's
    // vnode hooks — the same arrangement Vue's TransitionGroup uses.
    const transitionState = useTransitionState()

    const core = createPresenceCore<VNode>({
      getMode: () => props.mode,
      onRenderSetChange: entries => (rendered.value = [...entries]),
      onExitComplete: () => props.onExitComplete?.(),
    })

    // The slot function's reactive reads are tracked by this watcher, so a
    // `v-if` flip re-diffs even though the slot is never invoked in render.
    watch(
      () => slots.default?.() ?? [],
      (children) => {
        const entries = flatten(children as VNode[]).map((vnode, index) => ({
          key: vnode.key ?? `ap_${index}`,
          child: vnode,
        }))
        core.syncChildren(entries)
      },
      { immediate: true },
    )

    onMounted(() => {
      hasMounted = true
    })

    return () => {
      if (
        process.env.NODE_ENV !== 'production'
        && props.mode === 'wait'
        && rendered.value.length > 1
      ) {
        warning(
          false,
          'You\'re attempting to animate multiple children within AnimatePresence, but its mode is set to "wait". This will lead to odd visual behaviour.',
        )
      }

      const children = rendered.value.map(entry =>
        h(PresenceChild, {
          key: entry.key,
          child: entry.child,
          isPresent: entry.isPresent,
          getInitial: () => (hasMounted ? undefined : props.initial),
          custom: props.custom,
          mode: props.mode,
          anchorX: props.anchorX,
          transitionState,
          onExitComplete: () => {
            core.completeExit(entry.key)
            // A v-show exit never leaves the core's render set, so the core
            // cannot report it. v-if exits surface through the core instead.
            if (entry.isPresent)
              props.onExitComplete?.()
          },
        }),
      )
      return props.as ? h(props.as, attrs, children) : h(Fragment, children)
    }
  },
})
