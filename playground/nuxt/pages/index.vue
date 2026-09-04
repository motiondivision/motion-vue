<script setup lang="ts">
import { motion } from 'motion-v'

interface DemoRoute {
  path: string
  name: string
  desc: string
}

interface DemoGroup {
  title: string
  routes: DemoRoute[]
}

const groups: DemoGroup[] = [
  {
    title: 'Layout 布局',
    routes: [
      { path: '/layout', name: 'Basic Layout', desc: '布局变化过渡动画' },
      { path: '/flex-layout', name: 'Flex Layout Switch', desc: 'Flex 方向切换' },
      { path: '/scale-correction-z', name: 'Scale Correction', desc: '缩放形变校正' },
      { path: '/layout-id-tabs', name: 'Layout ID Tabs', desc: '共享布局指示器' },
      { path: '/layout-group', name: 'Layout Group', desc: '跨组件布局分组' },
      { path: '/pop-layout', name: 'Pop Layout', desc: '弹出式退出动画' },
      { path: '/share-layout', name: 'Shared Layout', desc: '共享元素过渡' },
      { path: '/reorder-layout', name: 'Reorder Layout', desc: '拖拽排序布局' },
    ],
  },
  {
    title: 'Gestures 手势',
    routes: [
      { path: '/hover', name: 'Hover', desc: '悬停手势' },
      { path: '/press', name: 'Press', desc: '按下手势' },
      { path: '/pan', name: 'Pan', desc: '平移手势' },
      { path: '/drag', name: 'Drag', desc: '拖拽与约束' },
      { path: '/drag-to-reorder-lists', name: 'Drag to Reorder', desc: '拖拽列表排序' },
    ],
  },
  {
    title: 'Scroll 滚动',
    routes: [
      { path: '/scroll-progress', name: 'Scroll Progress', desc: '滚动进度联动' },
      { path: '/in-view', name: 'In View', desc: '进入视口触发' },
    ],
  },
  {
    title: 'Components 组件',
    routes: [
      { path: '/app-card', name: 'App Card', desc: '卡片展开交互' },
      { path: '/animated-tooltip', name: 'Animated Tooltip', desc: '动态提示气泡' },
      { path: '/number-counter', name: 'Number Counter', desc: '数字滚动计数' },
      { path: '/feedback', name: 'Feedback', desc: '反馈状态切换' },
      { path: '/motion-config', name: 'Motion Config', desc: '全局配置' },
    ],
  },
  {
    title: 'Basics 基础',
    routes: [
      { path: '/animate-variants', name: 'Animate Variants', desc: '变体编排动画' },
      { path: '/animate-present-initial', name: 'Presence Initial', desc: '退出初始状态' },
      { path: '/change-style', name: 'Change Style', desc: '样式变更动画' },
      { path: '/preset-directive', name: 'Preset Directive', desc: 'v-motion 预设指令' },
    ],
  },
]

const total = groups.reduce((sum, group) => sum + group.routes.length, 0)

const listVariants = {
  visible: {
    transition: { staggerChildren: 0.04 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 26 },
  },
}
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 pb-24">
    <!-- Intro -->
    <motion.div
      :initial="{ opacity: 0, y: 24 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ type: 'spring', stiffness: 200, damping: 24 }"
      class="py-14"
    >
      <h1 class="text-4xl font-bold tracking-tight">
        动画示例
      </h1>
      <p class="mt-3 text-white/50">
        {{ total }} 个基于 Motion for Vue 构建的交互演示
      </p>
    </motion.div>

    <!-- Groups -->
    <section
      v-for="group in groups"
      :key="group.title"
      class="mb-12"
    >
      <h2 class="mb-4 flex items-center gap-3 text-sm font-medium uppercase tracking-widest text-white/40">
        {{ group.title }}
        <span class="h-px flex-1 bg-white/5" />
      </h2>
      <motion.div
        :variants="listVariants"
        initial="hidden"
        animate="visible"
        class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        <motion.div
          v-for="(route, index) in group.routes"
          :key="route.path"
          :variants="itemVariants"
        >
          <NuxtLink
            :to="route.path"
            class="group flex h-full flex-col rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06]"
          >
            <div class="flex items-start justify-between">
              <span class="font-mono text-xs text-white/25">
                {{ String(index + 1).padStart(2, '0') }}
              </span>
              <span class="text-white/20 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-white/70">
                →
              </span>
            </div>
            <div class="mt-6 font-semibold tracking-tight">
              {{ route.name }}
            </div>
            <div class="mt-1 text-sm text-white/40">
              {{ route.desc }}
            </div>
          </NuxtLink>
        </motion.div>
      </motion.div>
    </section>
  </div>
</template>
