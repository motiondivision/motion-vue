<script lang="ts">
import { Primitive } from './Primitive'
import { MotionState } from '@/state/motion-state'
import { injectAnimatePresence } from './presence'
import { isMotionValue } from '@/utils'
import { getMotionElement } from './utils'
import type { ElementType, Options, SVGAttributesWithMotionValues, SetMotionValueType } from '@/types'
import { useMotionConfig } from './motion-config/context'
import { useSlotChangeIndex } from './use-slot-change-index'
</script>

<script setup lang="ts" generic="T extends ElementType = 'div', K = unknown">
import { type IntrinsicElementAttributes, computed, getCurrentInstance, nextTick, onBeforeMount, onBeforeUnmount, onBeforeUpdate, onMounted, onUnmounted, onUpdated, ref, useAttrs, useSlots, watch } from 'vue'
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
} as any) as MotionProps<T>
const { initial: presenceInitial, safeUnmount } = injectAnimatePresence({ initial: ref(undefined), safeUnmount: () => true })
const parentState = injectMotion(null)
const attrs = useAttrs()
const layoutGroup = injectLayoutGroup({} as any)

const config = useMotionConfig()
const state = new MotionState(
  {
    ...attrs,
    ...props,
    layoutGroup,
    motionConfig: config.value,
  },
  parentState!,
)

provideMotion(state)

const instance = getCurrentInstance().proxy

onBeforeMount(() => {
  state.beforeMount()
})

onMounted(() => {
  state.mount(getMotionElement(instance.$el), {
    ...attrs,
    ...props,
    transition: props.transition ?? config.value.transition,
    layoutGroup,
    motionConfig: config.value,
    initial: presenceInitial.value === false
      ? presenceInitial.value
      : (
          props.initial === true ? undefined : props.initial
        ),
  })
})

onBeforeUnmount(() => {
  state.beforeUnmount()
})

onUnmounted(() => {
  if (safeUnmount(getMotionElement(instance.$el)))
    state.unmount()
})

onBeforeUpdate(() => {
  state.beforeUpdate()
})

onUpdated(() => {
  state.update({
    ...attrs,
    ...props,
    transition: props.transition ?? config.value.transition,
    motionConfig: config.value,
    initial: presenceInitial.value === false
      ? presenceInitial.value
      : (
          props.initial === true ? undefined : props.initial
        ),
  })
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
    Object.assign(styleProps, state.target)
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

const slotsIndex = useSlotChangeIndex()
</script>

<template>
  <!-- @vue-ignore -->
  <Primitive
    :data-layout-slots-index="slotsIndex"
    :as="as"
    :as-child="asChild"
    v-bind="getProps()"
    :data-layout-group-key="layoutGroup?.key?.value"
  >
    <slot />
  </Primitive>
</template>
