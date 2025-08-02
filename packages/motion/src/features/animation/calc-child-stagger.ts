import type { VisualElement } from 'framer-motion'
import type { DynamicOption } from 'motion-dom'

export function calcChildStagger(
  children: Set<VisualElement>,
  child: VisualElement,
  delayChildren?: number | DynamicOption<number>,
  staggerChildren: number = 0,
  staggerDirection: number = 1,
): number {
  const sortedChildren = Array.from(children).sort((a, b) => a.sortNodePosition(b))
  const index = sortedChildren.indexOf(child)
  const numChildren = children.size
  const maxStaggerDuration = (numChildren - 1) * staggerChildren
  const delayIsFunction = typeof delayChildren === 'function'
  /**
   * parent may not update, so we need to clear the enteringChildren when the child is the last one
   */
  if (index === sortedChildren.length - 1) {
    child.parent.enteringChildren = undefined
  }
  return delayIsFunction
    ? delayChildren(index, numChildren)
    : staggerDirection === 1
      ? index * staggerChildren
      : maxStaggerDuration - index * staggerChildren
}
