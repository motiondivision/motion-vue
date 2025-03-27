<script lang="ts">
import type { AsTag, ComponentProps, ElementType, Options, SVGAttributesWithMotionValues, SetMotionValueType } from '@/types'
import { useMotionState } from './use-motion-state'
import { MotionComponentProps } from './props'
</script>

<script setup lang="ts" generic="T extends AsTag = 'div', K = unknown">
import type { IntrinsicElementAttributes } from 'vue'

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

const props = defineProps({
  ...MotionComponentProps,
}) as unknown as MotionProps<T>

const { getProps, getAttrs, layoutGroup } = useMotionState(props as MotionProps)
// const PrimitiveRef = ref<ComponentInstance<any>>()

// function onMotionComplete(e: CustomEvent) {
//   if (props.asChild) {
//     PrimitiveRef.value?.$forceUpdate()
//   }
//   (attrs as any).onMotioncomplete?.(e)
// }
</script>

<template>
  <!-- @vue-ignore -->
  <!-- ref="PrimitiveRef" -->
  <!-- <Primitive
    :get-props="getProps"
    :get-attrs="getAttrs"
    :as="as"
    :as-child="asChild"
    :data-motion-group="layoutGroup.key?.value || undefined"
  > -->
  <!-- @motioncomplete="onMotionComplete" -->
  <slot />
  <!-- </Primitive> -->
</template>
