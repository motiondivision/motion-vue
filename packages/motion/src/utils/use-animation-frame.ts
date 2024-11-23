import { onBeforeUpdate, onUnmounted } from 'vue'
import { cancelFrame, frame } from 'framer-motion/dom'
import type { FrameData } from '@/types'

export type FrameCallback = (timestamp: number, delta: number) => void

export function useAnimationFrame(callback: FrameCallback) {
  let initialTimestamp = 0

  const provideTimeSinceStart = ({ timestamp, delta }: FrameData) => {
    if (!initialTimestamp)
      initialTimestamp = timestamp

    callback(timestamp - initialTimestamp, delta)
  }

  const cancel = () => cancelFrame(provideTimeSinceStart)

  onBeforeUpdate(() => {
    cancel()
    frame.update(provideTimeSinceStart, true)
  })

  onUnmounted(() => cancel())

  frame.update(provideTimeSinceStart, true)
}
