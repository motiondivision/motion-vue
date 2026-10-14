import { beforeAll } from 'vitest'

/**
 * jsdom has no PointerEvent; MouseEvent covers the parts the gesture
 * layer reads (clientX/Y, pageX/Y, button, buttons).
 *
 * happy-dom (the actual test env via vitest's --dom flag) doesn't
 * implement pageX/pageY on MouseEvent (always 0), while the gesture
 * layer reads pageX/Y by default — define them from the init, falling
 * back to clientX/Y (tests never scroll, so page === client).
 */
class MockPointerEvent extends MouseEvent {
  pointerId: number
  pointerType: string
  isPrimary: boolean

  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init)
    this.pointerId = init.pointerId ?? 1
    this.pointerType = init.pointerType ?? 'mouse'
    this.isPrimary = init.isPrimary ?? true
    Object.defineProperties(this, {
      pageX: { value: (init as any).pageX ?? init.clientX ?? 0 },
      pageY: { value: (init as any).pageY ?? init.clientY ?? 0 },
    })
  }
}

beforeAll(() => {
  ;(window as any).PointerEvent = MockPointerEvent
})

export function pointerDown(el: Element, x = 0, y = 0) {
  el.dispatchEvent(new MockPointerEvent('pointerdown', {
    bubbles: true,
    clientX: x,
    clientY: y,
    button: 0,
    buttons: 1,
  }) as unknown as PointerEvent)
}

export function pointerMove(x: number, y: number) {
  window.dispatchEvent(new MockPointerEvent('pointermove', {
    clientX: x,
    clientY: y,
    buttons: 1,
  }) as unknown as PointerEvent)
}

/** Dispatched on the window: the normal end of a gesture. */
export function pointerUp(x: number, y: number) {
  window.dispatchEvent(new MockPointerEvent('pointerup', {
    clientX: x,
    clientY: y,
    button: 0,
    buttons: 0,
  }) as unknown as PointerEvent)
}

/** Dispatched on an element so a descendant handler can stopPropagation() it. */
export function pointerUpOn(el: Element, x: number, y: number) {
  el.dispatchEvent(new MockPointerEvent('pointerup', {
    bubbles: true,
    clientX: x,
    clientY: y,
    button: 0,
    buttons: 0,
  }) as unknown as PointerEvent)
}

export const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve))

export async function nextFrames(n = 2) {
  for (let i = 0; i < n; i++) await nextFrame()
}
