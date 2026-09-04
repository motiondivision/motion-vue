import { AnimationFeature } from '@/features/animation/animation'
import type { FeatureBundle } from '@/features/dom-animation'
import { ExitFeature } from '@/features/exit/exit'
import { createVisualElement } from '@/state/create-visual-element'
import { PressGesture } from '@/features/gestures/press'
import { HoverGesture } from '@/features/gestures/hover'
import { InViewGesture } from '@/features/gestures/in-view'
import { FocusGesture } from '@/features/gestures/focus'
import { ProjectionFeature } from '@/features/layout/projection'
import { PanGesture } from '@/features/gestures/pan'
import { DragGesture } from '@/features/gestures/drag'
import { LayoutFeature } from '@/features/layout/layout'

export const domMax: FeatureBundle = {
  renderer: createVisualElement,
  features: [
    AnimationFeature,
    ExitFeature,
    PressGesture,
    HoverGesture,
    InViewGesture,
    FocusGesture,
    ProjectionFeature,
    PanGesture,
    DragGesture,
    LayoutFeature,
  ],
}
