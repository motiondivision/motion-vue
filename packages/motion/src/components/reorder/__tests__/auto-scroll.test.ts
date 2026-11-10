import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { frameData } from 'motion-dom'
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
    frameData.delta = 1000 / 60
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

  it('caps scroll speed when the pointer passes either edge', () => {
    const { container, group } = createScrollableContainer()

    autoScrollIfNeeded(group, 600, 'y', 5)
    expect(container.scrollTop).toBe(25)

    container.scrollTop = 25
    autoScrollIfNeeded(group, -100, 'y', -5)
    expect(container.scrollTop).toBe(0)
  })

  it('keeps scroll distance stable across frame rates', () => {
    const { container, group } = createScrollableContainer()
    mockScrollProps(container, { scrollHeight: 100_000 })

    function scrollForOneSecond(fps: number) {
      resetAutoScrollState()
      container.scrollTop = 0
      frameData.delta = 1000 / fps
      for (let i = 0; i < fps; i++)
        autoScrollIfNeeded(group, 490, 'y', 5)
      return container.scrollTop
    }

    const at60 = scrollForOneSecond(60)
    expect(at60).toBeCloseTo(960)
    expect(scrollForOneSecond(120)).toBeCloseTo(at60)
    expect(scrollForOneSecond(30)).toBeCloseTo(at60)
    expect(scrollForOneSecond(240)).toBeCloseTo(at60)
  })

  it('does not double the frame distance across mid-frame updates', () => {
    const { container, group } = createScrollableContainer()

    frameData.delta = 4
    autoScrollIfNeeded(group, 600, 'y', 5)
    frameData.delta = 1000 / 60 - 4
    autoScrollIfNeeded(group, 600, 'y', 5)

    expect(container.scrollTop).toBeCloseTo(25)
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

describe('autoScrollIfNeeded in nested scroll containers', () => {
  afterEach(() => {
    resetAutoScrollState()
    document.body.innerHTML = ''
  })

  function container(scrolls?: 'x' | 'y') {
    const element = document.createElement('div')
    // JSDOM doesn't expand the overflow shorthand
    element.style.overflowX = 'auto'
    element.style.overflowY = 'auto'
    mockRect(element, { top: 0, bottom: 300, left: 0, right: 300 })
    mockScrollProps(element, {
      clientWidth: 300,
      clientHeight: 300,
      scrollWidth: scrolls === 'x' ? 600 : 300,
      scrollHeight: scrolls === 'y' ? 600 : 300,
      scrollLeft: 0,
      scrollTop: 0,
    })
    return element
  }

  /**
   * An outer container that scrolls horizontally, around a column that
   * scrolls vertically. A browser computes the column's overflow-x as
   * auto too, though it has no content to scroll on that axis.
   */
  function nestedContainers() {
    const outer = container('x')
    const column = container('y')
    const group = document.createElement('ul')
    outer.appendChild(column)
    column.appendChild(group)
    document.body.appendChild(outer)
    frameData.delta = 1000 / 60
    return { outer, column, group }
  }

  it('scrolls the nearest ancestor that can scroll on the axis', () => {
    const { outer, column, group } = nestedContainers()

    autoScrollIfNeeded(group, 290, 'x', 1)
    expect(outer.scrollLeft).toBeGreaterThan(0)
    expect(column.scrollLeft).toBe(0)

    autoScrollIfNeeded(group, 290, 'y', 1)
    expect(column.scrollTop).toBeGreaterThan(0)
    expect(outer.scrollTop).toBe(0)
  })

  it('forgets every container it scrolled once the drag ends', () => {
    const { outer, column, group } = nestedContainers()
    const next = container('y')
    const nextGroup = document.createElement('ul')
    next.appendChild(nextGroup)
    outer.appendChild(next)

    autoScrollIfNeeded(group, 290, 'y', 1)
    autoScrollIfNeeded(nextGroup, 100, 'y', 1)
    resetAutoScrollState()

    // The next drag starts by its end, moving away from it
    const scrolled = column.scrollTop
    autoScrollIfNeeded(group, 290, 'y', -1)
    expect(column.scrollTop).toBe(scrolled)
  })
})

describe('autoScrollIfNeeded on both axes of one container', () => {
  afterEach(() => {
    resetAutoScrollState()
    document.body.innerHTML = ''
  })

  function setup() {
    const element = document.createElement('div')
    element.style.overflowX = 'auto'
    element.style.overflowY = 'auto'
    mockRect(element, { top: 0, bottom: 300, left: 0, right: 300 })
    const size = { scrollHeight: 600 }
    const scroll = { left: 0, top: 0 }
    Object.defineProperties(element, {
      clientWidth: { value: 300 },
      clientHeight: { value: 300 },
      scrollWidth: { value: 600 },
      scrollHeight: { get: () => size.scrollHeight },
      scrollLeft: {
        get: () => scroll.left,
        set: value => (scroll.left = value),
      },
      scrollTop: {
        get: () => scroll.top,
        set: value => (scroll.top = value),
      },
    })
    const group = document.createElement('ul')
    element.appendChild(group)
    document.body.appendChild(element)
    frameData.delta = 1000 / 60

    const onDrag = (y: number, velocityY: number) => {
      autoScrollIfNeeded(group, 150, 'x', 0)
      autoScrollIfNeeded(group, y, 'y', velocityY)
    }
    return { element, size, onDrag }
  }

  it('keeps scrolling while the pointer is held at an edge', () => {
    const { element, onDrag } = setup()
    onDrag(290, 1)
    const scrolled = element.scrollTop
    expect(scrolled).toBeGreaterThan(0)

    onDrag(290, 0)
    expect(element.scrollTop).toBeGreaterThan(scrolled)
  })

  it('stops at the scroll limit from when it started scrolling', () => {
    const { element, size, onDrag } = setup()
    for (let i = 0; i < 100; i++) {
      onDrag(299, 1)
      // The dragged item, moved on by the scroll, grows the content
      size.scrollHeight = 600 + element.scrollTop
    }
    expect(element.scrollTop).toBeLessThan(300 + 25)
  })
})
