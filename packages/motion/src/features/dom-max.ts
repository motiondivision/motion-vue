import { AnimationFeature } from '@/features/animation/animation'
import type { FeatureBundle } from '@/features/dom-animation'
import { createVisualElement } from '@/state/create-visual-element'
import { PressGesture } from '@/features/gestures/press'
import { HoverGesture } from '@/features/gestures/hover'
import { InViewGesture } from '@/features/gestures/in-view'
import { FocusGesture } from '@/features/gestures/focus'

export const domMax: FeatureBundle = {
  renderer: createVisualElement,
  features: [
    AnimationFeature,
    PressGesture,
    HoverGesture,
    InViewGesture,
    FocusGesture,
    // ProjectionFeature,
    // PanGesture,
    // DragGesture,
    // LayoutFeature,
  ],
}
