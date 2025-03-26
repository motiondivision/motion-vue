import type { DefineComponent, IntrinsicElementAttributes } from 'vue'
import Motion from './Motion.vue'
import type { MotionProps } from './Motion.vue'
import type { ComponentProps, MotionHTMLAttributes } from '@/types'
import { createMotionComponent } from './utils'

type MotionComponentProps = {
  create: <T extends DefineComponent>(T, options?: { forwardMotionProps?: boolean }) => DefineComponent<MotionProps<any, unknown> & ComponentProps<T>>
}

type MotionNameSpace = {
  [K in keyof IntrinsicElementAttributes]: DefineComponent<MotionProps<K, unknown> & MotionHTMLAttributes<K>>
} & MotionComponentProps

export const motion = new Proxy(Motion as unknown as MotionNameSpace, {
  get(target, prop) {
    if (typeof prop === 'symbol')
      return target[prop]
    if (prop === 'create') {
      return (component: any, options?: { forwardMotionProps?: boolean }) =>
        createMotionComponent(component, options)
    }

    return createMotionComponent(prop as string)
  },
})
