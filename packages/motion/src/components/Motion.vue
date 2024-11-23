<script lang="ts">
import type { IntrinsicElementAttributes } from 'vue'
import { Primitive } from './Primitive'
import { isSvgTag } from './utils'
import { MotionState } from '@/state/motion-state'

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

let manuallyAppliedMotionStyles = false
onUpdated(() => {
  /**
   * Vue reapplies all styles every render, rather than diffing and
   * only reapplying the ones that change. This means that initially
   * calculated motion styles also get reapplied every render, leading
   * to incorrect animation origins.
   *
   * To prevent this, once an element is mounted we hand over these
   * styles to Motion. This will currently still lead to a jump if interrupting
   * transforms in browsers where the number polyfill is used.
   */
  if (!manuallyAppliedMotionStyles && currentElement.value) {
    manuallyAppliedMotionStyles = true

    const styles = createStyles(state.getTarget())
    for (const key in styles) {
      style.set(currentElement.value, key, styles[key])
    }
  }

  state.update({
    ...props,
    initial: presenceInitial.value === false
      ? presenceInitial.value
      : (
          props.initial === true ? undefined : props.initial
        ),
  })
})

function getSVGProps() {
  if (!state.isMounted() && isSvgTag(props.as)) {
    return state.getTarget()
  }
}

function getStyle() {
  if (isSvgTag(props.as)) {
    return props.style
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
    v-bind="getSVGProps()"
    :style="getStyle()"
  >
    <slot />
  </Primitive>
</template>
