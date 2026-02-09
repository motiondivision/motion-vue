import { AnimationFeature } from '@/features/animation/animation'
import { FocusGesture } from '@/features/gestures/focus'
import type { Feature } from '@/features/feature'
import { createVisualElement } from '@/state/create-visual-element'

export interface FeatureBundle {
  renderer: typeof createVisualElement
  features: Array<typeof Feature>
}

export const domAnimation: FeatureBundle = {
  renderer: createVisualElement,
  features: [
    AnimationFeature,
    // PressGesture,
    // HoverGesture,
    // InViewGesture,
    FocusGesture,
  ],
}
