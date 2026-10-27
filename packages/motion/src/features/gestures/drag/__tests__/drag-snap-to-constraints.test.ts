import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/vue'
import { defineComponent, h, nextTick, ref } from 'vue'
import { Motion } from '@/components'
import { nextFrames, pointerDown, pointerMove, pointerUp } from '@/features/gestures/__tests__/utils'

const rects = new Map<string, { left: number, top: number, width: number, height: number }>()
const container = { left: 0, top: 0, width: 200, height: 200 }

beforeEach(() => {
  rects.clear()
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    const r = (this.dataset?.testid && rects.get(this.dataset.testid)) || { left: 0, top: 0, width: 0, height: 0 }
    return {
      x: r.left,
      y: r.top,
      left: r.left,
      top: r.top,
      width: r.width,
      height: r.height,
      right: r.left + r.width,
      bottom: r.top + r.height,
      toJSON: () => ({}),
    } as DOMRect
  })
})

afterEach(() => {
  pointerUp(0, 0)
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('drag: dragSnapToConstraints', () => {
  function setup(props: Record<string, any> = {}) {
    rects.set('container', container)
    rects.set('box', { left: 10, top: 10, width: 50, height: 50 })

    return render(defineComponent({
      setup: () => {
        const containerEl = ref<HTMLElement>()
        return () => h('div', { 'ref': containerEl, 'data-testid': 'container' }, [
          h(Motion, {
            'drag': true,
            'dragConstraints': containerEl.value,
            'dragElastic': 0,
            'dragMomentum': false,
            // Keep the release animation short enough to settle inside a test.
            'dragTransition': { timeConstant: 100 },
            'data-testid': 'box',
            ...props,
          }),
        ])
      },
    }))
  }

  it('leaves the release position untouched when the prop is absent', async () => {
    const wrapper = setup()
    await nextTick()
    const box = wrapper.getByTestId('box')

    pointerDown(box, 0, 0)
    pointerMove(50, 0)
    pointerUp(50, 0)
    await nextFrames(60)

    expect(box.style.transform).toContain('translateX(50px)')
  })

  it('snaps to the nearer constraint edge on release', async () => {
    const wrapper = setup({ dragSnapToConstraints: true })
    await nextTick()
    const box = wrapper.getByTestId('box')

    // 100 sits nearer 140 than -10.
    pointerDown(box, 0, 0)
    pointerMove(100, 0)
    pointerUp(100, 0)

    await vi.waitFor(() => {
      expect(box.style.transform).toContain('translateX(140px)')
    }, { timeout: 3000 })
  })

  it('snaps to the nearer edge when releasing closer to the min side', async () => {
    const wrapper = setup({ dragSnapToConstraints: true })
    await nextTick()
    const box = wrapper.getByTestId('box')

    pointerDown(box, 0, 0)
    pointerMove(30, 0)
    pointerUp(30, 0)

    await vi.waitFor(() => {
      expect(box.style.transform).toContain('translateX(-10px)')
    }, { timeout: 3000 })
  })

  it('snaps only the axes enabled by the prop', async () => {
    const wrapper = setup({ dragSnapToConstraints: 'x' })
    await nextTick()
    const box = wrapper.getByTestId('box')

    pointerDown(box, 0, 0)
    pointerMove(100, 40)
    pointerUp(100, 40)

    await vi.waitFor(() => {
      expect(box.style.transform).toContain('translateX(140px)')
    }, { timeout: 3000 })
    expect(box.style.transform).toContain('translateY(40px)')
  })

  it('lets dragSnapToOrigin win on the axes it covers', async () => {
    const wrapper = setup({ dragSnapToOrigin: true, dragSnapToConstraints: true })
    await nextTick()
    const box = wrapper.getByTestId('box')

    pointerDown(box, 0, 0)
    pointerMove(100, 0)
    pointerUp(100, 0)

    await vi.waitFor(() => {
      expect(box.style.transform).not.toContain('translateX(')
    }, { timeout: 3000 })
  })

  it('does not snap on a click that never became a drag', async () => {
    const wrapper = setup({ dragSnapToConstraints: true })
    await nextTick()
    const box = wrapper.getByTestId('box')

    pointerDown(box, 0, 0)
    pointerUp(0, 0)
    await nextFrames(60)

    expect(box.style.transform).not.toContain('translateX(140px)')
    expect(box.style.transform).not.toContain('translateX(-10px)')
  })

  it('returns an elastic release to the nearest edge', async () => {
    const wrapper = setup({ dragElastic: 0.5, dragSnapToConstraints: true })
    await nextTick()
    const box = wrapper.getByTestId('box')

    // Push 200px past the max edge.
    pointerDown(box, 0, 0)
    pointerMove(340, 0)
    await nextFrames(2)
    pointerUp(340, 0)

    await vi.waitFor(() => {
      expect(box.style.transform).toContain('translateX(140px)')
    }, { timeout: 3000 })
  })

  it('keeps the chosen edge when a click interrupts the snap', async () => {
    const wrapper = setup({ dragSnapToConstraints: true })
    await nextTick()
    const box = wrapper.getByTestId('box')

    pointerDown(box, 0, 0)
    pointerMove(100, 0)
    pointerUp(100, 0)
    await nextFrames(2)

    pointerDown(box, 0, 0)
    pointerUp(0, 0)

    await vi.waitFor(() => {
      expect(box.style.transform).toContain('translateX(140px)')
    }, { timeout: 3000 })
  })
})
