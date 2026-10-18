# Motion for Vue · Vapor Playground

展示 **Vue 3.6 Vapor Mode** 下 `motion-v` 当前可用 / 不可用的能力。

## 要求

- Vue **3.6.0-rc.11+**（本包已钉死；与 `motion-v` 的 vapor 单测一致）
- 使用 `createVaporApp` + `MotionPlugin`（插件在 `app.vapor` 时注册 **函数形态** vapor 指令）
- 使用 `<Motion>` / AnimatePresence / LayoutGroup / MotionConfig 时需额外 `app.use(vaporInteropPlugin)`（这些仍是 vdom 组件）

## 运行

在仓库根目录：

```bash
pnpm play:vapor
# 或
pnpm --filter @motion-vue/playground-vapor dev
```

开发服务器默认：<http://localhost:5174>

## 双路径支持（v-motion + `<Motion>`）

| 能力 | v-motion | `<Motion>` | 说明 |
| --- | --- | --- | --- |
| initial → animate | ✓ | ✓ | 绑定值 / props |
| 响应式绑定更新 | ✓ | ✓ | 目标值变化驱动动画 |
| 卸载 cleanup | ✓ | ✓ | cleanup / 组件卸载 → `MotionState.unmount` |
| whileHover / whilePress | ✓ | ✓ | 元素级手势，无需 context |
| 基础 drag | ✓ | ✓ | 无 LayoutGroup / 外部约束 context |
| spring / transition | ✓ | ✓ | 写在绑定值或 `:transition` |
| MotionPlugin presets | ✓（指令） | 等价 props | presets 只注册指令；组件用相同 initial/animate 对照 |
| 路径总览 | ✓ | ✓ | 同屏对照入口 |

## 组件路径支持（指令不可）

下列能力依赖 **vdom 组件树 + provide/inject**。vapor 下的 `v-motion` **做不到**；经 `vaporInteropPlugin` 的 `<Motion>` 及相关组件 **可以**，本 playground 有 live demo。

| 能力 | v-motion | `<Motion>` + context | 说明 |
| --- | --- | --- | --- |
| 父子 variant 传播 | ✗ | ✓ | staggerChildren / 子 variants |
| LayoutGroup / layoutId | ✗ | ✓ | 共享布局与协调（已实测） |
| MotionConfig 继承 | ✗ | ✓ | reducedMotion / 默认 transition（已实测；切换 mode 时 remount） |

## 组件路径 Tried · broken

| 能力 | 结果 | 说明 |
| --- | --- | --- |
| AnimatePresence / exit / usePresence | broken under vapor | vapor 父级 `v-if` 时 presence 挂不起 exit；`playground/vite`（vdom）正常 |

## 指令不支持（stubs）

| 能力 | 原因（简要） |
| --- | --- |
| SSR 指令样式 (`getSSRProps`) | vapor 函数指令无 SSR hooks |
| 本地 `import { vMotion }` + `withVaporDirectives` | 公开 `vMotion` 是 **vdom 对象**指令；请用 `MotionPlugin` |

完整说明见 `docs/agents/architecture.md`（v-motion / vapor 小节）与
`packages/motion/src/directive/vapor.ts` 顶部注释。

## 与 `playground/vite` 的关系

- `playground/vite`：Vue ~3.5 **vdom** 完整示例（含更多 AnimatePresence / Layout 变体）
- `playground/vapor`：vapor 能力矩阵 + 可运行演示（含 interop 组件路径 context demos），**不**替换也不破坏 vite playground
