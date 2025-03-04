import { getMotionElement } from '@/components/hooks/use-motion-elm'
import type { ComponentPublicInstance } from 'vue'

/**
 * 检查是否是隐藏的 motion 元素
 * @param instance
 * @returns
 */
export function checkMotionIsHidden(instance: ComponentPublicInstance) {
  const isHidden = getMotionElement(instance.$el)?.style.display === 'none'
  const hasTransition = instance.$.vnode.transition
  return hasTransition && isHidden
}
