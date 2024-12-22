declare module 'framer-motion/dist/es/render/store.mjs' {
}

declare module 'framer-motion/dist/es/render/html/HTMLVisualElement.mjs' {
  export const HTMLVisualElement: any
}

declare module 'framer-motion/dist/es/render/svg/SVGVisualElement.mjs' {
  export const SVGVisualElement: any
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

declare module 'framer-motion/dist/es/projection/node/HTMLProjectionNode.mjs' {
  import type { IProjectionNode } from 'framer-motion'

  export const HTMLProjectionNode: IProjectionNode
}

declare module 'framer-motion/dist/es/projection/styles/scale-border-radius.mjs' {

  export const correctBorderRadius: any
}

declare module 'framer-motion/dist/es/projection/styles/scale-box-shadow.mjs' {
  export const correctBoxShadow: any
}

declare module 'framer-motion/dist/es/projection/styles/scale-correction.mjs' {
  import type { addScaleCorrector as addScaleCorrectorF } from 'framer-motion'

  export const addScaleCorrector: typeof addScaleCorrectorF
}

declare module 'framer-motion/dist/es/projection/node/state.mjs' {
  export const globalProjectionState: {
    hasAnimatedSinceResize: boolean
    hasEverUpdated: boolean
  }
}

declare module 'framer-motion/dist/es/animation/interfaces/motion-value.mjs' {
  import type { AnimationPlaybackControls, MotionValue, Transition, VisualElement } from 'framer-motion'

  export type UnresolvedKeyframes<T extends string | number> = Array<T | null>

  export type StartAnimation = (
    complete: () => void
  ) => AnimationPlaybackControls | undefined
  export const animateMotionValue: <V extends string | number>(
    name: string,
    value: MotionValue<V>,
    target: V | UnresolvedKeyframes<V>,
    transition: Transition & { elapsed?: number },
    element?: VisualElement<any>,
    isHandoff?: boolean
  ) => StartAnimation
}
