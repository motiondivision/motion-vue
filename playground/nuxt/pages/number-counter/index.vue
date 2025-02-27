<script setup lang="tsx">
import { AnimateNumber } from 'motion-number-vue'
import { ref } from 'vue'
import { LayoutGroup, motion } from 'motion-v'
import AdditionIcon from './AdditionIcon.vue'

const props = withDefaults(defineProps<{
  min?: number
  max?: number
}>(), {
  min: -Infinity,
  max: Infinity,
})

const value = ref(0)

function handlePointerDown(delta: number) {
  value.value = Math.min(Math.max(value.value + delta, props.min), props.max)
}

const container = {
  backgroundColor: '#0e1616',
  borderRadius: '1000px',
  padding: '10px 20px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '20px',
  fontFamily: `"Azeret Mono", monospace`,
  color: '#fff',
}

const button = {
  backgroundColor: '#0cdcf733',
  borderRadius: '50px',
  padding: '10px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
}

const number = {
  fontSize: '48px',
  fontVariantNumeric: 'tabular-nums',
}

const buttonProps = {
  initial: {
    boxShadow: '0px 0px 0px 2px #0cdcf700',
  },
  hover: {
    scale: 1.1,
  },
  press: {
    scale: 0.9,
  },
  focus: {
    boxShadow: '0px 0px 0px 2px #0cdcf7ff',
  },
  layout: true,
  style: button,
}
const isVisible = ref(false)
</script>

<template>
  <div class="flex flex-col justify-center items-center h-screen">
    <LayoutGroup>
      <motion.div
        :style="container"
        layout
      >
        <motion.button
          v-bind="buttonProps"
          :disabled="props.min != null && value <= props.min"
          @pointerdown="handlePointerDown(-1)"
        >
          <AdditionIcon type="minus" />
        </motion.button>

        <AnimateNumber
          :style="number"
          :value="value"
        />

        <motion.button
          v-bind="buttonProps"
          :disabled="props.max != null && value >= props.max"
          @pointerdown="handlePointerDown(1)"
        >
          <AdditionIcon type="plus" />
        </motion.button>
      </motion.div>
    </LayoutGroup>
  </div>
</template>
