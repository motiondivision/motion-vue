import type { Component, IntrinsicElementAttributes, MaybeRef } from 'vue'

export type ComponentProps<T> = T extends new (...args: any[]) => { $props: infer Props }
  ? Props
  : never

export type ElementType = keyof IntrinsicElementAttributes
export type AsTag = keyof IntrinsicElementAttributes | ({} & string) | Component // any other string

export type ToRefs<T> = {
  [K in keyof T]: MaybeRef<T[K]>
}
