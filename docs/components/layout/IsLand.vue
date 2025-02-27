<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useScroll } from 'motion-v'
import NumberFlow from '@number-flow/vue'
import { onClickOutside } from '@vueuse/core'

const { activeHeadings, updateHeadings } = useScrollspy()
const { toc, page } = useContent()

onMounted(() =>
  updateHeadings([
    ...document.querySelectorAll('.docs-content h1'),
    ...document.querySelectorAll('.docs-content h2'),
    ...document.querySelectorAll('.docs-content h3'),
    ...document.querySelectorAll('.docs-content h4'),
  ]),
)
const open = ref(false)
const scrollPercentage = ref(0)
const { scrollYProgress } = useScroll()

useMotionValueEvent(scrollYProgress, 'change', (value) => {
  scrollPercentage.value = value
})

const content = ref(null)
onClickOutside(content, () => {
  open.value = false
})
</script>

<template>
  <div>
    <AnimatePresence>
      <Motion
        v-if="open"
        class="fixed inset-0 z-[100] bg-white/50 backdrop-blur"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
      />
    </AnimatePresence>
    <Motion
      ref="content"
      :layout="true"
      :initial="{
        borderRadius: '32px',
        padding: '8px',
        width: '220px',
        opacity: 0.85,
      }"
      :animate="{
        width: open ? '280px' : '220px',
        opacity: open ? 1 : 0.85,
      }"
      :transition="{ type: 'spring', bounce: 0.3 }"
      class="bg-neutral-900  z-[101] text-neutral-50 fixed bottom-10 left-1/2 -translate-x-1/2 overflow-hidden shadow-md"
    >
      <Motion
        class="overflow-hidden"
        :style="{
          pointerEvents: open ? 'auto' : 'none',
          opacity: 0,
          height: 0,
        }"
        :animate="{
          opacity: open ? 1 : 0,
          filter: `blur(${open ? 0 : 8}px)`,
          height: open ? 'auto' : 0,
        }"
      >
        <ol
          class="px-4 min-w-[320px] pt-4 pb-8 flex flex-col gap-2"
        >
          <li
            v-for="link in toc.links"
            :key="link.id"
            :class="[activeHeadings.includes(link.id) && 'text-white']"
            class="text-muted-foreground hover:text-white transition-colors list-item list-[pad-it] ml-5"
            @click="open = false"
          >
            <NuxtLink
              :to="`#${link.id}`"
              class="transition-all"
            >
              {{ link.text }}
            </NuxtLink>
          </li>
        </ol>
      </Motion>

      <button
        class="flex items-center gap-10 justify-between w-full "
        @click="open = !open"
      >
        <Motion
          :animate="{
            x: open ? 12 : 0,
            y: open ? -12 : 0,
          }"
          class="flex items-center gap-1 justify-between w-full"
          :transition="{ type: 'spring', bounce: 0.3 }"
        >
          <div class="flex items-center gap-1">
            <svg
              class="size-8 -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="35"
                stroke-width="15"
                fill="none"
                class="stroke-neutral-500"
              />
              <Motion
                as="circle"
                cx="50"
                cy="50"
                r="35"
                stroke-width="15"
                stroke-dashoffset="0"
                fill="none"
                path-length="1"
                :style="{ pathLength: scrollYProgress }"
                class="stroke-neutral-50"
                stroke-linecap="round"
              />
            </svg>
            <span class="font-semibold ml-1 whitespace-nowrap text-xs">{{ page.title }}</span>
            <Icon
              name="i-heroicons-chevron-down"
              class="size-4 transition-transform duration-300"
              :class="open ? 'rotate-180' : 'rotate-0'"
            />
          </div>
          <Motion
            :animate="{
              x: open ? -30 : 0,
            }"
            :transition="{ type: 'spring', bounce: 0.3 }"
          >
            <NumberFlow
              :value="scrollPercentage"
              :format="{ style: 'percent' }"
              locales="en-US"
            />
          </Motion>
        </Motion>
      </button>
    </Motion>
  </div>
</template>
