import type { DefineComponent, IntrinsicElementAttributes } from 'vue'
import MotionComponent from './Motion.vue'
import type { MotionProps } from './Motion.vue'
import type { ComponentProps, MotionHTMLAttributes } from '@/types'
import { createMotionComponent } from './utils'
import { features } from '@/features/feature-manager'
import { domAnimation } from '@/features/dom-animation'

type MotionComponentProps = {
  create: <T extends DefineComponent>(T, options?: { forwardMotionProps?: boolean }) => DefineComponent<Omit<MotionProps<any, unknown>, 'as' | 'asChild'> & ComponentProps<T>>
}

type MotionNameSpace = {
  [K in keyof IntrinsicElementAttributes]: DefineComponent<Omit<MotionProps<K, unknown>, 'as' | 'asChild'> & MotionHTMLAttributes<K>, 'create'>
} & MotionComponentProps

export const motion = new Proxy(MotionComponent as unknown as MotionNameSpace, {
  get(target, prop) {
    if (typeof prop === 'symbol')
      return target[prop]
    if (!features.length) {
      features.push(...domAnimation)
    }
    if (prop === 'create') {
      return (component: any, options?: { forwardMotionProps?: boolean }) =>
        createMotionComponent(component, options)
    }

    return createMotionComponent(prop as string)
  },
})

export const Motion = motion.div as unknown as typeof MotionComponent
