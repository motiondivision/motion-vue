declare module 'framer-motion/dist/es/render/store.mjs' {
}

declare module 'framer-motion/dist/es/animation/utils/create-visual-element.mjs' {
  export const createDOMVisualElement: (element: Element) => any
}

declare module 'motion-value' {
  import type { MotionValue } from 'framer-motion/dom'

  export const collectMotionValues: { current: MotionValue[] | undefined } // 根据实际需要定义具体类型

}

declare module 'framer-main-animation' {
  import type { animateValue as animateValueF } from 'framer-motion'

  export const animateValue: typeof animateValueF
  export type MainThreadAnimation = ReturnType<typeof animateValueF>
}

declare module 'animate' {
  import type { animate as animateF } from 'framer-motion'

  export const animate: typeof animateF
}
