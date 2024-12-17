export function getMotionElement(el: HTMLElement) {
  if (el?.nodeType === 3 || el?.nodeType === 8)
    return getMotionElement(el.nextSibling as HTMLElement)

  return el
}
