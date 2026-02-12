import { injectLayoutGroup, injectMotion, provideMotion } from '@/components/context'
import { getMotionElement } from '@/components/hooks/use-motion-elm'
import { useLazyMotionContext } from '@/components/lazy-motion/context'
import { useMotionConfig } from '@/components/motion-config'
import type { MotionProps } from '@/components/motion/types'
import { injectAnimatePresence } from '@/components/animate-presence/presence'
import { createSVGStyles, createStyles } from '@/state/style'
import { updateLazyFeatures } from '@/features/lazy-features'
import type { createVisualElement } from '@/state/create-visual-element'
import { isMotionValue } from 'framer-motion/dom'
import { invariant, warning } from 'hey-listen'
import { getCurrentInstance, onBeforeUnmount, onBeforeUpdate, onMounted, onUnmounted, onUpdated, ref, useAttrs, watch } from 'vue'
import { MotionState } from '@/state'

export function useMotionState(
  props: MotionProps,
  renderer?: typeof createVisualElement,
) {
  // motion context
  const parentState = injectMotion(null)
  // layout group context
  const layoutGroup = injectLayoutGroup({})
  // motion config context
  const config = useMotionConfig()
  // animate presence context
  const presenceContext = injectAnimatePresence({})
  // lazy motion context
  const lazyMotionContext = useLazyMotionContext({
    features: ref({}),
    strict: false,
  })

  /**
   * If we're in development mode, check to make sure we're not rendering a motion component
   * as a child of LazyMotion, as this will break the file-size benefits of using it.
   */
  if (
    process.env.NODE_ENV !== 'production'
    && renderer
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
      presenceContext,
      initial: presenceContext.initial === false
        ? presenceContext.initial
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

  // If renderer is provided directly (motion component), use it immediately
  if (renderer) {
    state.initVisualElement(renderer)
  }

  // Watch for lazy-loaded features (for m component with LazyMotion)
  watch(lazyMotionContext.features, (bundle) => {
    if (bundle.features?.length) {
      updateLazyFeatures(bundle.features)
    }
    if (bundle.renderer) {
      state.initVisualElement(bundle.renderer)
    }
    state.updateFeatures()
  }, { immediate: true })

  function getAttrs() {
    const isSVG = state.type === 'svg'
    const attrsProps = { ...attrs }
    Object.keys(attrs).forEach((key) => {
      if (isMotionValue(attrs[key]))
        attrsProps[key] = attrs[key].get()
    })
    const currentValues = state.visualElement?.latestValues || state.latestValues
    let styleProps: Record<string, any> = {
      ...props.style,
      ...(isSVG ? {} : currentValues),
    }
    // Extract MotionValue objects to their current values
    // (buildSVGAttrs/buildHTMLStyles expect plain values)
    for (const key in styleProps) {
      if (isMotionValue(styleProps[key]))
        styleProps[key] = styleProps[key].get()
    }
    if (isSVG) {
      const { attrs: svgAttrs, style: svgStyle } = createSVGStyles(
        { ...currentValues, ...styleProps },
        state.options.as as string,
        props.style,
      )
      Object.assign(attrsProps, svgAttrs)
      styleProps = svgStyle
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

  onMounted(() => {
    const el = getMotionElement(instance.$el)
    if (presenceContext.presenceId) {
      el?.setAttribute('data-ap', presenceContext.presenceId)
    }
    state.mount(el)
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
    state,
  }
}
