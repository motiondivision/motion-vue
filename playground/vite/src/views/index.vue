<script setup lang="ts">
import { motion } from 'motion-v'

interface DemoRoute {
  path: string
  name: string
}

interface DemoGroup {
  key: string
  title: string
  routes: DemoRoute[]
}

const GROUP_TITLES: Record<string, string> = {
  'layout': 'Layout 布局',
  'gestures': 'Gestures 手势',
  'drag': 'Drag 拖拽',
  'reorder': 'Reorder 排序',
  'scroll': 'Scroll 滚动',
  'animate-presence': 'AnimatePresence 退场',
  'keepalive': 'KeepAlive 缓存',
  'directive': 'Directive 指令',
  'misc': 'Misc 其他',
}

const modules = import.meta.glob('../views/**/*.vue')

// Mirror the router's path transform, but keep the original file casing so
// PascalCase component files (keepalive/PanelA.vue, [...404].vue) can be excluded
const allRoutes: DemoRoute[] = Object.keys(modules)
  .map(path => path.replace(/^\.\//, '').replace('.vue', ''))
  .filter(file => /^[a-z0-9-]+$/.test(file.split('/').pop()!))
  .map(file => `/${file.replace(/\/index$/, '').toLowerCase()}`)
  .filter(path => path !== '/')
  .sort((a, b) => a.localeCompare(b))

// Keys that own nested routes count as real groups; standalone pages fall into misc
const dirKeys = new Set(
  allRoutes
    .map(path => path.split('/').filter(Boolean))
    .filter(segments => segments.length > 1)
    .map(segments => segments[0]),
)

function groupKeyOf(path: string) {
  const first = path.split('/').filter(Boolean)[0]
  if (first.startsWith('scroll'))
    return 'scroll'
  if (dirKeys.has(first) || (first in GROUP_TITLES && first !== 'misc'))
    return first
  return 'misc'
}

function humanize(path: string, groupKey: string) {
  let name = path.split('/').filter(Boolean).join('-')
  if (name.startsWith(`${groupKey}-`))
    name = name.slice(groupKey.length + 1)
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const groups: DemoGroup[] = Object.keys(GROUP_TITLES)
  .map(key => ({
    key,
    title: GROUP_TITLES[key],
    routes: allRoutes
      .filter(path => groupKeyOf(path) === key)
      .map(path => ({ path, name: humanize(path, key) })),
  }))
  .filter(group => group.routes.length > 0)

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
      :key="group.key"
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
          <router-link
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
            <div class="mt-1 font-mono text-xs text-white/40">
              {{ route.path }}
            </div>
          </router-link>
        </motion.div>
      </motion.div>
    </section>
  </div>
</template>
