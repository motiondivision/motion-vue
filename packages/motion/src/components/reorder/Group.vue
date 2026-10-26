<script lang="ts">
import type { MotionProps } from '@/components/motion'
import { Motion } from '@/components/motion'
import type { ReorderAxis } from './types'
import type { AsTag } from '@/types'
import type { Box, Point } from 'motion-utils'
import { invariant } from 'hey-listen'
import { computed, nextTick, onUpdated, ref, useAttrs } from 'vue'
import { moveItem } from 'motion-utils'
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
   * The second argument is the value that moved. The callback fires for
   * each step of a drag, not only when the drag ends.
   *
   * @public
   */
  // eslint-disable-next-line vue/prop-name-casing
  'onUpdate:values'?: (newOrder: V[], moved: V) => void
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

function getOrder() {
  return props.values.flatMap((value) => {
    const layout = itemLayouts.get(value)
    return layout ? [{ value, layout }] : []
  })
}

function isRTL() {
  const element = groupRef.value
  return element?.ownerDocument.defaultView?.getComputedStyle(element).direction === 'rtl'
}

function commit(newOrder: ReturnType<typeof getOrder>, moved: V) {
  let i = 0
  const newValues = props.values.map(value =>
    itemLayouts.has(value) ? newOrder[i++].value : value,
  )
  if (newValues.some((value, index) => value !== props.values[index]))
    props['onUpdate:values']?.(newValues, moved)
}

function restoreFocus(element: Element) {
  const document = element.ownerDocument
  if (document.activeElement !== element)
    return
  nextTick(() => {
    if (element.isConnected && document.activeElement !== element)
      (element as HTMLElement).focus()
  })
}

reorderContextProvider({
  groupRef,
  axis,
  hasReordered,
  onKeyDown: (event, item: V, from, grab) => {
    const { key, currentTarget } = event
    if (
      event.defaultPrevented
      || event.target !== currentTarget
      || event.altKey
      || event.ctrlKey
      || event.metaKey
    ) {
      return
    }

    const order = getOrder()
    const keyIndex = ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'].indexOf(key)
    const isX = keyIndex % 2
    if (key === ' ') {
      if (!event.repeat)
        grab(currentTarget as Element, from ? undefined : [...props.values])
    }
    else if (!from) {
      return
    }
    else if (key === 'Escape') {
      const kept = from.flatMap(value => order.filter(data => data.value === value))
      commit(order.map(data => from.includes(data.value) ? kept.shift()! : data), item)
      restoreFocus(currentTarget as Element)
      grab(currentTarget as Element)
    }
    else if (keyIndex < 0 || (axis.value !== 'xy' && axis.value !== (isX ? 'x' : 'y'))) {
      return
    }
    else {
      const index = order.findIndex(({ value }) => value === item)
      const target = index + ((keyIndex > 1) !== Boolean(isX && isRTL()) ? 1 : -1)
      if (index > -1 && order[target]) {
        commit(moveItem(order, index, target), item)
        restoreFocus(currentTarget as Element)
      }
    }
    event.preventDefault()
  },
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

    const order = getOrder()
    const newOrder = checkReorder(
      order,
      item,
      offset,
      velocity,
      axis.value,
      isRTL() ? 'rtl' : 'ltr',
    )
    if (order !== newOrder) {
      isReordering = true
      hasReordered.value = true
      commit(newOrder, item)
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
