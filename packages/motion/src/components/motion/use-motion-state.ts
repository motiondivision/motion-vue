import { injectLayoutGroup, injectMotion, provideMotion } from '@/components/context'
import { getMotionElement } from '@/components/hooks/use-motion-elm'
import { useLazyMotionContext } from '@/components/lazy-motion/context'
import { useMotionConfig } from '@/components/motion-config'
import type { MotionProps } from '@/components/motion/types'
import { checkMotionIsHidden } from '@/components/motion/utils'
import { PRESENCE_CHILD_ATTR, injectAnimatePresence } from '@/components/animate-presence/presence'
import { MotionState } from '@/state'
import { convertSvgStyleToAttributes, createStyles } from '@/state/style'
import { updateLazyFeatures } from '@/features/lazy-features'
import type { DOMKeyframesDefinition } from 'framer-motion'
import { isMotionValue } from 'framer-motion/dom'
import { invariant, warning } from 'hey-listen'
import { getCurrentInstance, onBeforeMount, onBeforeUnmount, onBeforeUpdate, onMounted, onUnmounted, onUpdated, ref, useAttrs, watch } from 'vue'

export function useMotionState(props: MotionProps) {
  // motion context
  const parentState = injectMotion(null)
  // layout group context
  const layoutGroup = injectLayoutGroup({})
  // motion config context
  const config = useMotionConfig()
  // animate presence context
  const animatePresenceContext = injectAnimatePresence({})
  // lazy motion context
  const lazyMotionContext = useLazyMotionContext({
    features: ref([]),
    strict: false,
  })

  // Update global lazy features when context features change
  watch(lazyMotionContext.features, (features) => {
    updateLazyFeatures(features)
  }, { immediate: true })

  /**
   * If we're in development mode, check to make sure we're not rendering a motion component
   * as a child of LazyMotion, as this will break the file-size benefits of using it.
   */
  if (
    process.env.NODE_ENV !== 'production'
    // @ts-expect-error
    && props.features?.length
    && lazyMotionContext.strict
  ) {
    const strictMessage
        = 'You have rendered a `motion` component within a `LazyMotion` component. This will break tree shaking. Import and render a `m` component instead.'
    props.ignoreStrict
      ? warning(false, strictMessage)
      : invariant(false, strictMessage)
  }
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
    const isSVG = state.type === 'svg'
    const attrsProps = { ...attrs }
    Object.keys(attrs).forEach((key) => {
      if (isMotionValue(attrs[key]))
        attrsProps[key] = attrs[key].get()
    })
    let styleProps: Record<string, any> = {
      ...props.style,
      ...(isSVG ? {} : state.visualElement?.latestValues || state.baseTarget),
    }
    if (isSVG) {
      const { attrs, style } = convertSvgStyleToAttributes({
        ...(state.isMounted() ? state.target : state.baseTarget),
        ...styleProps,
      } as DOMKeyframesDefinition)
      if (style.transform || attrs.transformOrigin) {
        style.transformOrigin = attrs.transformOrigin ?? '50% 50%'
        delete attrs.transformOrigin
      }
      // If the transformBox is not set, set it to fill-box
      if (style.transform) {
        style.transformBox = style.transformBox ?? 'fill-box'
        delete attrs.transformBox
      }
      Object.assign(attrsProps, attrs)
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

    const style = createStyles(styleProps)
    if (style)
      attrsProps.style = style
    return attrsProps
  }

  const instance = getCurrentInstance().proxy

  onBeforeMount(() => {
    state.beforeMount()
  })

  onMounted(() => {
    state.mount(getMotionElement(instance.$el), getMotionProps(), checkMotionIsHidden(instance))

    // Register to AnimatePresence container
    if (animatePresenceContext.register && state.element) {
      const container = state.element.closest(`[${PRESENCE_CHILD_ATTR}]`)
      if (container) {
        state.presenceContainer = container
        animatePresenceContext.register(container, state)
      }
      else if (animatePresenceContext.registerPending) {
        // SSR hydration scenario: enter hook not triggered, add to pending
        animatePresenceContext.registerPending(state)
      }
    }
  })

  onBeforeUnmount(() => state.beforeUnmount())

  onUnmounted(() => {
    // Clean up from pending list if still there
    if (animatePresenceContext.unregisterPending) {
      animatePresenceContext.unregisterPending(state)
    }

    const el = getMotionElement(instance.$el)
    if (!el?.isConnected) {
      state.unmount()
    }
  })

  onBeforeUpdate(() => {
    state.beforeUpdate(getMotionProps())
  })

  onUpdated(() => {
    state.update(getMotionProps())
  })

  return {
    getProps,
    getAttrs,
    layoutGroup,
    state,
  }
}
