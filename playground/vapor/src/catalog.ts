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
  // —— Supported (both paths) ——
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

  // —— Supported (component path only; directive cannot) ——
  {
    id: 'parent-child-variants',
    title: '父子 Variant 传播',
    titleEn: 'Parent-child variants',
    status: 'supported',
    api: 'component',
    summary: '组件路径：父 <Motion> variant + staggerChildren 可传给子节点。指令路径无组件树，无法传播。',
    detail: 'v-motion 在 vapor 下没有 provide/inject，子元素不会继承父 variant。请用本页的 <Motion> 树演示。',
    load: () => import('./demos/parent-child-variants.vue'),
  },
  {
    id: 'animate-presence',
    title: 'AnimatePresence / exit / usePresence',
    titleEn: 'Presence & exit',
    status: 'unsupported',
    api: 'component',
    summary: 'Tried · broken：vapor 父级 v-if + AnimatePresence 下 exit 立即卸除，动画不播放。指令同样无 presence。',
    detail: '已在 createVaporApp + vaporInteropPlugin 下实测：隐藏后 DOM 约 1 帧内移除，:exit / usePresence 无法挂起。请用 playground/vite（vdom）验证完整 Presence。',
    load: () => import('./demos/animate-presence.vue'),
  },
  {
    id: 'layout-group',
    title: 'LayoutGroup / layoutId 共享布局',
    titleEn: 'Shared layout context',
    status: 'supported',
    api: 'component',
    summary: '组件路径：layoutId 共享元素与 LayoutGroup 协调可用。指令无法参与 layout context。',
    detail: '本页含 tab underline、layoutId 共享盒子、LayoutGroup + layout 展开。',
    load: () => import('./demos/layout-group.vue'),
  },
  {
    id: 'motion-config',
    title: 'MotionConfig 继承',
    titleEn: 'MotionConfig',
    status: 'supported',
    api: 'component',
    summary: '组件路径：MotionConfig 的 reducedMotion / transition 可向下继承。指令读不到 config context。',
    detail: '切换 reducedMotion always/never，观察子 <Motion> 是否跳过动画。',
    load: () => import('./demos/motion-config.vue'),
  },

  // —— Unsupported (directive-only stubs) ——
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
/** Dual-path (v-motion + Motion) supported demos. */
export const supportedBothDemos = supportedDemos.filter(d => !d.api || d.api === 'both')
/** Component-path context features that the directive cannot do. */
export const supportedComponentDemos = supportedDemos.filter(d => d.api === 'component')
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
