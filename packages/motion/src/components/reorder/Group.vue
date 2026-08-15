<script lang="ts">
import type { MotionProps } from '@/components/motion'
import { Motion } from '@/components/motion'
import type { ReorderAxis } from './types'
import type { AsTag } from '@/types'
import type { Box, Point } from 'motion-utils'
import { invariant } from 'hey-listen'
import { computed, onUpdated, ref, useAttrs } from 'vue'
import { reorderContextProvider } from './context'
import { checkReorder, detectAxis } from './utils'
import { useDomRef } from '@/utils'
</script>

<!-- @ts-ignore -->
<script setup generic="T, K, V" lang="ts">
export interface GroupProps<T extends AsTag, K, V> extends
  MotionProps<T, K> {
  /**
   * The axis to reorder along. By default, the axis is auto-detected from
   * the measured item layouts. Set `"xy"` to enable reordering in
   * wrapped/grid layouts.
   *
   * @public
   */
  'axis'?: ReorderAxis
  /**
   * A callback to fire with the new value order. Use `v-model`
   * to keep the values state in sync automatically.
   *
   * @public
   */
  // eslint-disable-next-line vue/prop-name-casing
  'onUpdate:values'?: (newOrder: V[]) => void
  /**
   * The latest values state.
   *
   * ```vue
   * <Reorder.Group v-model="items">
   *   <Reorder.Item v-for="item in items" :key="item" :value="item" />
   * </Reorder.Group>
   * ```
   *
   * @public
   */
  'values': V[]
}

defineOptions({
  name: 'ReorderGroup',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<GroupProps<AsTag, K, V>>(), {
  as: 'ul',
})

const itemLayouts = new Map<V, Box>()
const detectedAxis = ref<ReorderAxis>('y')
let isReordering = false

const axis = computed<ReorderAxis>(() => props.axis || detectedAxis.value)

function warning() {
  invariant(Boolean(props.values), 'Reorder.Group must be provided a values prop')
}

onUpdated(() => {
  isReordering = false
})

const groupRef = useDomRef()

reorderContextProvider({
  groupRef,
  axis,
  registerItem: (value: V, layout: Box) => {
    // Prune layouts for values no longer in the list (e.g. removed or
    // exiting with AnimatePresence)
    const valuesSet = new Set(props.values)
    itemLayouts.forEach((_, itemValue) => {
      if (!valuesSet.has(itemValue))
        itemLayouts.delete(itemValue)
    })
    itemLayouts.set(value, layout)
    if (!props.axis) {
      const nextAxis = detectAxis(props.values.flatMap((itemValue) => {
        const itemLayout = itemLayouts.get(itemValue)
        return itemLayout ? [itemLayout] : []
      }))
      if (nextAxis !== detectedAxis.value)
        detectedAxis.value = nextAxis
    }
  },
  updateOrder: (item: V, offset: Point, velocity: Point) => {
    if (isReordering)
      return

    // Build the order from the latest values so unmeasured items (e.g.
    // entering/exiting with AnimatePresence) keep their positions
    const order = props.values.flatMap((value) => {
      const layout = itemLayouts.get(value)
      return layout ? [{ value, layout }] : []
    })

    const element = groupRef.value
    const direction = element?.ownerDocument.defaultView?.getComputedStyle(element).direction === 'rtl'
      ? 'rtl' as const
      : 'ltr' as const

    const newOrder = checkReorder(order, item, offset, velocity, axis.value, direction)
    if (order !== newOrder) {
      isReordering = true
      // Remap the reordered measured items onto their slots in values,
      // leaving unmeasured values in place
      const newValues = [...props.values]
      const measuredIndexes = order.map(({ value }) => props.values.indexOf(value))
      newOrder.forEach(({ value }, index) => {
        newValues[measuredIndexes[index]] = value
      })
      props['onUpdate:values']?.(newValues)
    }
  },
})

const attrs = useAttrs()
function bindProps() {
  const { axis, values, 'onUpdate:values': onUpdateValues, ...rest } = props
  return {
    ...attrs,
    ...rest,
    style: {
      overflowAnchor: 'none',
      ...(rest.style as Record<string, any>),
    },
  }
}
</script>

<template>
  <Motion
    v-bind="bindProps()"
    ref="groupRef"
  >
    <slot />
    {{ warning() }}
  </Motion>
</template>
