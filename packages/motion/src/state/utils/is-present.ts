import { doneCallbacks } from '@/components/animate-presence/presence'
import type { VisualElement } from 'framer-motion'

export function isPresent(visualElement: VisualElement) {
  return !doneCallbacks.has(visualElement.current as Element)
}
