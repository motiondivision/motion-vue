<script lang="ts">
import type { IntrinsicElementAttributes } from 'vue'
import { Primitive } from './Primitive'
// import { isSvgTag } from './utils'
import { MotionState } from '@/state/motion-state'
import { isSVGElement } from '@/state/utils'

type ElementType = keyof IntrinsicElementAttributes
</script>

<script setup lang="ts" generic="T extends ElementType = 'div'">
import { onMounted, onUnmounted, onUpdated, ref } from 'vue'
import type { Options } from '@/state/types'
import { usePrimitiveElement } from './usePrimitiveElement'
import { injectAnimatePresence, injectMotion, provideMotion } from './context'
import { createStyles, style } from '@/state/style'

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

const { initial: presenceInitial } = injectAnimatePresence({ initial: ref(undefined) })
const parentState = injectMotion(null)
const state = new MotionState(
  {
    ...props,
  },
  parentState!,
)
provideMotion(state)

const { primitiveElement, currentElement } = usePrimitiveElement()
onMounted(() => {
  state.mount(currentElement.value)
  if (isSVGElement(props.as)) {
    style.set(currentElement.value, 'opacity', '')
  }
  state.update({
    ...props,
    style: { ...createStyles(state.getTarget()), ...props.style },
    initial: presenceInitial.value === false
      ? presenceInitial.value
      : (
          props.initial === true ? undefined : props.initial
        ),
  })
})
let unmounted = false
onUnmounted(() => {
  unmounted = true
})

onUpdated(() => {
  state.update({
    ...props,
    initial: presenceInitial.value === false
      ? presenceInitial.value
      : (
          props.initial === true ? undefined : props.initial
        ),
  })
})

function getStyle() {
  if (isSVGElement(props.as) && !state.isMounted()) {
    return { opacity: 0 }
  }
  return !state.isMounted() ? { ...createStyles(props.style), ...createStyles(state.getTarget()) } : createStyles(props.style)
}
</script>

<template>
  <!-- @vue-ignore -->
  <Primitive
    ref="primitiveElement"
    :as="as"
    :as-child="asChild"
    :style="getStyle()"
  >
    <slot />
  </Primitive>
</template>
