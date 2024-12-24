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
