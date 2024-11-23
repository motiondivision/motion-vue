/**
 * 监听 MotionValue 的事件
 * @param value MotionValue 实例
 * @param event 事件名称
 * @param callback 回调函数
 */
import { onUnmounted } from 'vue'
import type { MotionValue } from 'framer-motion/dom'
import type { MotionValueEventCallbacks } from '@/types'

export function useMotionValueEvent<
  V,
  EventName extends keyof MotionValueEventCallbacks<V>,
>(
  value: MotionValue<V>,
  event: EventName,
  callback: MotionValueEventCallbacks<V>[EventName],
) {
  const unlisten = value.on(event, callback)

  onUnmounted(() => {
    unlisten()
  })

  return unlisten
}
