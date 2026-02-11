export function isHidden(element: HTMLElement) {
  return element.style.display === 'none' || element.offsetParent === null
}
