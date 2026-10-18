# Motion for Vue · Vapor Playground

展示 **Vue 3.6 Vapor Mode** 下 `motion-v` 当前可用 / 不可用的能力。

## 要求

- Vue **3.6.0-rc.11+**（本包已钉死；与 `motion-v` 的 vapor 单测一致）
- 使用 `createVaporApp` + `MotionPlugin`（插件在 `app.vapor` 时注册 **函数形态** vapor 指令）
- 使用 `<Motion>` 时需额外 `app.use(vaporInteropPlugin)`（Motion 仍是 vdom 组件）

## 运行

在仓库根目录：

```bash
pnpm play:vapor
# 或
pnpm --filter @motion-vue/playground-vapor dev
```

开发服务器默认：<http://localhost:5174>

## 支持（Supported）

支持区每条能力都尽量同时给出 **v-motion** 与 **`<Motion>`** 演示（页内成对面板 + 目录路径筛选）。

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

## 不支持（Unsupported）

下列条目**主要限制指令路径**；组件 + context（AnimatePresence / LayoutGroup 等）请用 `playground/vite` 验证。本 playground **不**伪造未验证能力。

| 能力 | 主要受限路径 | 原因（简要） |
| --- | --- | --- |
| 父子 variant 传播 | v-motion | vapor 指令无组件树 provide/inject |
| AnimatePresence / exit / usePresence | v-motion | 无 presence context；组件树需另验证 |
| LayoutGroup / layoutId 共享布局 | v-motion | 依赖 LayoutGroup context |
| MotionConfig 继承 | v-motion | 无 config context 桥接 |
| SSR 指令样式 (`getSSRProps`) | v-motion | vapor 函数指令无 SSR hooks |
| 本地 `import { vMotion }` + `withVaporDirectives` | v-motion | 公开 `vMotion` 是 **vdom 对象**指令；请用 `MotionPlugin` |

完整说明见 `docs/agents/architecture.md`（v-motion / vapor 小节）与
`packages/motion/src/directive/vapor.ts` 顶部注释。

## 与 `playground/vite` 的关系

- `playground/vite`：Vue ~3.5 **vdom** 完整示例（含 AnimatePresence、Layout 等）
- `playground/vapor`：仅 vapor 能力矩阵与可运行演示，**不**替换也不破坏 vite playground
