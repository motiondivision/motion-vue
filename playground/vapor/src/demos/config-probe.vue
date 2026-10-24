<script setup lang="ts">
import { useMotionConfig } from 'motion-v'
import { computed } from 'vue'

const config = useMotionConfig()
const label = computed(() =>
  `inject: reducedMotion=${config.value.reducedMotion}, transition=${config.value.transition ? 'set' : 'default'}`,
)
</script>

<template>
  <p
    data-testid="config-probe"
    style="margin: 0; font-size: 0.8rem; color: rgba(255,255,255,0.55); font-family: ui-monospace, monospace"
  >
    {{ label }}
  </p>
</template>
