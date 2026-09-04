<script setup lang="ts">
defineProps<{ size?: number, color?: string }>()
</script>

<template>
  <svg
    :width="size ?? 16"
    :height="size ?? 16"
    viewBox="0 0 16 16"
    fill="none"
    class="spinner"
  >
    <circle
      cx="8"
      cy="8"
      r="7"
      :stroke="color ?? 'currentColor'"
      stroke-opacity="0.25"
      stroke-width="2"
    />
    <path
      d="M15 8a7 7 0 0 0-7-7"
      :stroke="color ?? 'currentColor'"
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>
</template>

<style scoped>
.spinner {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
