import { injectLayoutGroup, injectMotion, provideMotion } from '@/components/context'
import { getMotionElement } from '@/components/hooks/use-motion-elm'
import { useMotionConfig } from '@/components/motion-config'
import type { MotionProps } from '@/components/motion/Motion.vue'
import { checkMotionIsHidden } from '@/components/motion/utils'
import { injectAnimatePresence } from '@/components/presence'
import { MotionState } from '@/state'
import { convertSvgStyleToAttributes, createStyles } from '@/state/style'
import { isMotionValue } from '@/utils'
import type { DOMKeyframesDefinition } from 'motion-dom'
import { getCurrentInstance, onBeforeMount, onBeforeUnmount, onBeforeUpdate, onMounted, onUnmounted, onUpdated, useAttrs } from 'vue'

export function useMotionState(props: MotionProps) {
  const parentState = injectMotion(null)
  const layoutGroup = injectLayoutGroup({})
  const config = useMotionConfig()
  const animatePresenceContext = injectAnimatePresence({})
  const attrs = useAttrs()

  /**
   * Get the layout ID for the motion component
   * If both layoutGroup.id and props.layoutId exist, combine them with a hyphen
   * Otherwise return props.layoutId or undefined
   */
  function getLayoutId() {
    if (layoutGroup.id && props.layoutId)
      return `${layoutGroup.id}-${props.layoutId}`
    return props.layoutId || undefined
  }

  function getProps() {
    return {
      ...props,
      layoutId: getLayoutId(),
      transition: props.transition ?? config.value.transition,
      layoutGroup,
      motionConfig: config.value,
      inViewOptions: props.inViewOptions ?? config.value.inViewOptions,
      animatePresenceContext,
      initial: animatePresenceContext.initial === false
        ? animatePresenceContext.initial
        : (
            props.initial === true ? undefined : props.initial
          ),
    }
  }
  function getMotionProps() {
    return {
      ...attrs,
      ...getProps(),
    }
  }

  const state = new MotionState(
    getMotionProps(),
    parentState!,
  )
  provideMotion(state)

  function getAttrs() {
    const isSVG = state.visualElement.type === 'svg'
    const attrsProps = { ...attrs }
    Object.keys(attrs).forEach((key) => {
      if (isMotionValue(attrs[key]))
        attrsProps[key] = attrs[key].get()
    })
    let styleProps: Record<string, any> = {
      ...props.style,
      ...(isSVG ? {} : state.visualElement.latestValues),
    }
    if (isSVG) {
      const { attributes, style } = convertSvgStyleToAttributes({
        ...(state.isMounted() ? state.target : state.baseTarget),
        ...styleProps,
      } as DOMKeyframesDefinition)
      Object.assign(attrsProps, attributes)
      styleProps = style
    }
    if (props.drag && props.dragListener !== false) {
      Object.assign(styleProps, {
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        touchAction: props.drag === true
          ? 'none'
          : `pan-${props.drag === 'x' ? 'y' : 'x'}`,
      })
    }

    attrsProps.style = createStyles(styleProps)
    return attrsProps
  }

  const instance = getCurrentInstance().proxy

  onBeforeMount(() => {
    state.beforeMount()
  })

  onMounted(() => {
    state.mount(getMotionElement(instance.$el), getMotionProps(), checkMotionIsHidden(instance))
  })

  onBeforeUnmount(() => state.beforeUnmount())

  onUnmounted(() => {
    const el = getMotionElement(instance.$el)
    if (!el?.isConnected) {
      state.unmount()
    }
  })

  onBeforeUpdate(() => {
    state.beforeUpdate()
  })

  onUpdated(() => {
    state.update(getMotionProps())
  })

  return {
    getProps,
    getAttrs,
    layoutGroup,
  }
}
