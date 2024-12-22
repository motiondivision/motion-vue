import { doneCallbacks } from '@/components/presence'
import type { VisualElement } from 'framer-motion'

export function isPresent(visualElement: VisualElement) {
  return !doneCallbacks.has(visualElement.current as Element)
}
