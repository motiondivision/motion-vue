import { AnimationFeature } from '@/features/animation/animation'
import { ExitFeature } from '@/features/exit/exit'
import { FocusGesture } from '@/features/gestures/focus'
import { PressGesture } from '@/features/gestures/press'
import { HoverGesture } from '@/features/gestures/hover'
import { InViewGesture } from '@/features/gestures/in-view'
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
    ExitFeature,
    PressGesture,
    HoverGesture,
    InViewGesture,
    FocusGesture,
  ],
}
