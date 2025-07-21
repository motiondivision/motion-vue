import { onMounted } from 'vue'
import { useMotionElm } from '@/components/hooks/use-motion-elm'

export const presenceMeasure = new Map<HTMLElement | SVGElement, boolean>()
export function usePresence() {
  const motionElement = useMotionElm()
  onMounted(() => {
    presenceMeasure.set(motionElement.value, true)
  })

  const safeToRemove = () => {
    if (motionElement.value) {
      presenceMeasure.delete(motionElement.value)
    }
  }
}
