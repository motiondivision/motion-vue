<script lang="ts">
import { Primitive } from './Primitive'
import { MotionState } from '@/state/motion-state'
import { injectAnimatePresence } from './presence'
import { isMotionValue } from '@/utils'
import { checkMotionIsHidden, getMotionElement } from './utils'
import type { ElementType, Options, SVGAttributesWithMotionValues, SetMotionValueType } from '@/types'
import { useMotionConfig } from './motion-config/context'
</script>

<script setup lang="ts" generic="T extends ElementType = 'div', K = unknown">
import { type ComponentInstance, type IntrinsicElementAttributes, getCurrentInstance, onBeforeMount, onBeforeUnmount, onBeforeUpdate, onMounted, onUnmounted, onUpdated, ref, useAttrs } from 'vue'
import { injectLayoutGroup, injectMotion, provideMotion } from './context'
import { convertSvgStyleToAttributes, createStyles } from '@/state/style'

export interface MotionProps<T extends ElementType = 'div', K = unknown> extends Options<K> {
  as?: T
  asChild?: boolean
  whileDrag?: Options['whileDrag']
}
type IntrinsicElementAttributesAsMotionValues = SetMotionValueType<IntrinsicElementAttributes, keyof SVGAttributesWithMotionValues>

type ComBindProps = /* @vue-ignore */ Omit<IntrinsicElementAttributesAsMotionValues[T], keyof Options | 'style' | 'as' | 'asChild'>
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
  dragElastic: 0.2,
  dragMomentum: true,
  whileDrag: undefined,
  crossfade: true,
} as any) as MotionProps<T>
const animatePresenceContext = injectAnimatePresence({ })
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

function getMotionProps() {
  return {
    ...attrs,
    ...props,
    layoutId: getLayoutId(),
    transition: props.transition ?? config.value.transition,
    layoutGroup,
    motionConfig: config.value,
    initial: animatePresenceContext.initial === false
      ? animatePresenceContext.initial
      : (
          props.initial === true ? undefined : props.initial
        ),
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

function getProps() {
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
    const { attributes, style } = convertSvgStyleToAttributes(state.target)
    Object.assign(attrsProps, attributes)
    Object.assign(styleProps, style)
  }

  if (!state.isMounted()) {
    Object.assign(styleProps, state.baseTarget)
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

  styleProps = createStyles({
    ...styleProps,
    ...props.style,
  })

  attrsProps.style = styleProps
  return attrsProps
}

const PrimitiveRef = ref<ComponentInstance<any>>()

function onMotionComplete() {
  if (props.asChild) {
    PrimitiveRef.value?.$forceUpdate()
  }
}
</script>

<template>
  <!-- @vue-ignore -->
  <Primitive
    ref="PrimitiveRef"
    :get-props="getProps"
    :as="as"
    :as-child="asChild"
    :data-motion-group="layoutGroup.key?.value || undefined"
    @motioncomplete="onMotionComplete"
  >
    <slot />
  </Primitive>
</template>
