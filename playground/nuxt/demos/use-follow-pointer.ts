import { onMounted, onUnmounted } from 'vue'
import { motionValue, useSpring } from 'motion-v'

const spring = { damping: 3, stiffness: 50, restDelta: 0.001 }

export function useFollowPointer(elementRef: Ref<any>) {
  const xPoint = motionValue(0)
  const yPoint = motionValue(0)

  const x = useSpring(xPoint, spring)
  const y = useSpring(yPoint, spring)

  const handlePointerMove = ({ clientX, clientY }: MouseEvent) => {
    const element = elementRef.value.$el
    if (!element)
      return

    requestAnimationFrame(() => {
      xPoint.set(clientX - element.offsetLeft - element.offsetWidth / 2)
      yPoint.set(clientY - element.offsetTop - element.offsetHeight / 2)
    })
  }

  onMounted(() => {
    window.addEventListener('pointermove', handlePointerMove)
  })

  onUnmounted(() => {
    window.removeEventListener('pointermove', handlePointerMove)
  })

  return { y, x }
}
