import type { PresenceContext } from '@/components/animate-presence/presence'

export function isHiddenByPresenceChild(element: HTMLElement | SVGElement, presence?: PresenceContext) {
  for (let el: Element | null = element; el; el = el.parentElement) {
    if ((el as HTMLElement).style?.display === 'none')
      return Boolean(presence?.isChild?.(el))
  }
  return false
}

export function isHidden(element: HTMLElement) {
  return element.style.display === 'none' || (element.offsetParent === null && window.getComputedStyle(element).position !== 'fixed')
}
