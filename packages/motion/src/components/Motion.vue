<script lang="ts">
import { Primitive } from './Primitive'
import { MotionState } from '@/state/motion-state'
import { injectAnimatePresence } from './presence'
import { isMotionValue } from '@/utils'
import { getMotionElement } from './utils'
import type { ElementType, Options, SVGAttributesWithMotionValues, SetMotionValueType } from '@/types'
</script>

<script setup lang="ts" generic="T extends ElementType = 'div', K = unknown">
import { type IntrinsicElementAttributes, getCurrentInstance, onBeforeMount, onBeforeUnmount, onBeforeUpdate, onMounted, onUnmounted, onUpdated, ref, useAttrs } from 'vue'
import { injectLayoutGroup, injectMotion, provideMotion } from './context'
import { convertSvgStyleToAttributes, createStyles } from '@/state/style'

export interface MotionProps<T extends ElementType = 'div', K = unknown> extends Options<K> {
  as?: T
  asChild?: boolean
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
} as any) as MotionProps<T>
const { initial: presenceInitial, safeUnmount } = injectAnimatePresence({ initial: ref(undefined), safeUnmount: () => true })
const parentState = injectMotion(null)
const attrs = useAttrs()
const layoutGroup = injectLayoutGroup({} as any)

const state = new MotionState(
  {
    ...attrs,
    ...props,
    layoutGroup,
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
    layoutGroup,
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
    Object.assign(styleProps, style, props.style)
  }

  if (!state.isMounted()) {
    Object.assign(styleProps, state.target, props.style)
  }
  styleProps = createStyles(styleProps)
  attrsProps.style = styleProps
  // console.log('styleProps', styleProps)
  return attrsProps
}
</script>

<template>
  <!-- @vue-ignore -->
  <Primitive
    :as="as"
    :as-child="asChild"
    v-bind="getProps()"
    :data-layout-group-key="layoutGroup?.key?.value"
  >
    <slot />
  </Primitive>
</template>
