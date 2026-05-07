<script setup lang="ts">
import { defineComponent, h, onMounted } from 'vue'
import { MotionConfig, useAnimate } from 'motion-v'

const UseAnimateTarget = defineComponent({
  setup() {
    const [scope, animate] = useAnimate<HTMLDivElement>()

    onMounted(() => {
      animate(scope.value, { opacity: 0.5 }, { duration: 10 })
    })

    return () => h('div', {
      'ref': scope,
      'data-testid': 'skip-animations-target',
      'style': { opacity: 1 },
    })
  },
})
</script>

<template>
  <MotionConfig skip-animations>
    <UseAnimateTarget />
  </MotionConfig>
</template>
