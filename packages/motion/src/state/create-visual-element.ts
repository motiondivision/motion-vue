import { isSVGElement } from '@/state/utils'
import { HTMLVisualElement } from 'framer-motion/dist/es/render/html/HTMLVisualElement.mjs'
import { SVGVisualElement } from 'framer-motion/dist/es/render/svg/SVGVisualElement.mjs'

export function createVisualElement(Component: string, options: any) {
  return isSVGElement(Component as any) ? new SVGVisualElement(options) : new HTMLVisualElement(options)
}
