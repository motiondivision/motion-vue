<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { Reorder } from 'motion-v'

const verticalItems = ref(['A', 'B', 'C', 'D'])
const horizontalItems = ref(['A', 'B', 'C', 'D'])
const verticalMoved = shallowRef('—')
const horizontalMoved = shallowRef('—')

function updateVertical(values: string[], moved: string) {
  verticalItems.value = values
  verticalMoved.value = moved
}

function updateHorizontal(values: string[], moved: string) {
  horizontalItems.value = values
  horizontalMoved.value = moved
}
</script>

<template>
  <main class="min-h-screen bg-[#101112] p-6 text-white sm:p-10">
    <div class="mx-auto max-w-4xl">
      <p class="font-mono text-xs tracking-widest text-[#d9ff63]">
        REORDER · KEYBOARD
      </p>
      <h1 class="mt-3 text-3xl font-semibold tracking-tight">
        键盘排序复现
      </h1>
      <p class="mt-3 max-w-2xl text-sm leading-6 text-white/60">
        聚焦第二项 B，按 Space 抓取，再连续按向上或向左。
        观察第一次反向移动后，抓取状态是否被意外清除。
      </p>

      <section class="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <h2 class="text-lg font-medium">
          操作步骤
        </h2>
        <ol class="mt-3 list-decimal space-y-1 pl-5 text-sm leading-6 text-white/65">
          <li>点击或 Tab 聚焦 B</li>
          <li>按 Space，项目放大并降低透明度</li>
          <li>连续按 ArrowUp / ArrowLeft，再尝试反向移动</li>
          <li>Space 放下，Escape 恢复，失焦放下</li>
        </ol>
      </section>

      <div class="mt-6 grid gap-6 md:grid-cols-2">
        <section class="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 class="font-medium">
            纵向 · axis="y"
          </h2>
          <p class="mt-1 text-xs text-white/50">
            第二项 B 连续 ArrowUp
          </p>
          <p
            class="mt-4 font-mono text-xs text-white/60"
            data-testid="keyboard-y-order"
          >
            {{ verticalItems.join(', ') }}
          </p>
          <p class="mt-1 font-mono text-xs text-[#d9ff63]">
            moved: {{ verticalMoved }}
          </p>
          <Reorder.Group
            :values="verticalItems"
            axis="y"
            class="mt-4 space-y-2"
            @update:values="updateVertical"
          >
            <Reorder.Item
              v-for="item in verticalItems"
              :key="item"
              :value="item"
              :data-testid="`keyboard-y-item-${item}`"
              :while-drag="{ scale: 1.03, opacity: 0.65 }"
              class="cursor-grab rounded-lg border border-white/15 bg-white/[0.07] px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-[#d9ff63]"
            >
              <div class="flex items-center justify-between">
                <span>Item {{ item }}</span>
                <span class="text-xs text-white/35">Space 抓取</span>
              </div>
            </Reorder.Item>
          </Reorder.Group>
        </section>

        <section class="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 class="font-medium">
            横向 · axis="x"
          </h2>
          <p class="mt-1 text-xs text-white/50">
            第二项 B 连续 ArrowLeft
          </p>
          <p
            class="mt-4 font-mono text-xs text-white/60"
            data-testid="keyboard-x-order"
          >
            {{ horizontalItems.join(', ') }}
          </p>
          <p class="mt-1 font-mono text-xs text-[#d9ff63]">
            moved: {{ horizontalMoved }}
          </p>
          <Reorder.Group
            :values="horizontalItems"
            axis="x"
            class="mt-4 flex gap-2"
            @update:values="updateHorizontal"
          >
            <Reorder.Item
              v-for="item in horizontalItems"
              :key="item"
              :value="item"
              :data-testid="`keyboard-x-item-${item}`"
              :while-drag="{ scale: 1.06, opacity: 0.65 }"
              :while-focus="{ opacity: 0.85 }"
              class="min-w-0 flex-1 cursor-grab rounded-lg border border-white/15 bg-white/[0.07] px-2 py-3 text-center outline-none focus-visible:ring-2 focus-visible:ring-[#d9ff63]"
            >
              <span>{{ item }}</span>
              <span class="mt-1 block text-[10px] text-white/35">Space</span>
            </Reorder.Item>
          </Reorder.Group>
        </section>
      </div>
    </div>
  </main>
</template>
