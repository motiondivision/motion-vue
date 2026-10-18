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

| 能力 | 说明 |
| --- | --- |
| `v-motion` initial → animate | 绑定值语法 |
| 响应式绑定更新 | 绑定对象变化驱动动画 |
| 卸载 cleanup | 指令返回的 cleanup → `MotionState.unmount` |
| whileHover / whilePress | 元素级手势，无需 context |
| 基础 drag | 无 LayoutGroup / 外部约束 context |
| spring / transition | 写在绑定值中 |
| MotionPlugin presets | 如 `v-fade-in`（vapor 下同样注册函数指令） |
| `<Motion>` + `vaporInteropPlugin` | 推荐组件路径 |

## 不支持（Unsupported）

| 能力 | 原因（简要） |
| --- | --- |
| 父子 variant 传播 | vapor 指令无组件树 provide/inject |
| AnimatePresence / exit / usePresence | 无 presence context |
| LayoutGroup / layoutId 共享布局 | 依赖 LayoutGroup context |
| MotionConfig 继承 | 无 config context 桥接 |
| SSR 指令样式 (`getSSRProps`) | vapor 函数指令无 SSR hooks |
| 本地 `import { vMotion }` + `withVaporDirectives` | 公开 `vMotion` 是 **vdom 对象**指令；请用 `MotionPlugin` |

完整说明见 `docs/agents/architecture.md`（v-motion / vapor 小节）与
`packages/motion/src/directive/vapor.ts` 顶部注释。

## 与 `playground/vite` 的关系

- `playground/vite`：Vue ~3.5 **vdom** 完整示例（含 AnimatePresence、Layout 等）
- `playground/vapor`：仅 vapor 能力矩阵与可运行演示，**不**替换也不破坏 vite playground
