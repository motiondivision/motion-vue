<script setup>
const state = ref('initial')

async function handleClick() {
  state.value = 'loading'

  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    state.value = 'success'
    setTimeout(() => {
      state.value = 'initial'
    }, 2000)
  }
  catch (error) {
    console.error('Error:', error)
    state.value = 'initial'
  }
}
</script>

<template>
  <button @click="handleClick">
    <AnimatePresence
      mode="popLayout"
      :initial="false"
    >
      <Motion
        :key="state"
        class="bg-primary aspect-square rounded-2xl"
        :initial="{ opacity: 0, y: 25 }"
        :animate="{ opacity: 1, y: 0 }"
        :exit="{ opacity: 0, y: -25 }"
      >
        {{ state }}
      </Motion>
    </AnimatePresence>
  </button>
</template>
