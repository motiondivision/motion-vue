import type { DefineComponent, ExtractPropTypes, ExtractPublicPropTypes, IntrinsicElementAttributes } from 'vue'
import { defineComponent, h } from 'vue'
import Motion from './Motion.vue'
import type { MotionProps } from './Motion.vue'

type ComponentProps<T> = T extends DefineComponent<
  ExtractPropTypes<infer Props>,
  any,
  any
>
  ? ExtractPublicPropTypes<Props>
  : never
type MotionComponentProps = {
  create: <T extends DefineComponent>(T) => DefineComponent<MotionProps<any, unknown> & ComponentProps<T>>
}
type MotionKeys = keyof MotionComponentProps

type MotionNameSpace = {
  [K in keyof IntrinsicElementAttributes]: DefineComponent<MotionProps<K, unknown>>
} & {
  create: MotionComponentProps['create']
}

const componentCache = new Map<MotionKeys, DefineComponent>()

export const motion = new Proxy(Motion, {
  get(target, prop: MotionKeys) {
    if (typeof prop === 'symbol')
      return target[prop]
    let motionComponent = componentCache.get(prop)
    if (prop === 'create') {
      return (component: any) => {
        return defineComponent({
          inheritAttrs: false,
          name: `motion.${component.$name}`,
          setup(_, { attrs, slots }) {
            return () => {
              return h(Motion, {
                ...attrs,
                as: component,
                asChild: false,
              }, slots)
            }
          },
        })
      }
    }

    if (!motionComponent) {
      motionComponent = defineComponent({
        inheritAttrs: false,
        name: `motion.${prop}`,
        setup(_, { attrs, slots }) {
          return () => {
            return h(Motion, {
              ...attrs,
              as: prop as any,
              asChild: false,
            }, slots)
          }
        },
      }) as any
      componentCache.set(prop, motionComponent)
    }
    return motionComponent
  },
}) as (unknown) as MotionNameSpace
