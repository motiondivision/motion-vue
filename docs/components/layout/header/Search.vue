<script setup lang="ts">
const isOpen = ref(false)
const { enable } = useConfig().value.search
const duration = 0.7

const commandCenterVariants = {
  pressed: { pathLength: 0.05 },
  checked: { pathLength: 0 },
  unchecked: { pathLength: 1 },
}
const route = useRoute()
watch(() => route.path, (value) => {
  isOpen.value = false
})
</script>

<template>
  <UiButton
    v-if="enable"
    variant="ghost"
    size="icon"
    @click="isOpen = true"
  >
    <Motion
      as="svg"
      width="24"
      height="24"
      viewBox="0 0 25 25"
      fill="none"
      :animate="isOpen ? 'checked' : 'unchecked'"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Motion
        as="path"
        stroke="currentColor"
        d="M18.0713 3.22449C17.2756 3.22449 16.5126 3.54056 15.95 4.10317C15.3874 4.66578 15.0713 5.42884 15.0713 6.22449V18.2245C15.0713 19.0201 15.3874 19.7832 15.95 20.3458C16.5126 20.9084 17.2756 21.2245 18.0713 21.2245C18.8669 21.2245 19.63 20.9084 20.1926 20.3458C20.7552 19.7832 21.0713 19.0201 21.0713 18.2245C21.0713 17.4288 20.7552 16.6658 20.1926 16.1032C19.63 15.5406 18.8669 15.2245 18.0713 15.2245H6.07129C5.27564 15.2245 4.51258 15.5406 3.94997 16.1032C3.38736 16.6658 3.07129 17.4288 3.07129 18.2245C3.07129 19.0201 3.38736 19.7832 3.94997 20.3458C4.51258 20.9084 5.27564 21.2245 6.07129 21.2245C6.86694 21.2245 7.63 20.9084 8.19261 20.3458C8.75522 19.7832 9.07129 19.0201 9.07129 18.2245V6.22449C9.07129 5.42884 8.75522 4.66578 8.19261 4.10317C7.63 3.54056 6.86694 3.22449 6.07129 3.22449C5.27564 3.22449 4.51258 3.54056 3.94997 4.10317C3.38736 4.66578 3.07129 5.42884 3.07129 6.22449C3.07129 7.02014 3.38736 7.7832 3.94997 8.34581C4.51258 8.90842 5.27564 9.22449 6.07129 9.22449H18.0713C18.8669 9.22449 19.63 8.90842 20.1926 8.34581C20.7552 7.7832 21.0713 7.02014 21.0713 6.22449C21.0713 5.42884 20.7552 4.66578 20.1926 4.10317C19.63 3.54056 18.8669 3.22449 18.0713 3.22449Z"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        :initial="{
          pathLength: 1,
        }"
        :variants="commandCenterVariants"
        :transition="{ duration }"
      />
    </Motion>
  </UiButton>
  <LayoutHeaderDialog v-model:open="isOpen" />
</template>
