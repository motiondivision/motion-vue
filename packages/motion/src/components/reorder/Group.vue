<script lang="ts">
import type { MotionProps } from '@/components/motion'
import { Motion } from '@/components/motion'
import type { ItemData } from './types'
import type { AsTag } from '@/types'
import { invariant } from 'hey-listen'
import { onBeforeUpdate, onUpdated, toRefs, useAttrs } from 'vue'
import { reorderContextProvider } from './context'
import { checkReorder, compareMin, getValue } from './utils'
</script>

<!-- @ts-ignore -->
<script setup generic="T, K, V" lang="ts">
export interface GroupProps<T extends AsTag, K, V> extends
  MotionProps<T, K> {
  /**
   * The axis to reorder along. By default, items will be draggable on this axis.
   * To make draggable on both axes, set `<Reorder.Item drag />`
   *
   * @public
   */
  'axis'?: 'x' | 'y'
  /**
   * A callback to fire with the new value order. For instance, if the values
   * are provided as a state from `useState`, this could be the set state function.
   *
   * @public
   */
  // eslint-disable-next-line vue/prop-name-casing
  'onUpdate:values'?: (newOrder: V[]) => void
  /**
   * The latest values state.
   *
   * ```jsx
   * function Component() {
   *   const [items, setItems] = useState([0, 1, 2])
   *
   *   return (
   *     <Reorder.Group values={items} onReorder={setItems}>
   *         {items.map((item) => <Reorder.Item key={item} value={item} />)}
   *     </Reorder.Group>
   *   )
   * }
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
  axis: 'y',
})
const { axis } = toRefs(props)

let order: ItemData<any>[] = []
let isReordering = false
function warning() {
  invariant(Boolean(props.values), 'Reorder.Group must be provided a values prop')
}
onUpdated(() => {
  isReordering = false
})
onBeforeUpdate(() => {
  order = []
})

reorderContextProvider({
  axis,
  registerItem: (value, layout) => {
    // If the entry was already added, update it rather than adding it again
    const idx = order.findIndex(entry => value === entry.value)
    if (idx !== -1) {
      order[idx].layout = layout[axis.value]
    }
    else {
      order.push({ value, layout: layout[axis.value] })
    }
    order.sort(compareMin)
  },
  updateOrder: (item: any, offset: number, velocity: number) => {
    if (isReordering)
      return

    const newOrder = checkReorder(order, item, offset, velocity)
    if (order !== newOrder) {
      isReordering = true
      props['onUpdate:values']?.(
        newOrder
          .map(getValue)
          .filter(value => props.values.includes(value)),
      )
    }
  },
})

const attrs = useAttrs()
function bindProps() {
  const { axis, values, 'onUpdate:values': onUpdateValues, ...rest } = props
  return {
    ...attrs,
    ...rest,
  }
}
</script>

<template>
  <Motion
    v-bind="bindProps()"
  >
    <slot />
    {{ warning() }}
  </Motion>
</template>
