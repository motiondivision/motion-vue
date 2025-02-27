<script setup lang="ts">
const { src, title } = defineProps<{
  src: string
  title: string
}>()
</script>

<template>
  <iframe
    :src="src"
    :title="title"
    style="width:100%; height: 500px; border:0; border-radius: 4px; overflow:hidden; margin-top: 20px;"
    allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
    sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts allow-downloads allow-pointer-lock"
  />
</template>
