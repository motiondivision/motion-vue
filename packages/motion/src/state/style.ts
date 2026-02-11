import { buildHTMLStyles, buildSVGAttrs, camelCaseAttributes, isSVGTag } from 'motion-dom'
import type { HTMLRenderState, SVGRenderState } from 'motion-dom'

function camelToDash(str: string) {
  return str.replace(/([A-Z])/g, match => `-${match.toLowerCase()}`)
}

function createHTMLRenderState(): HTMLRenderState {
  return {
    transform: {},
    transformOrigin: {},
    style: {},
    vars: {},
  }
}

function createSVGRenderState(): SVGRenderState {
  return {
    ...createHTMLRenderState(),
    attrs: {},
  }
}

export function createStyles(latestValues: Record<string, any>): Record<string, any> | null {
  const state = createHTMLRenderState()
  buildHTMLStyles(state, latestValues)
  const result: Record<string, any> = { ...state.style }
  for (const key in state.vars) {
    result[key] = state.vars[key]
  }
  if (Object.keys(result).length === 0) {
    return null
  }
  return result
}

export function createSVGStyles(
  latestValues: Record<string, any>,
  tag: string,
  styleProp?: Record<string, any>,
): { attrs: Record<string, any>, style: Record<string, any> } {
  const state = createSVGRenderState()
  buildSVGAttrs(state, latestValues, isSVGTag(tag), undefined, styleProp)
  // Convert camelCase attr keys to dash-case for SVG (matching renderSVG behavior)
  const attrs: Record<string, any> = {}
  for (const key in state.attrs) {
    const attrKey = camelCaseAttributes.has(key) ? key : camelToDash(key)
    attrs[attrKey] = state.attrs[key]
  }
  return {
    attrs,
    style: { ...state.style, ...state.vars } as Record<string, any>,
  }
}
