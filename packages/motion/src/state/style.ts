import { buildHTMLStyles, buildSVGAttrs, isSVGTag } from 'motion-dom'
import type { HTMLRenderState, SVGRenderState } from 'motion-dom'

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
  return {
    attrs: state.attrs as Record<string, any>,
    style: { ...state.style, ...state.vars } as Record<string, any>,
  }
}
