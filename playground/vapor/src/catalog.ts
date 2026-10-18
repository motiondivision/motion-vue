export type SupportStatus = 'supported' | 'unsupported'
/** Which API path(s) this card demonstrates or constrains. */
export type ApiPath = 'directive' | 'component' | 'both'

export interface DemoEntry {
  id: string
  title: string
  titleEn: string
  status: SupportStatus
  summary: string
  detail?: string
  /** Which vapor API path this entry primarily covers. */
  api?: ApiPath
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
    api: 'both',
    summary: 'v-motion 绑定值与 <Motion> 组件：从 initial 过渡到 animate。',
    detail: '指令靠 MotionPlugin；组件靠 vaporInteropPlugin。',
    load: () => import('./demos/initial-animate.vue'),
  },
  {
    id: 'reactive-binding',
    title: '响应式绑定更新',
    titleEn: 'Reactive binding',
    status: 'supported',
    api: 'both',
    summary: '修改目标值后，指令绑定与 <Motion> :animate 都会跟随更新。',
    load: () => import('./demos/reactive-binding.vue'),
  },
  {
    id: 'gestures',
    title: '手势 whileHover / whilePress',
    titleEn: 'Gestures',
    status: 'supported',
    api: 'both',
    summary: '元素级手势不依赖 context；v-motion 与 <Motion> 均可。',
    load: () => import('./demos/gestures.vue'),
  },
  {
    id: 'drag',
    title: '拖拽 Drag',
    titleEn: 'Drag',
    status: 'supported',
    api: 'both',
    summary: '基础 drag（无 LayoutGroup / 约束 context）；两条路径都可用。',
    load: () => import('./demos/drag.vue'),
  },
  {
    id: 'spring-transition',
    title: 'Spring / Transition',
    titleEn: 'Springs',
    status: 'supported',
    api: 'both',
    summary: 'transition 写在绑定值或 <Motion> :transition 上（spring / duration）。',
    load: () => import('./demos/spring-transition.vue'),
  },
  {
    id: 'presets',
    title: '预设（指令）与等价组件写法',
    titleEn: 'Presets vs Motion props',
    status: 'supported',
    api: 'both',
    summary: '插件 presets（v-fade-in 等）仅指令；<Motion> 用等价 initial/animate 演示。',
    detail: 'MotionPlugin presets 注册的是函数指令，不是 <Motion> 的 prop。',
    load: () => import('./demos/presets.vue'),
  },
  {
    id: 'unmount-cleanup',
    title: '卸载清理',
    titleEn: 'Unmount cleanup',
    status: 'supported',
    api: 'both',
    summary: '元素移除时指令 cleanup / <Motion> 卸载都会 unmount MotionState。',
    load: () => import('./demos/unmount-cleanup.vue'),
  },
  {
    id: 'motion-component',
    title: '路径总览 · 指令 vs 组件',
    titleEn: 'API paths overview',
    status: 'supported',
    api: 'both',
    summary: '对照：v-motion（MotionPlugin）与 <Motion>（vaporInteropPlugin）同屏演示。',
    detail: '各特性页内也有成对演示；本页是快速入口。',
    load: () => import('./demos/motion-component.vue'),
  },

  // —— Unsupported ——
  {
    id: 'parent-child-variants',
    title: '父子 Variant 传播',
    titleEn: 'Parent-child variants',
    status: 'unsupported',
    api: 'directive',
    summary: 'vapor 指令无法走组件树 provide/inject，子元素不会继承父 variant。',
    detail: '限制主要在指令路径。vdom 的 <Motion> 树（含 vaporInterop 下的组件树）才支持 variant 传播；本 playground 不伪造该能力。',
  },
  {
    id: 'animate-presence',
    title: 'AnimatePresence / exit / usePresence',
    titleEn: 'Presence & exit',
    status: 'unsupported',
    api: 'directive',
    summary: '指令路径没有 presence context，无法做退场动画。',
    detail: 'AnimatePresence 依赖 vdom 组件树与 provide/inject。vapor 指令无 instance tree。Motion + AnimatePresence 经 interop 理论上可走组件树，但本 vapor playground 未将其标为已支持，请用 playground/vite 验证完整行为。',
  },
  {
    id: 'layout-group',
    title: 'LayoutGroup / layoutId 共享布局',
    titleEn: 'Shared layout context',
    status: 'unsupported',
    api: 'directive',
    summary: 'LayoutGroup 与 layoutId 跨节点协调依赖 context，vapor 指令不可用。',
    detail: '指令路径不支持。组件路径（LayoutGroup + Motion）依赖 vdom context；本 playground 不演示也不声称 vapor 下已支持。',
  },
  {
    id: 'motion-config',
    title: 'MotionConfig 继承',
    titleEn: 'MotionConfig',
    status: 'unsupported',
    api: 'directive',
    summary: '全局/局部 MotionConfig 无法通过 vapor 指令树向下传递。',
    detail: '指令路径不支持。组件树内 MotionConfig 继承仍属 vdom/context 能力。',
  },
  {
    id: 'ssr-styles',
    title: 'SSR 指令样式 (getSSRProps)',
    titleEn: 'SSR directive styles',
    status: 'unsupported',
    api: 'directive',
    summary: 'vapor 函数指令没有 getSSRProps，服务端不会注入初始样式。',
    detail: '仅影响指令路径的 SSR；与 <Motion> 组件无关。',
  },
  {
    id: 'local-vmotion',
    title: '本地 import { vMotion } + withVaporDirectives',
    titleEn: 'Local vMotion without plugin',
    status: 'unsupported',
    api: 'directive',
    summary: '公开导出的 vMotion 是 vdom 对象指令；vapor 需要函数形态。',
    detail: '请用 MotionPlugin（createVaporApp 时自动注册 vapor 指令），不要本地挂 vMotion。与 <Motion> 组件无关。',
  },
]

export const supportedDemos = demos.filter(d => d.status === 'supported')
export const unsupportedDemos = demos.filter(d => d.status === 'unsupported')

export function findDemo(id: string | null | undefined) {
  if (!id)
    return undefined
  return demos.find(d => d.id === id)
}

export function apiLabel(api?: ApiPath) {
  if (api === 'directive')
    return 'v-motion'
  if (api === 'component')
    return '<Motion>'
  if (api === 'both')
    return '双路径'
  return ''
}
