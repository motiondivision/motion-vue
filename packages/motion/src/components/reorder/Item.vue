<script lang="ts">
import type { MotionProps } from '@/components/motion'
import { Motion } from '@/components/motion'
import { useReorderContext } from './context'
import { computed, ref, toRefs, useAttrs } from 'vue'
import { useDefaultMotionValue } from './utils'
import { useTransform } from '@/value'
import { invariant } from 'hey-listen'
import type { ElementType } from '@/types'
import { autoScrollIfNeeded, resetAutoScrollState } from './auto-scroll'
</script>

<script setup  generic="T extends ElementType = 'li', K = unknown, V = unknown" lang="ts">
export interface GroupItemProps<T extends ElementType = 'li', K = unknown, V = unknown> extends MotionProps<T, K> {
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

const { axis, registerItem, updateOrder, groupRef } = context || {}

const attrs = useAttrs()
function bindProps() {
  const { value, ...rest } = props
  return {
    ...attrs,
    ...rest,
    style: {
      ...style.value,
      x: point.x,
      y: point.y,
      zIndex,
    },
  }
}

const drag = computed(() => {
  if (props.drag) {
    return props.drag
  }
  return axis.value
})
const isDragging = ref(false)

// Track drag position for auto-scroll
function handleDrag(event: PointerEvent, gesturePoint: any) {
  const { velocity, point: pointerPoint } = gesturePoint
  const offset = point[axis.value].get()

  // Always attempt to update order - checkReorder handles the logic
  updateOrder(props.value, offset, velocity[axis.value])

  autoScrollIfNeeded(
    groupRef.value,
    pointerPoint[axis.value],
    axis.value,
    velocity[axis.value],
  )

  props.onDrag && props.onDrag(event, gesturePoint)
}

function handleDragEnd(event: PointerEvent, gesturePoint: any) {
  isDragging.value = false
  resetAutoScrollState()
  props.onDragEnd && props.onDragEnd(event, gesturePoint)
}

function handleDragStart(event: PointerEvent, gesturePoint: any) {
  isDragging.value = true
  props.onDragStart?.(event, gesturePoint)
}
</script>

<template>
  <Motion
    v-bind="bindProps()"
    :drag="drag"
    :drag-snap-to-origin="true"
    @drag="handleDrag"
    @drag-end="handleDragEnd"
    @drag-start="handleDragStart"
    @layout-measure="(measured) => registerItem(value, measured)"
  >
    <slot :is-dragging="isDragging" />
    {{ warning() }}
  </Motion>
</template>
