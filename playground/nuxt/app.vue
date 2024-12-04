<script setup lang="ts">
import { Motion, useAnimate } from 'motion-v'

const custom = ref(100)
const variants = {
  invisible: {
    opacity: 0,
  },
  visible: (custom: number) => ({
    opacity: 1,
    transition: { delay: custom * 0.2 },
  }),
}
const [scope, animate] = useAnimate<HTMLUListElement>()
onMounted(() => {
  animate('li', {
    x: 100,
  })
})
</script>

<template>
  <Motion as-child>
    <div>13</div>
  </Motion>
  <ul>
    <li>123</li>
    <li>123</li>
    <li>123</li>
    <li>123</li>
  </ul>
  <Motion
    ref="scope"
    as="ul"
    initial="invisible"
    animate="visible"
    class="pl-20 mt-20"
  >
    <Motion
      as="li"
      :custom="0"
      :variants="variants"
      class="w-10 h-10 bg-red-500"
    />
    <Motion
      as="li"
      :custom="1"
      :variants="variants"
      class="w-10 h-10 bg-red-500"
    />
    <Motion
      as="li"
      :custom="2"
      :variants="variants"
      class="w-10 h-10 bg-red-500"
    />
  </Motion>
</template>
