import type { VisualElement } from 'motion-dom'

export function getContextWindow({ current }: VisualElement<Element>) {
  return current ? current.ownerDocument.defaultView : null
}
