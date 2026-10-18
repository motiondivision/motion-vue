export type SupportStatus = 'supported' | 'unsupported'

export interface DemoEntry {
  id: string
  title: string
  titleEn: string
  status: SupportStatus
  summary: string
  detail?: string
  /** Dynamic import for live demos; omit for unsupported stubs. */
  load?: () => Promise<{ default: unknown }>
}

export const demos: DemoEntry[] = [
  // —— Supported ——
  {
    id: 'initial-animate',
    title: 'Initial → Animate',
    titleEn: 'Enter animation',
    status: 'supported',
    summary: 'v-motion 绑定值：从 initial 过渡到 animate。',
    detail: 'MotionPlugin + createVaporApp 注册 vapor 函数指令。',
    load: () => import('./demos/initial-animate.vue'),
  },
  {
    id: 'reactive-binding',
    title: '响应式绑定更新',
    titleEn: 'Reactive binding',
    status: 'supported',
    summary: '修改绑定对象中的目标值，动画会跟随更新。',
    load: () => import('./demos/reactive-binding.vue'),
  },
  {
    id: 'gestures',
    title: '手势 whileHover / whilePress',
    titleEn: 'Gestures',
    status: 'supported',
    summary: '元素级手势不依赖 context，vapor 指令可用。',
    load: () => import('./demos/gestures.vue'),
  },
  {
    id: 'drag',
    title: '拖拽 Drag',
    titleEn: 'Drag',
    status: 'supported',
    summary: '基础 drag（无 LayoutGroup / 约束 context）可用。',
    load: () => import('./demos/drag.vue'),
  },
  {
    id: 'spring-transition',
    title: 'Spring / Transition',
    titleEn: 'Springs',
    status: 'supported',
    summary: 'transition 配置写在绑定值里（spring / duration）。',
    load: () => import('./demos/spring-transition.vue'),
  },
  {
    id: 'presets',
    title: 'MotionPlugin 预设指令',
    titleEn: 'Presets',
    status: 'supported',
    summary: '插件 presets（如 v-fade-in）在 vapor 下同样注册函数指令。',
    load: () => import('./demos/presets.vue'),
  },
  {
    id: 'motion-component',
    title: '<Motion> + vaporInteropPlugin',
    titleEn: 'Motion component',
    status: 'supported',
    summary: '推荐的组件路径：Motion 仍是 vdom 组件，经 interop 挂到 vapor。',
    load: () => import('./demos/motion-component.vue'),
  },
  {
    id: 'unmount-cleanup',
    title: '卸载清理',
    titleEn: 'Unmount cleanup',
    status: 'supported',
    summary: '元素移除时指令 cleanup 会 unmount MotionState。',
    load: () => import('./demos/unmount-cleanup.vue'),
  },

  // —— Unsupported ——
  {
    id: 'parent-child-variants',
    title: '父子 Variant 传播',
    titleEn: 'Parent-child variants',
    status: 'unsupported',
    summary: 'vapor 指令无法走组件树 provide/inject，子元素不会继承父 variant。',
    detail: 'vdom 的 <Motion> 树或带 context 的组件路径才支持。',
  },
  {
    id: 'animate-presence',
    title: 'AnimatePresence / exit / usePresence',
    titleEn: 'Presence & exit',
    status: 'unsupported',
    summary: '指令路径没有 presence context，无法做退场动画。',
    detail: 'AnimatePresence 依赖 vdom 组件树；vapor 指令无 instance tree。',
  },
  {
    id: 'layout-group',
    title: 'LayoutGroup / layoutId 共享布局',
    titleEn: 'Shared layout context',
    status: 'unsupported',
    summary: 'LayoutGroup 与 layoutId 跨节点协调依赖 context，vapor 指令不可用。',
  },
  {
    id: 'motion-config',
    title: 'MotionConfig 继承',
    titleEn: 'MotionConfig',
    status: 'unsupported',
    summary: '全局/局部 MotionConfig 无法通过 vapor 指令树向下传递。',
  },
  {
    id: 'ssr-styles',
    title: 'SSR 指令样式 (getSSRProps)',
    titleEn: 'SSR directive styles',
    status: 'unsupported',
    summary: 'vapor 函数指令没有 getSSRProps，服务端不会注入初始样式。',
  },
  {
    id: 'local-vmotion',
    title: '本地 import { vMotion } + withVaporDirectives',
    titleEn: 'Local vMotion without plugin',
    status: 'unsupported',
    summary: '公开导出的 vMotion 是 vdom 对象指令；vapor 需要函数形态。',
    detail: '请用 MotionPlugin（createVaporApp 时自动注册 vapor 指令），不要本地挂 vMotion。',
  },
]

export const supportedDemos = demos.filter(d => d.status === 'supported')
export const unsupportedDemos = demos.filter(d => d.status === 'unsupported')

export function findDemo(id: string | null | undefined) {
  if (!id)
    return undefined
  return demos.find(d => d.id === id)
}
