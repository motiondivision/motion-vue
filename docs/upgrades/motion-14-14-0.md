# Motion 14.14.0 升级对照

本次对照以 motion-vue `b692563` 为基线，比较上游 [v14.13.0 与 v14.14.0](https://github.com/motiondivision/motion/compare/v14.13.0...v14.14.0)。目标 tag 对应提交 [f95ab9418d9524b906c8681994b95d15cb03d5fc](https://github.com/motiondivision/motion/commit/f95ab9418d9524b906c8681994b95d15cb03d5fc)。本次不修改 motion-v 的版本号。

## 逐项评估

| 上游变化 | 评估 | Vue 对应实现与依据 |
| --- | --- | --- |
| Boolean `fx` marker | 必须跟进 | [上游提交](https://github.com/motiondivision/motion/commit/a6cc8badc963e75df37e443ffeffb747b3753d3f)、[最终 filter-props](https://github.com/motiondivision/motion/blob/v14.14.0/packages/framer-motion/src/render/dom/utils/filter-props.ts) 和 [node types](https://github.com/motiondivision/motion/blob/v14.14.0/packages/motion-dom/src/node/types.ts)。Vue 在 [MotionProps](../../packages/motion/src/components/motion/types.ts) 声明 `fx?: boolean`，在 [runtime props](../../packages/motion/src/components/motion/props.ts) 声明 Boolean 且默认 `undefined`。[component factory](../../packages/motion/src/components/motion/utils.ts) 内的私有 normalizer 统一编码，普通 target 与 `asChild` 均在最终属性合并后输出 marker。 |
| React LazyMotion 异步 hydration 调度 | 无需跟进 | [上游提交](https://github.com/motiondivision/motion/commit/4851330cb0db3622fb0b08b4cb8be7c2a7d8e563) 用 React `startTransition` 包装 provider 更新。Vue [LazyMotion](../../packages/motion/src/components/lazy-motion/index.ts) 始终返回 slot，features 通过 ref 注入，[consumer watcher](../../packages/motion/src/components/motion/use-motion-state.ts) 安装 features。此次保留原实现。 |
| Vue 自身的 pending Suspense hydration 回归 | 建议跟进 | [hydration 测试](../../packages/motion/src/components/lazy-motion/__tests__/hydration.test.ts) 先实例化 `m`，再在独立 async sibling 仍 pending 时解析 features。测试验证服务端节点身份、单一实例、无 hydration 诊断和动画完成。 |
| `framer-motion` 与 `motion-dom` 版本 | 必须跟进 | [上游比较](https://github.com/motiondivision/motion/compare/v14.13.0...v14.14.0) 与 [本地依赖](../../packages/motion/package.json)。两者更新至 `~14.14.0`，lockfile 只更新对应包记录、integrity 与依赖引用。 |
| `motion-utils` 版本 | 已支持 | 上游 14.14.0 保持 14.7.0，本地保持 `~14.7.0`。 |
| `claimTarget` 与 shaders | 无需跟进 | [上游移除提交](https://github.com/motiondivision/motion/commit/94a35e0b3b379f8357253e0d459d811c7ce27023)。最终净变化不包含这两个功能。 |
| 其他内部 exports 与集成路径 | 无需跟进 | 最终净变化没有新增 barrel exports 或 integration 路径。当前构建通过，未新增内部路径适配。 |
| 上游 bundle budgets 与开发元数据 | 无需跟进 | Vue 使用 [自身的九项 budgets](../../packages/motion/package.json)，不复制 React 预算。本次 marker 令四个组件入口增加 32 至 45 gzip 字节，按现有 `suggestedMaxSize` 规则调整这四项预算。五个非组件入口不变，完整数据见下表。 |

## fx 的使用与输出

`fx` 是组件渲染的选择器 marker。启用时输出空属性，关闭或省略时移除属性。Vue 可将 SSR 空属性序列化为裸 `fx`，与 `fx=""` 等价。`fx="false"` 字符串不属于公共 Boolean API。

```vue
<script setup lang="ts">
import { shallowRef } from 'vue'
import { motion } from 'motion-v'

const enabled = shallowRef(true)
</script>

<template>
  <motion.div fx />
  <motion.svg :fx="enabled" />
  <motion.input :fx="false" />
</template>
```

`motion`、`Motion`、`m`、`M`、HTML、SVG 和 self-closing tags 使用同一编码规则。SVG 的原生 `fx` 属性原本接受数值；Motion 组件的公共类型排除原生 `fx`，再应用 Boolean marker 类型。[组件 props 推断](../../packages/motion/src/types/common.ts) 从 Vue 实例的 `$props` 派生，factory 的约束允许实际 `defineComponent` 返回类型，保留自定义 target 的必填属性。严格公开类型测试覆盖这些入口。Reorder Group 与 Item 继承 component factory 的行为，没有重复的 renderer。

`asChild` 保持 child-last 优先级。子 VNode 自有的 `fx: false` 或 `fx: undefined` 会覆盖父级 `fx: true`，并移除 marker。归一化发生在 clone 前，不修改原子 VNode 的 `fx`。

透明 custom target 无论 `forwardMotionProps` 开启与否，均收到归一化后的属性。使用 `inheritAttrs: false` 且不转发 attrs 的 wrapper 可主动丢弃 marker。若 custom component 自己声明 Boolean `fx` prop，则由该组件决定 coercion 与 DOM 输出。

## API 范围与 directive SSR 限制

`fx` 属于 `MotionProps`，与 `asChild`、`forwardMotionProps` 同为组件渲染 metadata。上游 runtime 只在 component `filterProps` 中消费 `fx`，motion-dom 的相关变化是类型声明。因此本次不把 `fx` 加入动画状态 `Options`、directive binding 或 preset API。

原生元素可使用 Vue 自身的属性语法，例如 `<div v-motion :fx="enabled ? '' : null" />`。空字符串添加 marker，`null` 移除 marker。这不是 directive option。

实现过程中，编译式模板 SSR 实验证明了既有 directive 边界。[Vue 3.5.30 的 `ssrGetDirectiveProps`](https://github.com/vuejs/core/blob/v3.5.30/packages/server-renderer/src/helpers/ssrGetDirectiveProps.ts) 调用 `getSSRProps` 时传入空 VNode，hook 无法读取同元素上的原生属性。编译 `<div v-motion="{ initial: { opacity: 0.2 } }" :initial="{ opacity: 0.8 }" />` 时，服务器仍输出 `opacity:0.2`。native props 与 binding 混用的通用 SSR 优先级问题不属于此次 component marker 升级。

最初探索曾把 `fx` 扩展到 directive binding，六项真实编译 SSR 回归暴露了上述边界。根据上游净变化和实验结果，最终范围移除了该新增 API 及其新增测试。既有 directive 实现与基线测试没有改动，也没有新增 compiler transform、Vue runtime patch 或跳过的测试。探索日志保留在本地 `.claude/14-14-green.log` 与 `.claude/14-14-ssr-boundary.log`，其中的失败不计为最终通过。

## 已执行的验证

新增 [组件回归](../../packages/motion/src/components/__tests__/fx.test.ts)、[hydration 回归](../../packages/motion/src/components/lazy-motion/__tests__/hydration.test.ts) 与 [公共类型测试](../../packages/motion/src/components/__tests__/fx.test-d.ts)。[playground fixture](../../playground/vite/src/views/fx.vue) 和 [Playwright 回归](../../tests/fx.spec.ts) 使用构建后的 library。

新增测试先在 14.13 基线上产生真实失败。最初完整探索为 34 failed、15 passed，组件及 hydration 子集为 14 failed、1 passed。完整 RED 输出保存在本地 `.claude/14-14-red.log`。撤回额外 directive API 前的探索另有 70 passed、6 failed，这六项失败没有被计入通过，也没有转为 skip 或 expected failure。

验证环境为 macOS arm64、Node 24.22.1、pnpm 9.15.0。以下命令从仓库根目录执行。`rtk proxy` 直接运行后面的命令。

| 命令 | 实际结果 |
| --- | --- |
| `pnpm build` | exit 0，motion 与 plugins 构建成功，声明生成无 TypeScript 诊断。 |
| `rtk proxy pnpm --filter motion-v exec vitest run --dom` | exit 0，43 个文件通过，330 passed、1 skipped、0 failed。基线为 41 个文件，311 passed、1 skipped。 |
| `rtk proxy pnpm --filter motion-v exec vitest run --typecheck.only --typecheck.tsconfig tsconfig.public-types.json src/components/__tests__/fx.test-d.ts` | exit 0，1 个公开类型测试通过，零类型错误。 |
| `CI=1 rtk proxy pnpm exec playwright test --workers=2 --retries=0 --reporter=line` | exit 0，Chromium 与 WebKit 共 138 项，135 passed、3 skipped、0 failed。 |
| `CI=1 rtk proxy pnpm exec playwright test tests/fx.spec.ts --workers=2 --retries=0 --reporter=line` | 在最终类型修正及重建之后再次运行，exit 0，4 passed、0 skipped、0 failed。 |
| `pnpm size` | 最初 exit 1，8 passed、1 exceeded。按测量调整四项组件预算后 exit 0，9 passed、0 failed。 |
| 变更 TypeScript 与 Vue 文件的 `pnpm exec eslint` | exit 0，无诊断。 |

公开类型检查使用已构建包的 `motion-v` 导出和 [独立严格配置](../../packages/motion/tsconfig.public-types.json)，不把运行时 `expectTypeOf` 当作类型检查。它覆盖 Boolean marker、SVG 类型覆盖、自定义 factory 的 `fx` 与必填 props，以及 Reorder。错误字符串、数字和动画状态 `Options.fx` 均由负向类型断言拒绝。

单元测试的一个既有 skip 位于 [press 测试](../../packages/motion/src/features/gestures/press/__tests__/press.test.ts)。E2E 的三个既有 skip 位于 [animate-view 测试](../../tests/animate-view.spec.ts)，原因是 WebKit 不暴露 View Transition pseudo-element animations。本次没有新增 skip。

## Gzip 体积与预算

[体积脚本](../../packages/motion/vite.size.config.mjs) 独立构建九个生产入口，打包 Motion 依赖，externalize Vue 与 VueUse，再 gzip。[门禁](../../packages/motion/scripts/bundlesize.mjs) 按未取整字节与预算比较，显示的 kB 为字节除以 1024。

| 入口 | 14.13 字节 | 14.14 字节 | 增量 | 14.14 kB | 原预算 kB | 最终预算 kB |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| motion | 47144 | 47189 | +45 | 46.08 | 46.09 | 46.14 |
| m | 5415 | 5447 | +32 | 5.32 | 5.32 | 5.37 |
| m + domAnimation | 31544 | 31581 | +37 | 30.84 | 30.83 | 30.90 |
| m + domMax | 47299 | 47336 | +37 | 46.23 | 46.25 | 46.28 |
| animate | 25460 | 25460 | 0 | 24.86 | 24.93 | 24.93 |
| useAnimate | 25837 | 25837 | 0 | 25.23 | 25.29 | 25.29 |
| scroll | 3830 | 3830 | 0 | 3.74 | 3.81 | 3.81 |
| useScroll | 5558 | 5558 | 0 | 5.43 | 5.48 | 5.48 |
| WAAPI animate | 3236 | 3236 | 0 | 3.16 | 3.18 | 3.18 |

最初失败项为 `m + domAnimation`，31581 字节超过原预算的 31569.92 字节。其他三个组件入口也因 marker 增长而消耗预算余量，其中 `m` 只剩 0.68 字节。最终四项预算采用仓库已有 `suggestedMaxSize` 公式，向上取整到 0.01 kB 后加 0.05 kB。五个非组件入口的产物与预算不变。

## 未解决与未验证的范围

额外运行的默认 source-wide 命令 `rtk proxy pnpm --filter motion-v exec vitest run --typecheck.only src/components/__tests__/fx.test-d.ts` 返回 exit 1。公开测试本身通过，但普通 `tsc` 源码扫描另报 69 个诊断，包含 `.vue` 模块解析、第三方类型和既有测试的 DOM 类型等。最终诊断没有定位到本次新增测试或修改的源码文件。未在 `b692563` 上复测这条命令，因此不声称已证明它们全部是基线问题，也不声称全源码类型检查通过。日志保存在本地 `.claude/14-14-verified-source-types-final.log`。

Motion UI 的 FX canvas renderer 不在此仓库。本次验证 marker 的 DOM、类型、SSR 和 Vue 动画集成，不声称验证 FX renderer 的视觉效果。编译 directive SSR 的通用优先级限制如上所述，未在此次升级中修复。
