import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { autoScrollIfNeeded, resetAutoScrollState } from '../auto-scroll'

function mockRect(
  element: Element,
  rect: { top: number, bottom: number, left: number, right: number },
) {
  element.getBoundingClientRect = () => ({
    width: rect.right - rect.left,
    height: rect.bottom - rect.top,
    x: rect.left,
    y: rect.top,
    ...rect,
    toJSON: () => ({}),
  }) as DOMRect
}

function mockScrollProps(
  element: Element,
  props: { scrollHeight?: number, scrollWidth?: number, clientHeight?: number, clientWidth?: number, scrollTop?: number, scrollLeft?: number },
) {
  for (const [key, value] of Object.entries(props)) {
    Object.defineProperty(element, key, { value, writable: true, configurable: true })
  }
}

function setWindowScroll(x: number, y: number) {
  Object.defineProperty(window, 'scrollX', { value: x, configurable: true })
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true })
}

describe('autoScrollIfNeeded', () => {
  let scrollBySpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    scrollBySpy = vi.fn()
    Object.defineProperty(window, 'scrollBy', { value: scrollBySpy, configurable: true, writable: true })
    setWindowScroll(0, 0)
  })

  afterEach(() => {
    document.body.innerHTML = ''
    resetAutoScrollState()
  })

  function createScrollableContainer() {
    const container = document.createElement('div')
    container.style.overflowY = 'auto'
    const group = document.createElement('ul')
    container.appendChild(group)
    document.body.appendChild(container)
    mockRect(container, { top: 0, bottom: 500, left: 0, right: 200 })
    mockScrollProps(container, {
      scrollHeight: 1000,
      clientHeight: 500,
      scrollTop: 0,
      scrollLeft: 0,
    })
    return { container, group }
  }

  it('scrolls a scrollable container when dragging near its bottom edge', () => {
    const { container, group } = createScrollableContainer()

    autoScrollIfNeeded(group, 480, 'y', 5)

    // intensity = 1 - 20/50 = 0.6, amount = 25 * 0.36 = 9
    expect(container.scrollTop).toBeCloseTo(9)
    expect(scrollBySpy).not.toHaveBeenCalled()
  })

  it('does not start scrolling when velocity points away from the edge', () => {
    const { container, group } = createScrollableContainer()

    autoScrollIfNeeded(group, 480, 'y', -5)

    expect(container.scrollTop).toBe(0)
  })

  it('does not scroll outside the threshold zone', () => {
    const { container, group } = createScrollableContainer()

    autoScrollIfNeeded(group, 250, 'y', 5)

    expect(container.scrollTop).toBe(0)
  })

  it('stops scrolling at the initially recorded scroll limit', () => {
    const { container, group } = createScrollableContainer()
    // Already scrolled to the limit recorded on first activation (1000 - 500)
    container.scrollTop = 500

    autoScrollIfNeeded(group, 480, 'y', 5)

    expect(container.scrollTop).toBe(500)
  })

  it('keeps scrolling an active edge regardless of velocity until reset', () => {
    const { container, group } = createScrollableContainer()

    autoScrollIfNeeded(group, 480, 'y', 5)
    const afterFirst = container.scrollTop
    // Edge is active: velocity no longer gates scrolling
    autoScrollIfNeeded(group, 480, 'y', 0)
    expect(container.scrollTop).toBeGreaterThan(afterFirst)

    // After reset, the velocity gate applies again
    resetAutoScrollState()
    const afterReset = container.scrollTop
    autoScrollIfNeeded(group, 480, 'y', 0)
    expect(container.scrollTop).toBe(afterReset)
  })

  describe('document scroll', () => {
    function createPageGroup() {
      const group = document.createElement('ul')
      document.body.appendChild(group)
      mockRect(document.body, { top: 0, bottom: 768, left: 0, right: 1024 })
      mockScrollProps(document.body, { scrollHeight: 2000, clientHeight: 768 })
      return group
    }

    it('scrolls the page when no scrollable ancestor exists', () => {
      const group = createPageGroup()

      autoScrollIfNeeded(group, 740, 'y', 5)

      // intensity = 1 - 28/50 = 0.44, amount = 25 * 0.1936 = 4.84
      expect(scrollBySpy).toHaveBeenCalledWith({ top: expect.closeTo(4.84) })
    })

    it('converts page coordinates to viewport coordinates', () => {
      const group = createPageGroup()
      setWindowScroll(0, 300)

      // Page position 1040 is viewport position 740 — the same edge zone as
      // the previous test, so the scroll amount must match it exactly
      autoScrollIfNeeded(group, 1040, 'y', 5)

      expect(scrollBySpy).toHaveBeenCalledWith({ top: expect.closeTo(4.84) })
    })

    it('scrolls the page horizontally', () => {
      const group = createPageGroup()
      mockRect(document.body, { top: 0, bottom: 768, left: 0, right: 1024 })
      mockScrollProps(document.body, { scrollWidth: 3000, clientWidth: 1024 })

      autoScrollIfNeeded(group, 990, 'x', 5)

      // intensity = 1 - 34/50 = 0.32, amount = 25 * 0.1024 = 2.56
      expect(scrollBySpy).toHaveBeenCalledWith({ left: expect.closeTo(2.56) })
    })
  })
})
