import type { Component, DefineComponent, ExtractPropTypes, ExtractPublicPropTypes, IntrinsicElementAttributes } from 'vue'

export type ComponentProps<T> = T extends DefineComponent<
  ExtractPropTypes<infer Props>,
  any,
  any
>
  ? ExtractPublicPropTypes<Props>
  : never

export type ElementType = keyof IntrinsicElementAttributes
export type AsTag = keyof IntrinsicElementAttributes | ({} & string) | Component // any other string
