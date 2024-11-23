// types.ts
interface SVGRenderState {
  style: Record<string, any>
  transform: Record<string, any>
  transformOrigin: {
    originX?: string | number
    originY?: string | number
    originZ?: string | number
  }
  attrs: Record<string, any>
  dimensions?: {
    x: number
    y: number
    width: number
    height: number
  }
}

interface SVGProps {
  attrX?: number
  attrY?: number
  attrScale?: number
  pathLength?: number
  pathSpacing?: number
  pathOffset?: number
  [key: string]: any
}
