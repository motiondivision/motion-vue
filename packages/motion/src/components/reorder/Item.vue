<script lang="ts">
import type { MotionProps } from '@/components/motion'
import { Motion } from '@/components/motion'
import { useReorderContext } from './context'
import { toRefs, useAttrs } from 'vue'
import { useDefaultMotionValue } from './utils'
import { useTransform } from '@/value'
import { invariant } from 'hey-listen'
import type { ElementType } from '@/types'
</script>

<script setup  lang="ts">
export interface GroupItemProps<T extends ElementType, K = unknown, V = unknown> extends MotionProps<T, K> {
  /**
   * The axis to reorder along. By default, items will be draggable on this axis.
   * To make draggable on both axes, set `<Reorder.Item drag />`
   *
   * @public
   */
  axis?: 'x' | 'y'
  /**
   * The value in the list that this component represents.
   *
   * @public
   */
  value: V
  /**
   * A subset of layout options primarily used to disable layout="size"
   *
   * @public
   * @default true
   */
  layout?: true | 'position'
}

defineOptions({
  name: 'ReorderItem',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<GroupItemProps<ElementType>>(), {
  layout: true,
  as: 'li' as ElementType,
  initial: undefined,
  animate: undefined,
  hover: undefined,
  inView: undefined,
  layoutId: undefined,
  layoutScroll: false,
  layoutRoot: false,
  dragListener: true,
  dragElastic: 0.5,
  dragMomentum: true,
  whileDrag: undefined,
  crossfade: true,
})
const { style } = toRefs(props)

const context = useReorderContext(null)
const point = {
  x: useDefaultMotionValue(style.value?.x),
  y: useDefaultMotionValue(style.value?.y),
}

const zIndex = useTransform([point.x, point.y], ([latestX, latestY]) =>
  latestX || latestY ? 1 : 'unset')
function warning() {
  invariant(Boolean(context), 'Reorder.Item must be a child of Reorder.Group')
}

const { axis, registerItem, updateOrder } = context || {}

const attrs = useAttrs()
function bindProps() {
  return {
    ...attrs,
    ...props,
    style: {
      ...style.value,
      x: point.x,
      y: point.y,
      zIndex,
    },
  }
}
</script>

<template>
  <Motion
    v-bind="bindProps()"
    :drag="axis"
    :drag-snap-to-origin="true"
    @drag="(event, gesturePoint) => {
      const { velocity } = gesturePoint
      velocity[axis]
        && updateOrder(value, point[axis].get(), velocity[axis])

      onDrag && onDrag(event, gesturePoint)
    }"
    @layout-measure="(measured) => registerItem(value, measured)"
  >
    <slot />
    {{ warning() }}
  </Motion>
</template>
