<script setup lang="ts">
import { ref } from 'vue'
import { Motion, Reorder } from 'motion-v'

/**
 * Reproduction for https://github.com/motiondivision/motion-vue/issues/276
 *
 * Reorder.Group spreads its Vue-cast `initial: false` onto the inner Motion,
 * so Reorder.Items with only `variants` resolve their first render from
 * ['initial', 'animate'] — they render at `visible` and skip the initial
 * animation. framer-motion's Reorder.Group is a plain motion.ul
 * (initial undefined), so items should inherit `hidden` and animate in.
 */
const items = ref([1, 2, 3])

const parentVariants = {
  hidden: {},
  visible: {},
}

const itemVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1 } },
}
</script>

<template>
  <div style="padding: 40px">
    <Motion
      data-testid="parent"
      initial="hidden"
      animate="visible"
      :variants="parentVariants"
    >
      <Reorder.Group v-model:values="items">
        <Reorder.Item
          v-for="item in items"
          :key="item"
          :value="item"
          :variants="itemVariants"
          :data-testid="`reorder-item-${item}`"
          style="width: 100px; height: 40px; margin-top: 10px; background: #4f46e5; color: #fff; list-style: none"
        >
          Item {{ item }}
        </Reorder.Item>
      </Reorder.Group>
    </Motion>
  </div>
</template>
