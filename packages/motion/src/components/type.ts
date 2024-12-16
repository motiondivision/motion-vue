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

export interface AnimatePresenceProps {
  // 动画模式: wait(等待前一个完成), popLayout(弹出布局), sync(同步)
  mode?: 'wait'
  | 'popLayout'
  | 'sync'
  // 是否显示初始动画
  initial?: boolean
  // 是否支持多个元素同时动画
  multiple?: boolean
  as?: string
}
