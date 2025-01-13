import type { ComponentPublicInstance } from 'vue'

export function getMotionElement(el: HTMLElement) {
  if (el?.nodeType === 3 || el?.nodeType === 8)
    return getMotionElement(el.nextSibling as HTMLElement)

  return el
}

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
