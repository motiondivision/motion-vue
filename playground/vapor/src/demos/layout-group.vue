<script setup vapor lang="ts">
import { AnimatePresence, LayoutGroup, Motion } from 'motion-v'
import { ref } from 'vue'

const tabs = [
  { id: 'a', label: 'Alpha', color: '#7b2ff7' },
  { id: 'b', label: 'Beta', color: '#06b6d4' },
  { id: 'c', label: 'Gamma', color: '#f59e0b' },
] as const

const selected = ref<(typeof tabs)[number]['id']>('a')
const expanded = ref(false)
const showLarge = ref(false)

function selectTab(id: (typeof tabs)[number]['id']) {
  selected.value = id
}
</script>

<template>
  <div>
    <p class="lead">
      组件路径：<code>layoutId</code> 共享元素与 <code>LayoutGroup</code>
      协调依赖 context。指令无法参与。
    </p>

    <p class="path-heading">
      <span class="path-chip component">layoutId tab underline</span>
    </p>
    <div class="panel layout-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="tab-btn"
        :class="{ active: selected === tab.id }"
        :data-testid="`tab-${tab.id}`"
        @click="selectTab(tab.id)"
      >
        {{ tab.label }}
        <Motion
          v-if="selected === tab.id"
          layout-id="vapor-underline"
          class="tab-underline"
          :style="{ background: tab.color }"
          :transition="{ type: 'spring', stiffness: 380, damping: 30 }"
        />
      </button>
    </div>

    <p class="path-heading">
      <span class="path-chip component">layoutId shared box</span>
    </p>
    <div class="controls">
      <button
        type="button"
        class="btn primary"
        data-testid="toggle-shared"
        @click="showLarge = !showLarge"
      >
        {{ showLarge ? '切到小块' : '切到大块' }}
      </button>
    </div>
    <div
      class="panel"
      style="position: relative; min-height: 14rem"
    >
      <AnimatePresence>
        <Motion
          v-if="!showLarge"
          key="small"
          layout-id="vapor-shared-box"
          data-testid="shared-small"
          class="box"
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :exit="{ opacity: 0 }"
          :transition="{ duration: 0.35 }"
          style="position: absolute; top: 1.5rem; right: 1.5rem; width: 5rem; height: 5rem"
        >
          Small
        </Motion>
        <Motion
          v-if="showLarge"
          key="large"
          layout-id="vapor-shared-box"
          data-testid="shared-large"
          class="box alt"
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :exit="{ opacity: 0 }"
          :transition="{ duration: 0.35 }"
          style="position: absolute; top: 1.5rem; left: 1.5rem; width: 10rem; height: 10rem"
        >
          Large
        </Motion>
      </AnimatePresence>
    </div>

    <p class="path-heading">
      <span class="path-chip component">LayoutGroup + layout</span>
    </p>
    <div class="controls">
      <button
        type="button"
        class="btn primary"
        data-testid="toggle-expand"
        @click="expanded = !expanded"
      >
        {{ expanded ? '收起卡片' : '展开卡片' }}
      </button>
    </div>
    <LayoutGroup>
      <div
        class="panel"
        style="flex-direction: column; align-items: stretch; gap: 0.75rem"
      >
        <Motion
          layout
          data-testid="layout-card"
          class="layout-card"
          :transition="{ type: 'spring', stiffness: 280, damping: 24 }"
          @click="expanded = !expanded"
        >
          <Motion
            layout="position"
            as="div"
            class="layout-card-title"
          >
            {{ expanded ? '点击收起' : '点击展开（LayoutGroup）' }}
          </Motion>
          <Motion
            v-if="expanded"
            layout
            class="layout-card-body"
            :initial="{ opacity: 0 }"
            :animate="{ opacity: 1 }"
            :transition="{ delay: 0.08 }"
          >
            LayoutGroup 让兄弟节点在尺寸变化时一起做 layout 动画，而不是各自跳动。
          </Motion>
        </Motion>
        <Motion
          layout
          class="layout-card sibling"
          :transition="{ type: 'spring', stiffness: 280, damping: 24 }"
        >
          相邻卡片会跟着让位
        </Motion>
      </div>
    </LayoutGroup>
  </div>
</template>

<style scoped>
.layout-tabs {
  gap: 0.25rem;
  padding: 0.75rem;
}
.tab-btn {
  position: relative;
  flex: 1;
  min-width: 5rem;
  padding: 0.65rem 0.85rem 0.85rem;
  border: 0;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.875rem;
  font-weight: 600;
}
.tab-btn.active {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}
.tab-underline {
  position: absolute;
  left: 0.5rem;
  right: 0.5rem;
  bottom: 0.35rem;
  height: 2px;
  border-radius: 999px;
}
.layout-card {
  padding: 1rem 1.15rem;
  border-radius: 0.875rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(145deg, rgba(123, 47, 247, 0.35), rgba(76, 29, 149, 0.45));
  cursor: pointer;
  color: #fff;
}
.layout-card.sibling {
  background: rgba(255, 255, 255, 0.05);
  cursor: default;
}
.layout-card-title {
  font-weight: 600;
  font-size: 0.95rem;
}
.layout-card-body {
  margin-top: 0.65rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.45;
}
</style>
