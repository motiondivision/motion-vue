<script setup lang="tsx">
import Section from './Section.vue'

const sections = ['Animate', 'when', 'in', 'view!']
const colors = ['bg-pink-600', 'bg-pink-500', 'bg-purple-500', 'bg-blue-500']
</script>

<template>
  <div class="h-80 -mx-10 overflow-auto">
    <div class="flex flex-col min-h-[90vh] m-0 p-0">
      <Section
        v-for="(text, i) in sections"
        :key="i"
        :text="text"
        :bg-color="colors[i]"
      />
    </div>
  </div>
</template>
