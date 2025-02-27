<script setup lang="ts">
defineProps<{
  type: 'plus' | 'minus'
}>()
</script>

<template>
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      v-if="type === 'plus'"
      d="M17 15V8H15V15H8V17H15V24H17V17H24V15H17Z"
      fill="#0CDCF7"
    />
    <path
      v-else
      d="M24 15H8V17H24V15Z"
      fill="#0CDCF7"
    />
  </svg>
</template>
