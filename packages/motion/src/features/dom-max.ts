import { AnimationFeature } from '@/features/animation/animation'
import type { FeatureBundle } from '@/features/dom-animation'
import { createVisualElement } from '@/state/create-visual-element'

export const domMax: FeatureBundle = {
  renderer: createVisualElement,
  features: [
    AnimationFeature,
    // PressGesture,
    // HoverGesture,
    // InViewGesture,
    // FocusGesture,
    // ProjectionFeature,
    // PanGesture,
    // DragGesture,
    // LayoutFeature,
  ],
}
