<script lang="ts">
import { Primitive } from './Primitive'
import { MotionState } from '@/state/motion-state'
import { injectAnimatePresence } from '../presence'
import { isMotionValue } from '@/utils'
import { checkMotionIsHidden } from './utils'
import type { AsTag, ComponentProps, ElementType, Options, SVGAttributesWithMotionValues, SetMotionValueType } from '@/types'
import { useMotionConfig } from '../motion-config/context'
import { getMotionElement } from '../hooks/use-motion-elm'
import type { DOMKeyframesDefinition } from 'motion-dom'
</script>

<script setup lang="ts" generic="T extends AsTag = 'div', K = unknown">
import { type ComponentInstance, type IntrinsicElementAttributes, getCurrentInstance, onBeforeMount, onBeforeUnmount, onBeforeUpdate, onMounted, onUnmounted, onUpdated, ref, useAttrs, warn } from 'vue'
import { injectLayoutGroup, injectMotion, provideMotion } from '../context'
import { convertSvgStyleToAttributes, createStyles } from '@/state/style'

export interface MotionProps<T extends AsTag = 'div', K = unknown> extends Options<K> {
  as?: T
  asChild?: boolean
  hover?: Options['hover']
  press?: Options['press']
  inView?: Options['inView']
  focus?: Options['focus']
  whileDrag?: Options['whileDrag']
  whileHover?: Options['whileHover']
  whilePress?: Options['whilePress']
  whileInView?: Options['whileInView']
  whileFocus?: Options['whileFocus']
  forwardMotionProps?: boolean
}
type IntrinsicElementAttributesAsMotionValues = SetMotionValueType<IntrinsicElementAttributes, keyof SVGAttributesWithMotionValues>

type ComBindProps = /* @vue-ignore */ Omit<T extends ElementType ? IntrinsicElementAttributesAsMotionValues[T] : ComponentProps<T>, keyof Options | 'style' | 'as' | 'asChild'>
defineOptions({
  name: 'Motion',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ComBindProps & MotionProps<T, K>>(), {
  as: 'div' as T,
  asChild: false,
  initial: undefined,
  animate: undefined,
  hover: undefined,
  inView: undefined,
  layout: false,
  layoutId: undefined,
  layoutScroll: false,
  layoutRoot: false,
  dragListener: true,
  dragElastic: 0.5,
  dragMomentum: true,
  whileDrag: undefined,
  crossfade: true,
  whileHover: ({ hover }) => {
    if (process.env.NODE_ENV === 'development' && hover) {
      warn('hover is deprecated. Use whileHover instead.')
    }
    return hover
  },
  whilePress: ({ press }) => {
    if (process.env.NODE_ENV === 'development' && press) {
      warn('press is deprecated. Use whilePress instead.')
    }
    return press
  },
  whileInView: ({ inView }) => {
    if (process.env.NODE_ENV === 'development' && inView) {
      warn('inView is deprecated. Use whileInView instead.')
    }
    return inView
  },
  whileFocus: ({ focus }) => {
    if (process.env.NODE_ENV === 'development' && focus) {
      warn('focus is deprecated. Use whileFocus instead.')
    }
    return focus
  },
} as any) as MotionProps<T>
const animatePresenceContext = injectAnimatePresence({})
const parentState = injectMotion(null)
const attrs = useAttrs()
const layoutGroup = injectLayoutGroup({} as any)
const config = useMotionConfig()

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

const PrimitiveRef = ref<ComponentInstance<any>>()

function onMotionComplete(e: CustomEvent) {
  if (props.asChild) {
    PrimitiveRef.value?.$forceUpdate()
  }
  (attrs as any).onMotioncomplete?.(e)
}
</script>

<template>
  <!-- @vue-ignore -->
  <Primitive
    ref="PrimitiveRef"
    :get-props="getProps"
    :get-attrs="getAttrs"
    :as="as"
    :as-child="asChild"
    :data-motion-group="layoutGroup.key?.value || undefined"
    @motioncomplete="onMotionComplete"
  >
    <slot />
  </Primitive>
</template>
