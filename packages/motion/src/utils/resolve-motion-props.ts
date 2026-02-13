import type { LayoutGroupState } from '@/components/context'
import type { PresenceContext } from '@/components/animate-presence/presence'
import type { MotionConfigState } from '@/components/motion-config/types'
import type { Options } from '@/types'

export interface MotionContext {
  layoutGroup: LayoutGroupState
  presenceContext: PresenceContext
  config: MotionConfigState
}

/**
 * Merge motion props with context values (layout group, presence, config).
 * Shared by useMotionState (component) and v-motion directive.
 */
export function resolveMotionProps(
  props: Options,
  context: MotionContext,
): Options & { presenceContext: PresenceContext } {
  const { layoutGroup, presenceContext, config } = context

  const layoutId = layoutGroup.id && props.layoutId
    ? `${layoutGroup.id}-${props.layoutId}`
    : props.layoutId || undefined

  return {
    ...props,
    layoutId,
    transition: props.transition ?? config.transition,
    layoutGroup,
    motionConfig: config,
    inViewOptions: props.inViewOptions ?? config.inViewOptions,
    presenceContext,
    initial: presenceContext.initial === false
      ? presenceContext.initial
      : (props.initial === true ? undefined : props.initial),
  }
}
