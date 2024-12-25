import { getCurrentInstance, onMounted } from 'vue'

/**
 * Get the actual motion element, skipping text and comment nodes
 * @param el - The HTML element to check
 * @returns The first non-text/comment element
 */
export function getMotionElement(el: HTMLElement) {
  if (el?.nodeType === 3 || el?.nodeType === 8)
    return getMotionElement(el.nextSibling as HTMLElement)

  return el
}

/**
 * Hook to get the motion element of current component instance
 * @returns Function that returns the motion element
 */
export function useMotionElm() {
  const instance = getCurrentInstance().proxy
  const motionElement = {
    value: null as HTMLElement | null,
  }
  onMounted(() => {
    motionElement.value = getMotionElement(instance.$el)
  })

  return motionElement
}
