import { isSVGElement } from '@/state/utils'
import type { AsTag } from '@/types'
import { HTMLVisualElement, SVGVisualElement } from 'motion-dom'

export function createVisualElement(Component: AsTag, options: any) {
  return isSVGElement(Component as any) ? new SVGVisualElement(options) : new HTMLVisualElement(options)
}
