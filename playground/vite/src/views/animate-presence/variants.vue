<script setup lang="ts">
import { ref } from 'vue'
import { AnimatePresence, motion, stagger } from 'motion-v'

/**
 * An example of AnimatePresence with exit defined as a variant through a tree.
 */

const isVisible = ref(true)

const style = {
  width: '200px',
  height: '200px',
  background: 'white',
  opacity: 1,
}

const item = {
  width: '100px',
  height: '100px',
  background: 'red',
}

const itemVariants = {
  open: { opacity: 1 },
  closed: { opacity: 0 },
}

const listVariants = {
  open: {
    opacity: 1,
    transition: { delayChildren: stagger(1), when: 'beforeChildren' },
  },
  closed: {
    opacity: 0,
    transition: {
      when: 'afterChildren',
      delayChildren: stagger(0.3, { from: 'last' }),
    },
  },
}
</script>

<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <button
      class="bg-blue-500 mb-8 text-white px-4 py-2 rounded-md"
      @click="isVisible = !isVisible"
    >
      {{ isVisible ? 'Hide' : 'Show' }}
    </button>
    <AnimatePresence
      :initial="false"
    >
      <motion.ul
        v-if="isVisible"
        initial="closed"
        exit="closed"
        animate="open"
        :variants="listVariants"
        :transition="{ duration: 1 }"
        :style="style"
      >
        <motion.li
          :variants="itemVariants"
          :style="item"
        >
          Test
        </motion.li>
        <motion.li
          :variants="itemVariants"
          :style="item"
        >
          Test
        </motion.li>
        <motion.li
          :variants="itemVariants"
          :style="item"
        >
          Test
        </motion.li>
      </motion.ul>
    </AnimatePresence>
  </div>
</template>
