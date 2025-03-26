import { getMotionElement } from '@/components/hooks/use-motion-elm'
import type { ComponentPublicInstance, DefineComponent } from 'vue'
import { defineComponent, h } from 'vue'
import Motion from './Motion.vue'
import type { AsTag } from '@/types'

export function checkMotionIsHidden(instance: ComponentPublicInstance) {
  const isHidden = getMotionElement(instance.$el)?.style.display === 'none'
  const hasTransition = instance.$.vnode.transition
  return hasTransition && isHidden
}

const componentCache = new Map<string, any>()

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
    name: `motion.${name}`,
    setup(_, { attrs, slots }) {
      return () => {
        return h(Motion, {
          ...attrs,
          forwardMotionProps: isString ? false : options.forwardMotionProps,
          as: (attrs.as || component) as AsTag,
          asChild: (attrs.asChild ?? false) as boolean,
        }, slots)
      }
    },
  }) as any

  if (isString) {
    componentCache?.set(component, motionComponent)
  }

  return motionComponent
}
