import { getMotionElement } from '@/components/hooks/use-motion-elm'
import type { ComponentPublicInstance, DefineComponent } from 'vue'
import { Comment, cloneVNode, defineComponent, h, mergeProps } from 'vue'
import type { MotionProps } from './Motion.vue'
import { useMotionState } from './use-motion-state'
import { MotionComponentProps } from './props'

export function checkMotionIsHidden(instance: ComponentPublicInstance) {
  const isHidden = getMotionElement(instance.$el)?.style.display === 'none'
  const hasTransition = instance.$.vnode.transition
  return hasTransition && isHidden
}

const componentCache = new Map<any, any>()

function renderSlotFragments(fragments: any[]) {
  if (!Array.isArray(fragments))
    return [fragments]
  const result = []
  for (const item of fragments) {
    if (Array.isArray(item))
      result.push(...item)
    else
      result.push(item)
  }
  return result
}

const SELF_CLOSING_TAGS = ['area', 'img', 'input']
function handlePrimitiveAndSlot(asTag: string | any, allAttrs: any, slots: any) {
  // Handle self-closing tags
  if (typeof asTag === 'string' && SELF_CLOSING_TAGS.includes(asTag)) {
    return h(asTag, allAttrs)
  }

  // Handle template/asChild case
  if (asTag === 'template') {
    if (!slots.default)
      return null

    const childrens = renderSlotFragments(slots.default())
    const firstNonCommentChildrenIndex = childrens.findIndex(child => child.type !== Comment)

    if (firstNonCommentChildrenIndex === -1)
      return childrens

    const firstNonCommentChildren = childrens[firstNonCommentChildrenIndex]
    delete firstNonCommentChildren.props?.ref

    const mergedProps = firstNonCommentChildren.props
      ? mergeProps(allAttrs, firstNonCommentChildren.props)
      : allAttrs

    if (allAttrs.class && firstNonCommentChildren.props?.class)
      delete firstNonCommentChildren.props.class

    const cloned = cloneVNode(firstNonCommentChildren, mergedProps)

    // Handle onXXX event handlers
    for (const prop in mergedProps) {
      if (prop.startsWith('on')) {
        cloned.props ||= {}
        cloned.props[prop] = mergedProps[prop]
      }
    }

    if (childrens.length === 1)
      return cloned

    childrens[firstNonCommentChildrenIndex] = cloned
    return childrens
  }

  return null
}

/**
 * Creates a motion component from a base component or HTML tag
 * Caches string-based components for reuse
 */
export function createMotionComponent(
  component: string | DefineComponent,
  options: { forwardMotionProps?: boolean } = {},
) {
  const isString = typeof component === 'string'
  const name = isString ? component : component.name || ''

  if (isString && componentCache?.has(component)) {
    return componentCache.get(component)
  }

  const motionComponent = defineComponent({
    inheritAttrs: false,
    props: {
      ...MotionComponentProps,
    },
    name: name ? `motion.${name}` : 'Motion',
    setup(props, { attrs, slots }) {
      const { getProps, getAttrs } = useMotionState(props as MotionProps)

      return () => {
        console.log(props)
        const motionProps = getProps()
        const motionAttrs = getAttrs()
        const asTag = props.asChild ? 'template' : (attrs.as || component)
        const allAttrs = { ...(options.forwardMotionProps ? motionProps : {}), ...motionAttrs }

        // Try to handle as Primitive or Slot first
        const primitiveOrSlotResult = handlePrimitiveAndSlot(asTag, allAttrs, slots)
        if (primitiveOrSlotResult !== null) {
          return primitiveOrSlotResult
        }

        return h(asTag, {
          ...allAttrs,
        }, slots)
      }
    },
  }) as any

  if (isString) {
    componentCache?.set(component, motionComponent)
  }

  return motionComponent
}
