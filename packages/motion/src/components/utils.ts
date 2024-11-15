import { Fragment, type VNode } from 'vue'

const svgTags = [
  'path',
  'rect',
  'circle',
  'ellipse',
  'line',
  'polyline',
  'polygon',
  'text',
  'g',
  'defs',
  'use',
  'symbol',
  'linearGradient',
  'radialGradient',
  'stop',
  'clipPath',
  'mask',
  'pattern',
  'image',
  'tspan',
  'textPath',
]

export function isSvgTag(tag: string) {
  return svgTags.includes(tag)
}

export function getChildren(children: VNode[]): VNode[] {
  if (!Array.isArray(children))
    return []

  // 处理 Fragment 和 template 的情况
  return children.flatMap((child) => {
    if (child.type === 'template' || child.type === Fragment)
      return getChildren(child.children as VNode[] || [])
    return child
  })
}
