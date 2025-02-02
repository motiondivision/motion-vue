import type { DefineSetupFnComponent, IntrinsicElementAttributes } from 'vue'
import type { GroupProps } from './Group.vue'
import Group from './Group.vue'
import type { GroupItemProps } from './Item.vue'
import Item from './Item.vue'
import type { ElementType, SVGAttributesWithMotionValues, SetMotionValueType } from '@/types'

type IntrinsicElementAttributesAsMotionValues = SetMotionValueType<IntrinsicElementAttributes, keyof SVGAttributesWithMotionValues>

type ItemProps<T extends ElementType = 'li'> = GroupItemProps<T, unknown, unknown> & IntrinsicElementAttributesAsMotionValues[T]

export const ReorderGroup = Group as DefineSetupFnComponent<GroupProps<ElementType, any, any>>

export const ReorderItem = Item as DefineSetupFnComponent<ItemProps<ElementType>>
export const Reorder = {
  Group: ReorderGroup,
  Item: ReorderItem,
}
