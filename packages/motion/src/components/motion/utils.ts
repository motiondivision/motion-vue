import { getMotionElement } from '@/components/hooks/use-motion-elm'
import type { Component, ComponentPublicInstance, DefineComponent, IntrinsicElementAttributes } from 'vue'
import { Comment, cloneVNode, defineComponent, h, mergeProps } from 'vue'
import { useMotionState } from './use-motion-state'
import { MotionComponentProps } from './props'
import type { MotionProps } from '@/components/motion/types'
import type { Feature } from '@/features'
import { updateLazyFeatures } from '@/features/lazy-features'
import type { ComponentProps, MotionHTMLAttributes } from '@/types'

type MotionCompProps = {
  create: <T extends DefineComponent>(T, options?: MotionCreateOptions) => DefineComponent<Omit<MotionProps<any, unknown>, 'as' | 'asChild'> & ComponentProps<T>>
}
export interface MotionCreateOptions {
  forwardMotionProps?: boolean
  features?: Array<typeof Feature>
}
export function checkMotionIsHidden(instance: ComponentPublicInstance) {
  const isHidden = getMotionElement(instance.$el)?.style.display === 'none'
  const hasTransition = instance.$.vnode.transition
  return hasTransition && isHidden
}

const componentMaxCache = new Map<any, Component>()
const componentMiniCache = new Map<any, Component>()

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
  options: MotionCreateOptions = {},
) {
  const isString = typeof component === 'string'
  const name = isString ? component : component.name || ''
  const componentCache = options.features?.length > 0 ? componentMaxCache : componentMiniCache
  if (isString && componentCache?.has(component)) {
    return componentCache.get(component)
  }

  const motionComponent = defineComponent({
    inheritAttrs: false,
    props: {
      ...MotionComponentProps,
      as: { type: [String, Object], default: component || 'div' },
    },
    name: name ? `motion.${name}` : 'Motion',
    setup(props, { slots }) {
      const { getProps, getAttrs, state } = useMotionState(props as any, !!options.features?.length)
      /**
       * Vue reapplies all styles every render, include style properties and calculated initially styles get reapplied every render.
       * To prevent this, reapply the current motion state styles in vnode updated lifecycle
       */
      function onVnodeUpdated() {
        const el = state.element
        const isComponent = typeof props.as === 'object'
        if ((!isComponent || props.asChild) && el) {
          const { style } = getAttrs()
          if (style) {
            for (const [key, val] of Object.entries(style)) {
              (el).style[key] = val
            }
          }
        }
      }
      return () => {
        const motionProps = getProps()
        const motionAttrs = getAttrs()
        const asTag = props.asChild ? 'template' : props.as
        const allAttrs = {
          ...(options.forwardMotionProps || props.forwardMotionProps ? motionProps : {}),
          ...motionAttrs,
          onVnodeUpdated,
        }

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
  })

  if (isString) {
    componentCache?.set(component, motionComponent)
  }

  return motionComponent
}

type MotionNameSpace = {
  [K in keyof IntrinsicElementAttributes]: DefineComponent<Omit<MotionProps<K, unknown>, 'as' | 'asChild' | 'motionConfig' | 'layoutGroup'> & MotionHTMLAttributes<K>, 'create'>
} & MotionCompProps

export function createMotionComponentWithFeatures(
  features: Array<typeof Feature> = [],
) {
  return new Proxy({} as unknown as MotionNameSpace, {
    get(target, prop) {
      // Update lazy features when component is accessed (for Motion component with domMax)
      if (features.length) {
        updateLazyFeatures(features)
      }

      if (prop === 'create') {
        return (component: any, options?: MotionCreateOptions) =>
          createMotionComponent(component, {
            ...options,
            features,
          })
      }

      return createMotionComponent(prop as string, {
        features,
      })
    },
  })
}
