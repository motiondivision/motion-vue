<script setup lang="ts">
const centerContent = ref(true)
</script>

<template>
  <div
    class="w-full h-full flex flex-col bg-gray-800 rounded-lg"
  >
    <div class="sandbox-nav rounded-t-md gap-4  w-full pl-5 p-3 flex place-items-center bg-gray-900">
      <span class="font-semibold">SANDBOX</span>
      <button class="primary-button">
        Replay
      </button>
    </div>
    <div
      :class="{ 'place-items-center justify-center': centerContent }"
      class="flex flex-grow"
    >
      <SandboxContent />
    </div>
  </div>
</template>
