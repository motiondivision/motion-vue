import { type Component, type IntrinsicElementAttributes, type PropType, defineComponent, h } from 'vue'
import { Slot } from './Slot'

export type AsTag = keyof IntrinsicElementAttributes| ({} & string) // any other string

export interface PrimitiveProps {
  /**
   * Change the default rendered element for the one passed as a child, merging their props and behavior.
   *
   * Read our [Composition](https://www.radix-vue.com/guides/composition.html) guide for more details.
   */
  asChild?: boolean
  /**
   * The element or component this component should render as. Can be overwrite by `asChild`
   * @defaultValue "div"
   */
  as?: AsTag | Component
}

export const Primitive = defineComponent({
  name: 'Primitive',
  inheritAttrs: false,
  props: {
    asChild: {
      type: Boolean,
      default: false,
    },
    as: {
      type: [String, Object] as PropType<AsTag>,
      default: 'div',
    },
    getProps: {
      type: Function,
      default: () => ({}),
    },
  },
  setup(props, { attrs, slots }) {
    const asTag = props.asChild ? 'template' : props.as
    // For self closing tags, don't provide default slots because of hydration issue
    const SELF_CLOSING_TAGS = ['area', 'img', 'input']

    return () => {
      const motionProps = props.getProps()
      const allAttrs = { ...attrs, ...motionProps }

      if (typeof asTag === 'string' && SELF_CLOSING_TAGS.includes(asTag))
        return h(asTag, allAttrs)

      if (asTag !== 'template') {
        return h(props.as, allAttrs, { default: slots.default })
      }

      return h(Slot, allAttrs, { default: slots.default })
    }
  },
})
