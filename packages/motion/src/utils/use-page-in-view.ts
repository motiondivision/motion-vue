import { onMounted, onUnmounted, ref } from 'vue'

export function usePageInView() {
  const isInView = ref(true)

  const handleVisibilityChange = () => {
    isInView.value = !document.hidden
  }

  onMounted(() => {
    if (document.hidden) {
      handleVisibilityChange()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })

  return isInView
}
