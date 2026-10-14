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

// Boolean-typed MotionProps are cast to false by Vue when absent and would
// be spread onto the inner Motion by bindProps(), overriding Motion's own
// defaults (e.g. initial: false makes items skip their initial animation).
// Mirror Item.vue's defaults so absent props stay undefined (#276).
const props = withDefaults(defineProps<GroupProps<AsTag, K, V>>(), {
  as: 'ul',
  initial: undefined,
  inherit: undefined,
  crossfade: true,
  dragElastic: 0.5,
  dragMomentum: true,
  dragListener: true,
})

const itemLayouts = new Map<V, Box>()
const detectedAxis = ref<ReorderAxis>('y')
let isReordering = false
// Set when a drag reorders; the release ending that drag isn't a click (#2682)
const hasReordered = ref(false)

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
  hasReordered,
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
      hasReordered.value = true
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
/**
 * A release that ends a reordering drag isn't a click. Browsers only click an
 * element holding both the press and release targets, so swallow it here,
 * above every item (#2682). The flag is cleared when the drag ends — a frame
 * after the release's click — or on the next press. Clicks with no pointer
 * press behind them (detail 0, e.g. keyboard) are left alone.
 */
function handleClickCapture(event: MouseEvent) {
  if (hasReordered.value && event.detail) {
    hasReordered.value = false
    event.stopPropagation()
    event.preventDefault()
  }
}

function handlePointerdownCapture() {
  hasReordered.value = false
}

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
    @pointerdown.capture="handlePointerdownCapture"
    @click.capture="handleClickCapture"
  >
    <slot />
    {{ warning() }}
  </Motion>
</template>
