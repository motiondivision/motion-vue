<script lang="ts">
import { Primitive } from './Primitive'
import { MotionState } from '@/state/motion-state'
import { isSVGElement } from '@/state/utils'
import { injectAnimatePresence } from './presence'
import { isMotionValue } from '@/utils'
import type { ElementType, Options, SVGAttributesWithMotionValues, SetMotionValueType } from '@/types'
</script>

<script setup lang="ts" generic="T extends ElementType = 'div', K = unknown">
import { type IntrinsicElementAttributes, getCurrentInstance, onMounted, onUnmounted, onUpdated, ref, useAttrs } from 'vue'
import { injectMotion, provideMotion } from './context'
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
} as any) as MotionProps<T>
const { initial: presenceInitial, safeUnmount } = injectAnimatePresence({ initial: ref(undefined), safeUnmount: () => true })
const parentState = injectMotion(null)
const attrs = useAttrs()
const state = new MotionState(
  {
    ...attrs,
    ...props,
  },
  parentState!,
)
provideMotion(state)

const instance = getCurrentInstance()
onMounted(() => {
  state.mount(instance?.vnode.el as HTMLElement)
  state.update({
    ...attrs,
    ...props,
    style: { ...createStyles(state.getTarget()), ...props.style },
  })
})

onUnmounted(() => {
  if (safeUnmount(instance?.vnode.el as HTMLElement))
    state.unmount()
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
  const attrsProps = { ...attrs }
  Object.keys(attrs).forEach((key) => {
    if (isMotionValue(attrs[key]))
      attrsProps[key] = attrs[key].get()
  })
  let styleProps: Record<string, any> = {
    ...props.style,
  }

  if (!state.isMounted()) {
    if (isSVGElement(props.as)) {
      const { attributes, style } = convertSvgStyleToAttributes(state.getTarget())
      Object.assign(attrsProps, attributes)
      Object.assign(styleProps, style, props.style)
    }
    else {
      Object.assign(styleProps, state.getTarget(), props.style)
    }
  }
  styleProps = createStyles(styleProps)
  attrsProps.style = createStyles(styleProps)
  return attrsProps
}
</script>

<template>
  <!-- @vue-ignore -->
  <Primitive
    :as="as"
    :as-child="asChild"
    v-bind="getProps()"
  >
    <slot />
  </Primitive>
</template>
