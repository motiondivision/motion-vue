<script lang="ts">
import { Fragment, Transition, TransitionGroup, computed, createVNode, defineComponent, h } from 'vue'
import type { PropType } from 'vue'
import type { AnimatePresenceProps } from './types'
import { usePresenceContainer } from './use-presence-container'

export default defineComponent({
  name: 'AnimatePresence',
  inheritAttrs: true,
  props: {
    mode: { type: String as PropType<AnimatePresenceProps['mode']>, default: 'sync' },
    initial: { type: Boolean, default: true },
    as: { type: String, default: undefined },
    custom: { default: undefined },
    onExitComplete: { type: Function as PropType<VoidFunction>, default: undefined },
    anchorX: { type: String as PropType<'left' | 'right'>, default: 'left' },
  },
  setup(props, { slots }) {
    const { enter, exit, markChildren } = usePresenceContainer(props as AnimatePresenceProps)

    const transitionProps = computed(() => {
      if (props.mode !== 'wait')
        return { tag: props.as }
      return { mode: 'out-in' as const }
    })

    return () => h(
      props.mode === 'wait' ? Transition : TransitionGroup,
      {
        ...transitionProps.value,
        appear: true,
        css: false,
        onEnter: enter,
        onLeave: exit,
      },
      {
        // The key makes TransitionGroup install transition hooks on every
        // child. Unkeyed children get none, so v-show would not fire enter
        // or leave.
        default: () => [
          createVNode(Fragment, { key: '_presence' }, markChildren(slots.default?.() ?? [])),
        ],
      },
    )
  },
})
</script>
