<script setup lang="tsx">
/** @jsxImportSource vue */
import { AnimateNumber } from 'motion-plus-vue'
import { motion } from 'motion-v'
import { defineComponent, ref } from 'vue'

const monthlyPrice = 19
const yearlyPrice = 199
const isYearly = ref(true)

const Button = defineComponent({
  props: {
    isSelected: {
      type: Boolean,
      required: true,
    },
    onClick: {
      type: Function,
      required: true,
    },
  },
  setup(props, { slots }) {
    return () => (
      <button onClick={props.onClick}>
        <motion.span
          initial={false}
          animate={{
            color: props.isSelected ? 'var(--background)' : 'var(--text)',
            opacity: props.isSelected ? 1 : 0.5,
          }}
        >
          {slots.default?.()}
        </motion.span>
        {props.isSelected && (
          <motion.div
            layoutId="selected"
            class="selected"
            style={{ borderRadius: 25, zIndex: 1 }}
          />
        )}
      </button>
    )
  },
})
</script>

<template>
  <div class="price-switcher">
    <AnimateNumber
      :format="{
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }"
      locales="en-US"
      :suffix="isYearly ? '/yr' : '/mo'"
      class="number"
      :transition="{
        visualDuration: 0.6,
        type: 'spring',
        bounce: 0.25,
        opacity: { duration: 0.2, ease: 'linear' },
      }"
      :value="isYearly ? yearlyPrice : monthlyPrice"
    />
    <div class="switch">
      <Button
        :is-selected="!isYearly"
        :on-click="() => isYearly = false"
      >
        Monthly
      </Button>
      <Button
        :is-selected="isYearly"
        :on-click="() => isYearly = true"
      >
        Yearly
      </Button>
    </div>
  </div>
</template>

<style>
.price-switcher {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
}

.number {
    font-size: 96px;
    letter-spacing: -0.04em;
    font-weight: 530;
    font-variation-settings: "opsz" 30, "wght" 530;
}

.number-section-post {
    font-size: 32px;
    opacity: 0.5;
    position: relative;
    bottom: 15px;
    align-self: flex-end;
    margin-left: 5px;
    letter-spacing: -0.02em;
}

.switch {
    display: flex;
    gap: 10px;
    padding: 6px;
    border-radius: 100px;
    background-color: rgba(255, 255, 255, 0.05);
}

.switch button {
    position: relative;
    padding: 8px 12px;
    display: flex;
}

.switch button span {
    z-index: 2;
    position: relative;
    color: var(--text);
    will-change: opacity;
    font-size: 13px;
    line-height: 1;
    font-variation-settings: "opsz" 20, "wght" 590;
}

.switch .selected {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #f5f5f5;
    will-change: transform;
}
</style>
