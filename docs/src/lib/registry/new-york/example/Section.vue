<script setup lang="tsx">
import { useInView } from 'motion-v'
import { ref } from 'vue'

defineProps<{
  text: string
  bgColor: string
}>()

const sectionRef = ref<HTMLElement | null>(null)
const isInView = useInView(sectionRef as any, { once: true })
</script>

<template>
  <section
    ref="sectionRef"
    :class="`box-border w-full h-[101vh] flex justify-start overflow-hidden p-12 ${bgColor}`"
  >
    <span
      class="block text-[64px] font-bold font-inter text-black/90 tracking-[-4px] transition-all duration-900 ease-[cubic-bezier(0.17,0.55,0.55,1)] delay-500"
      :style="{
        transform: isInView ? 'none' : 'translateX(-200px)',
        opacity: isInView ? 1 : 0,
      }"
    >
      {{ text }}
    </span>
  </section>
</template>
