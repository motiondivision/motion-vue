<script setup lang="ts">
import { Motion } from 'motion-v'

const phrases: Ref<string[]> = ref(['you', 'can', 'modify', 'component', '/sandbox', 'to', 'play', 'with', 'motion-v'])
const phraseIndex = ref(0)

function nextPhrase() {
  phraseIndex.value = (phraseIndex.value + 1) % phrases.value.length
}
</script>

<template>
  <div class="flex flex-col gap-2 place-items-center">
    <span>Just A Simple Animation ! 😉</span>
    <Motion
      :animate="{
        backgroundColor: '#ffffff33',
      }"
      :press="{
        scale: 0.8,
        filter: 'blur(15px)',
        backgroundColor: '#ffffff66',
      }"
      class="w-64 h-64 rounded-xl gradient-pink-violet backdrop-blur-sm flex items-center justify-center cursor-pointer"
      @press="nextPhrase"
      @press-cancel="console.log('press-cancel')"
      @press-start="console.log('press-start')"
    >
      <span class="text-white select-none  text-xl font-bold">{{ phrases[phraseIndex] }}</span>
    </Motion>
  </div>
</template>
