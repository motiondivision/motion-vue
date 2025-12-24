import type { VisualElement } from 'framer-motion'

export function isPresent(visualElement: VisualElement) {
  return visualElement.projection?.isPresent
}
