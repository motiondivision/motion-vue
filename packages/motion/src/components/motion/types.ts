import type { Feature } from '@/features'
import type { AsTag, ComponentProps, Options, SVGAttributesWithMotionValues, SetMotionValueType } from '@/types'
import type { IntrinsicElementAttributes } from 'vue'

export interface MotionProps<T extends AsTag = 'div', K = unknown> extends Options<K> {
  as?: T
  asChild?: boolean
  hover?: Options['hover']
  press?: Options['press']
  inView?: Options['inView']
  focus?: Options['focus']
  whileDrag?: Options['whileDrag']
  whileHover?: Options['whileHover']
  whilePress?: Options['whilePress']
  whileInView?: Options['whileInView']
  whileFocus?: Options['whileFocus']
  forwardMotionProps?: boolean
  features?: Feature[]
  ignoreStrict?: boolean
}
type __VLS_PrettifyLocal<T> = {
  [K in keyof T]: T[K];
} & {}

export type MotionComponent = <T extends AsTag = 'div', K = any>(__VLS_props: NonNullable<Awaited<typeof __VLS_setup>>['props'], __VLS_ctx?: __VLS_PrettifyLocal<Pick<NonNullable<Awaited<typeof __VLS_setup>>, 'attrs' | 'emit' | 'slots'>>, __VLS_expose?: NonNullable<Awaited<typeof __VLS_setup>>['expose'], __VLS_setup?: Promise<{
  props: __VLS_PrettifyLocal<Pick<Partial<{}> & Omit<{} & import('vue').VNodeProps & import('vue').AllowedComponentProps & import('vue').ComponentCustomProps & Readonly<import('vue').ExtractPropTypes<{}>>, never>, never> & (Omit<T extends keyof IntrinsicElementAttributes ? SetMotionValueType<IntrinsicElementAttributes, keyof SVGAttributesWithMotionValues>[T] : ComponentProps<T>, keyof Options<any> | 'asChild'> & MotionProps<T, K>)> & import('vue').PublicProps
  expose: (exposed: import('vue').ShallowUnwrapRef<{}>) => void
  attrs: any
  slots: {
    default?: (_: {}) => any
  }
  emit: {}
}>) => import('vue').VNode<import('vue').RendererNode, import('vue').RendererElement, { [key: string]: any }> & { __ctx?: Awaited<typeof __VLS_setup> }
