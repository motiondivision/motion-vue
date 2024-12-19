import type { VisualElement } from 'framer-motion'

export function getContextWindow({ current }: VisualElement<Element>) {
  return current ? current.ownerDocument.defaultView : null
}
