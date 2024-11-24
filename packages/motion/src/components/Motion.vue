<script lang="ts">
import type { IntrinsicElementAttributes } from 'vue'
import { Primitive } from './Primitive'
import { MotionState } from '@/state/motion-state'
import { isSVGElement } from '@/state/utils'
import { injectAnimatePresence } from './presence'
</script>

<script setup lang="ts" generic="T extends ElementType = 'div'">
import { getCurrentInstance, onBeforeMount, onUnmounted, onUpdated, ref, useAttrs } from 'vue'
import type { ElementType, Options } from '@/state/types'
import { injectMotion, provideMotion } from './context'
import { createStyles } from '@/state/style'

export interface MotionProps<T extends ElementType = 'div'> extends Options {
  as?: T
  asChild?: boolean
}

type ComBindProps = /* @vue-ignore */ Omit<IntrinsicElementAttributes[T], keyof Options | 'style' | 'as' | 'asChild'>

defineOptions({
  name: 'Motion',
  inheritAttrs: true,
})

const props = withDefaults(defineProps<MotionProps<T> & ComBindProps>(), {
  as: 'div' as T,
  asChild: false,
  initial: undefined,
  animate: undefined,
  hover: undefined,
  inView: undefined,
} as any) as MotionProps<T>

const { initial: presenceInitial, safeUnmount } = injectAnimatePresence({ initial: ref(undefined), safeUnmount: () => true })
const parentState = injectMotion(null)
const state = new MotionState(
  {
    ...props,
  },
  parentState!,
)
provideMotion(state)

// const { primitiveElement, currentElement } = usePrimitiveElement()
const attrs = useAttrs()
const instance = getCurrentInstance()
onBeforeMount(() => {
  state.mount(instance?.vnode.el as HTMLElement)
  state.update({
    ...attrs,
    ...props,
    style: { ...createStyles(state.getTarget()), ...props.style },
    initial: presenceInitial.value === false
      ? presenceInitial.value
      : (
          props.initial === true ? undefined : props.initial
        ),
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

function getStyle() {
  if (!isSVGElement(props.as))
    return !state.isMounted() ? { ...createStyles(props.style), ...createStyles(state.getTarget()) } : createStyles(props.style)
}

function getSVGProps() {
  return (!state.isMounted() && isSVGElement(props.as)) ? state.visualElement?.latestValues : undefined
}
</script>

<template>
  <!-- @vue-ignore -->
  <Primitive
    :as="as"
    :as-child="asChild"
    :style="getStyle()"
    v-bind="getSVGProps()"
  >
    <slot />
  </Primitive>
</template>
